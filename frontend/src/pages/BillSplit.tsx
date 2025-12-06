import { BillSplitManager } from '@/components/split/BillSplitManager';

export default function BillSplitPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bill Splitting</h1>
        <p className="text-muted-foreground mt-1">
          Split expenses with friends and track who owes what
        </p>
      </div>

      <BillSplitManager />
    </div>
  );
}
