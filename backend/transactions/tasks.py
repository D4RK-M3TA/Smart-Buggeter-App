import csv
import io
import hashlib
from datetime import datetime
from decimal import Decimal
from celery import shared_task
from django.utils import timezone
import pdfplumber


@shared_task(bind=True, max_retries=3)
def process_statement_upload(self, upload_id):
    from .models import StatementUpload, Transaction, Category
    from ml_engine.classifier import TransactionClassifier
    
    try:
        upload = StatementUpload.objects.get(id=upload_id)
        upload.status = 'processing'
        upload.save()
        
        if upload.file_type == 'csv':
            transactions_data = parse_csv_statement(upload.file.path)
        elif upload.file_type == 'pdf':
            transactions_data = parse_pdf_statement(upload.file.path)
        else:
            raise ValueError(f"Unsupported file type: {upload.file_type}")
        
        classifier = TransactionClassifier()
        classifier.load_model()
        
        created_count = 0
        for tx_data in transactions_data:
            hash_input = f"{upload.user_id}:{tx_data['date']}:{tx_data['description']}:{tx_data['amount']}:{tx_data['transaction_type']}"
            idempotency_hash = hashlib.sha256(hash_input.encode()).hexdigest()
            
            if Transaction.objects.filter(idempotency_hash=idempotency_hash).exists():
                continue
            
            category = None
            ml_category = None
            ml_confidence = None
            
            if classifier.is_loaded:
                predicted_category, confidence = classifier.predict(tx_data['description'])
                if predicted_category:
                    ml_category = Category.objects.filter(
                        name__iexact=predicted_category,
                        is_system=True
                    ).first()
                    ml_confidence = confidence
                    if confidence > 0.7:
                        category = ml_category
            
            Transaction.objects.create(
                user=upload.user,
                date=tx_data['date'],
                description=tx_data['description'],
                amount=tx_data['amount'],
                transaction_type=tx_data['transaction_type'],
                category=category,
                ml_category=ml_category,
                ml_confidence=ml_confidence,
                source_file=upload,
                idempotency_hash=idempotency_hash
            )
            created_count += 1
        
        upload.status = 'completed'
        upload.transactions_count = created_count
        upload.processed_at = timezone.now()
        upload.save()
        
        detect_recurring_patterns.delay(str(upload.user_id))
        
        return {'status': 'success', 'transactions_created': created_count}
        
    except Exception as e:
        upload.status = 'failed'
        upload.error_message = str(e)
        upload.save()
        raise self.retry(exc=e, countdown=60)


def parse_csv_statement(file_path):
    transactions = []
    
    with open(file_path, 'r', encoding='utf-8-sig') as f:
        content = f.read()
    
    lines = content.strip().split('\n')
    if not lines:
        return transactions
    
    reader = csv.DictReader(io.StringIO(content))
    
    date_columns = ['date', 'transaction_date', 'posted_date', 'Date', 'Transaction Date']
    desc_columns = ['description', 'memo', 'name', 'merchant', 'Description', 'Memo', 'Name']
    amount_columns = ['amount', 'Amount', 'Value']
    debit_columns = ['debit', 'withdrawal', 'Debit', 'Withdrawal']
    credit_columns = ['credit', 'deposit', 'Credit', 'Deposit']
    
    fieldnames = reader.fieldnames or []
    
    date_col = next((c for c in fieldnames if c in date_columns), None)
    desc_col = next((c for c in fieldnames if c in desc_columns), None)
    amount_col = next((c for c in fieldnames if c in amount_columns), None)
    debit_col = next((c for c in fieldnames if c in debit_columns), None)
    credit_col = next((c for c in fieldnames if c in credit_columns), None)
    
    for row in reader:
        try:
            date_str = row.get(date_col, '')
            date = parse_date(date_str)
            if not date:
                continue
            
            description = row.get(desc_col, '') or ''
            if not description:
                continue
            
            if amount_col and row.get(amount_col):
                amount_str = row[amount_col].replace('$', '').replace(',', '').strip()
                amount = Decimal(amount_str.replace('(', '-').replace(')', ''))
                transaction_type = 'debit' if amount < 0 else 'credit'
                amount = abs(amount)
            elif debit_col and credit_col:
                debit = row.get(debit_col, '').replace('$', '').replace(',', '').strip()
                credit = row.get(credit_col, '').replace('$', '').replace(',', '').strip()
                
                if debit and debit != '0':
                    amount = Decimal(debit)
                    transaction_type = 'debit'
                elif credit and credit != '0':
                    amount = Decimal(credit)
                    transaction_type = 'credit'
                else:
                    continue
            else:
                continue
            
            transactions.append({
                'date': date,
                'description': description.strip(),
                'amount': amount,
                'transaction_type': transaction_type
            })
        except (ValueError, KeyError):
            continue
    
    return transactions


def parse_pdf_statement(file_path):
    transactions = []
    
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ''
            lines = text.split('\n')
            
            for line in lines:
                tx = extract_transaction_from_line(line)
                if tx:
                    transactions.append(tx)
    
    return transactions


def extract_transaction_from_line(line):
    import re
    
    date_patterns = [
        r'(\d{1,2}/\d{1,2}/\d{2,4})',
        r'(\d{4}-\d{2}-\d{2})',
        r'(\w{3}\s+\d{1,2},?\s+\d{4})',
    ]
    
    amount_pattern = r'\$?([\d,]+\.?\d{0,2})'
    
    date = None
    for pattern in date_patterns:
        match = re.search(pattern, line)
        if match:
            date = parse_date(match.group(1))
            if date:
                break
    
    if not date:
        return None
    
    amounts = re.findall(amount_pattern, line)
    if not amounts:
        return None
    
    amount_str = amounts[-1].replace(',', '')
    try:
        amount = Decimal(amount_str)
    except:
        return None
    
    description = re.sub(r'\$?[\d,]+\.?\d{0,2}', '', line)
    for pattern in date_patterns:
        description = re.sub(pattern, '', description)
    description = ' '.join(description.split()).strip()
    
    if len(description) < 3:
        return None
    
    transaction_type = 'credit' if any(word in line.lower() for word in ['deposit', 'credit', 'payment received']) else 'debit'
    
    return {
        'date': date,
        'description': description,
        'amount': amount,
        'transaction_type': transaction_type
    }


def parse_date(date_str):
    formats = [
        '%m/%d/%Y', '%m/%d/%y', '%Y-%m-%d', '%d/%m/%Y',
        '%b %d, %Y', '%B %d, %Y', '%d-%m-%Y', '%Y/%m/%d'
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt).date()
        except ValueError:
            continue
    
    return None


@shared_task
def detect_recurring_patterns(user_id):
    from .models import Transaction, RecurringPattern
    from django.db.models import Avg, Count
    from collections import defaultdict
    import re
    
    transactions = Transaction.objects.filter(
        user_id=user_id,
        transaction_type='debit'
    ).order_by('date')
    
    grouped = defaultdict(list)
    for tx in transactions:
        normalized = normalize_description(tx.description)
        grouped[normalized].append(tx)
    
    for pattern, txs in grouped.items():
        if len(txs) < 2:
            continue
        
        dates = sorted([tx.date for tx in txs])
        intervals = [(dates[i+1] - dates[i]).days for i in range(len(dates)-1)]
        
        if not intervals:
            continue
        
        avg_interval = sum(intervals) / len(intervals)
        
        frequency = None
        if 5 <= avg_interval <= 9:
            frequency = 'weekly'
        elif 12 <= avg_interval <= 16:
            frequency = 'biweekly'
        elif 25 <= avg_interval <= 35:
            frequency = 'monthly'
        elif 85 <= avg_interval <= 100:
            frequency = 'quarterly'
        elif 350 <= avg_interval <= 380:
            frequency = 'yearly'
        
        if not frequency:
            continue
        
        avg_amount = sum(tx.amount for tx in txs) / len(txs)
        
        RecurringPattern.objects.update_or_create(
            user_id=user_id,
            description_pattern=pattern,
            defaults={
                'merchant_name': extract_merchant_name(pattern),
                'average_amount': avg_amount,
                'frequency': frequency,
                'category': txs[0].category,
                'last_occurrence': dates[-1],
                'is_active': True
            }
        )
        
        Transaction.objects.filter(id__in=[tx.id for tx in txs]).update(
            is_recurring=True,
            recurring_group=pattern
        )


def normalize_description(description):
    import re
    
    text = description.lower()
    text = re.sub(r'\d{4,}', '', text)
    text = re.sub(r'#\d+', '', text)
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    
    return text[:50] if text else description[:50].lower()


def extract_merchant_name(description):
    parts = description.split()
    if parts:
        return ' '.join(parts[:3]).title()
    return description.title()


@shared_task
def send_budget_alerts():
    from budgets.models import Budget, BudgetAlert
    from accounts.models import User
    from django.db.models import Sum
    from datetime import date
    
    today = date.today()
    
    budgets = Budget.objects.filter(
        is_active=True,
        start_date__lte=today,
        end_date__gte=today
    ).select_related('user', 'category')
    
    for budget in budgets:
        spent = Transaction.objects.filter(
            user=budget.user,
            category=budget.category,
            transaction_type='debit',
            date__gte=budget.start_date,
            date__lte=today
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        percentage = (spent / budget.amount) * 100 if budget.amount > 0 else 0
        
        user_threshold = budget.user.preferences.budget_alert_threshold if hasattr(budget.user, 'preferences') else 80
        
        if percentage >= user_threshold:
            BudgetAlert.objects.get_or_create(
                budget=budget,
                alert_type='threshold' if percentage < 100 else 'exceeded',
                defaults={
                    'message': f"Budget for {budget.category.name}: {percentage:.1f}% used (${spent:.2f} of ${budget.amount:.2f})",
                    'percentage': percentage
                }
            )
