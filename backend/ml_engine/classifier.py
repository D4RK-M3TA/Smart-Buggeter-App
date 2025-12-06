import os
import joblib
import numpy as np
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from django.conf import settings


class TransactionClassifier:
    def __init__(self):
        self.model = None
        self.is_loaded = False
        self.model_path = Path(settings.ML_MODEL_PATH) / 'transaction_classifier.joblib'
        self.categories = settings.TRANSACTION_CATEGORIES
    
    def build_model(self):
        self.model = Pipeline([
            ('tfidf', TfidfVectorizer(
                max_features=5000,
                ngram_range=(1, 2),
                stop_words='english',
                lowercase=True
            )),
            ('classifier', LogisticRegression(
                max_iter=1000,
                multi_class='multinomial',
                solver='lbfgs',
                class_weight='balanced'
            ))
        ])
        return self.model
    
    def train(self, descriptions, categories):
        if self.model is None:
            self.build_model()
        
        X_train, X_test, y_train, y_test = train_test_split(
            descriptions, categories, test_size=0.2, random_state=42
        )
        
        self.model.fit(X_train, y_train)
        
        train_score = self.model.score(X_train, y_train)
        test_score = self.model.score(X_test, y_test)
        
        return {
            'train_accuracy': train_score,
            'test_accuracy': test_score,
            'samples_trained': len(X_train),
            'samples_tested': len(X_test)
        }
    
    def save_model(self):
        if self.model is None:
            raise ValueError("No model to save. Train or load a model first.")
        
        os.makedirs(self.model_path.parent, exist_ok=True)
        joblib.dump(self.model, self.model_path)
        return str(self.model_path)
    
    def load_model(self):
        if self.model_path.exists():
            self.model = joblib.load(self.model_path)
            self.is_loaded = True
            return True
        return False
    
    def predict(self, description):
        if self.model is None:
            return None, 0.0
        
        try:
            prediction = self.model.predict([description])[0]
            probabilities = self.model.predict_proba([description])[0]
            confidence = float(max(probabilities))
            return prediction, confidence
        except Exception:
            return None, 0.0
    
    def predict_batch(self, descriptions):
        if self.model is None:
            return [(None, 0.0) for _ in descriptions]
        
        try:
            predictions = self.model.predict(descriptions)
            probabilities = self.model.predict_proba(descriptions)
            confidences = [float(max(prob)) for prob in probabilities]
            return list(zip(predictions, confidences))
        except Exception:
            return [(None, 0.0) for _ in descriptions]
    
    def get_feature_importance(self, category, top_n=10):
        if self.model is None:
            return []
        
        try:
            tfidf = self.model.named_steps['tfidf']
            clf = self.model.named_steps['classifier']
            
            feature_names = tfidf.get_feature_names_out()
            
            if category in clf.classes_:
                category_idx = list(clf.classes_).index(category)
                coefficients = clf.coef_[category_idx]
                
                top_indices = np.argsort(coefficients)[-top_n:][::-1]
                
                return [
                    {'feature': feature_names[i], 'importance': float(coefficients[i])}
                    for i in top_indices
                ]
        except Exception:
            pass
        
        return []


def get_training_data():
    training_data = [
        ("WALMART GROCERY", "groceries"),
        ("KROGER", "groceries"),
        ("WHOLE FOODS MARKET", "groceries"),
        ("TRADER JOES", "groceries"),
        ("SAFEWAY", "groceries"),
        ("COSTCO WHSE", "groceries"),
        ("TARGET", "shopping"),
        ("AMAZON.COM", "shopping"),
        ("BEST BUY", "shopping"),
        ("MACYS", "shopping"),
        ("NORDSTROM", "shopping"),
        ("MCDONALDS", "dining"),
        ("STARBUCKS", "dining"),
        ("CHIPOTLE", "dining"),
        ("SUBWAY", "dining"),
        ("DOMINOS PIZZA", "dining"),
        ("UBER EATS", "dining"),
        ("DOORDASH", "dining"),
        ("GRUBHUB", "dining"),
        ("SHELL OIL", "transportation"),
        ("CHEVRON", "transportation"),
        ("UBER TRIP", "transportation"),
        ("LYFT", "transportation"),
        ("PARKING", "transportation"),
        ("TOLL", "transportation"),
        ("ELECTRIC COMPANY", "utilities"),
        ("GAS COMPANY", "utilities"),
        ("WATER UTILITY", "utilities"),
        ("INTERNET PROVIDER", "utilities"),
        ("PHONE BILL", "utilities"),
        ("NETFLIX", "subscriptions"),
        ("SPOTIFY", "subscriptions"),
        ("HULU", "subscriptions"),
        ("AMAZON PRIME", "subscriptions"),
        ("DISNEY PLUS", "subscriptions"),
        ("GYM MEMBERSHIP", "subscriptions"),
        ("AMC THEATRES", "entertainment"),
        ("REGAL CINEMA", "entertainment"),
        ("CONCERT TICKETS", "entertainment"),
        ("TICKETMASTER", "entertainment"),
        ("CVS PHARMACY", "healthcare"),
        ("WALGREENS", "healthcare"),
        ("DOCTOR", "healthcare"),
        ("HOSPITAL", "healthcare"),
        ("DENTAL", "healthcare"),
        ("INSURANCE PREMIUM", "healthcare"),
        ("AIRLINE", "travel"),
        ("HOTEL", "travel"),
        ("AIRBNB", "travel"),
        ("EXPEDIA", "travel"),
        ("BOOKING.COM", "travel"),
        ("PAYCHECK", "income"),
        ("DIRECT DEPOSIT", "income"),
        ("SALARY", "income"),
        ("TAX REFUND", "income"),
        ("INTEREST PAYMENT", "income"),
        ("DIVIDEND", "income"),
        ("TRANSFER FROM", "transfer"),
        ("TRANSFER TO", "transfer"),
        ("VENMO", "transfer"),
        ("ZELLE", "transfer"),
        ("PAYPAL TRANSFER", "transfer"),
        ("ATM FEE", "fees"),
        ("OVERDRAFT FEE", "fees"),
        ("SERVICE CHARGE", "fees"),
        ("MONTHLY FEE", "fees"),
        ("LATE FEE", "fees"),
    ]
    
    augmented_data = []
    for desc, cat in training_data:
        augmented_data.append((desc, cat))
        augmented_data.append((desc.lower(), cat))
        augmented_data.append((f"POS {desc}", cat))
        augmented_data.append((f"PURCHASE {desc}", cat))
        augmented_data.append((f"DEBIT {desc}", cat))
        augmented_data.append((f"{desc} #1234", cat))
    
    descriptions = [d[0] for d in augmented_data]
    categories = [d[1] for d in augmented_data]
    
    return descriptions, categories


def train_initial_model():
    classifier = TransactionClassifier()
    descriptions, categories = get_training_data()
    
    results = classifier.train(descriptions, categories)
    classifier.save_model()
    
    return results
