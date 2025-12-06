import { CSVUploader } from '@/components/upload/CSVUploader';

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Statement</h1>
        <p className="text-muted-foreground mt-1">
          Import transactions from your bank statement
        </p>
      </div>

      <CSVUploader />
    </div>
  );
}
