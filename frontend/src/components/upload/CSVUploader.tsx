import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Upload, FileText, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  suggestedCategory: string;
  confidence: number;
}

export function CSVUploader() {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedTransaction[]>([]);

  const simulateUpload = async (file: File) => {
    setStatus('uploading');
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 100));
      setProgress(i);
    }

    setStatus('processing');
    await new Promise(r => setTimeout(r, 1500));

    // Mock parsed data
    const mockParsed: ParsedTransaction[] = [
      { date: '2024-12-05', description: 'WHOLE FOODS MKT', amount: -127.43, suggestedCategory: 'Food & Dining', confidence: 0.94 },
      { date: '2024-12-04', description: 'UBER TRIP', amount: -24.50, suggestedCategory: 'Transportation', confidence: 0.89 },
      { date: '2024-12-04', description: 'AMZN MKTP US', amount: -89.99, suggestedCategory: 'Shopping', confidence: 0.78 },
      { date: '2024-12-03', description: 'SHELL OIL', amount: -52.30, suggestedCategory: 'Transportation', confidence: 0.91 },
      { date: '2024-12-03', description: 'PAYROLL DEPOSIT', amount: 4250.00, suggestedCategory: 'Income', confidence: 0.97 },
    ];

    setParsedData(mockParsed);
    setStatus('success');
    toast({
      title: 'File processed successfully',
      description: `${mockParsed.length} transactions parsed and categorized.`,
    });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      simulateUpload(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  const resetUploader = () => {
    setStatus('idle');
    setProgress(0);
    setParsedData([]);
  };

  if (status === 'success' && parsedData.length > 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <Check className="h-5 w-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold">Transactions Parsed</h3>
              <p className="text-sm text-muted-foreground">
                {parsedData.length} transactions ready to import
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={resetUploader}>
            Upload Another
          </Button>
        </div>

        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {parsedData.map((tx, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-4 py-3 font-mono text-sm text-muted-foreground">
                    {tx.date}
                  </td>
                  <td className="px-4 py-3 text-sm">{tx.description}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{tx.suggestedCategory}</span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(tx.confidence * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className={cn(
                    'px-4 py-3 text-right font-mono text-sm',
                    tx.amount > 0 ? 'text-success' : 'text-foreground'
                  )}>
                    {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline">Review & Edit</Button>
          <Button>Import All Transactions</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all',
          isDragActive && 'border-primary bg-primary/5',
          status === 'idle' && 'border-border hover:border-primary/50 hover:bg-muted/50',
          (status === 'uploading' || status === 'processing') && 'border-primary/50 bg-primary/5 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} disabled={status !== 'idle'} />
        
        {status === 'idle' && (
          <>
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? 'Drop your file here' : 'Upload Bank Statement'}
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag & drop your CSV file here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supports CSV files from most major banks
            </p>
          </>
        )}

        {(status === 'uploading' || status === 'processing') && (
          <>
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              {status === 'uploading' ? (
                <FileText className="h-8 w-8 text-primary" />
              ) : (
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {status === 'uploading' ? 'Uploading...' : 'Processing & Categorizing...'}
            </h3>
            {status === 'uploading' && (
              <div className="max-w-xs mx-auto">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">{progress}%</p>
              </div>
            )}
            {status === 'processing' && (
              <p className="text-muted-foreground">
                AI is analyzing and categorizing your transactions...
              </p>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-muted/50 border">
          <h4 className="font-medium mb-1">Automatic Parsing</h4>
          <p className="text-sm text-muted-foreground">
            We detect date, description, and amount columns automatically
          </p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50 border">
          <h4 className="font-medium mb-1">AI Categorization</h4>
          <p className="text-sm text-muted-foreground">
            Transactions are categorized using machine learning
          </p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50 border">
          <h4 className="font-medium mb-1">Duplicate Detection</h4>
          <p className="text-sm text-muted-foreground">
            We prevent duplicate imports automatically
          </p>
        </div>
      </div>
    </div>
  );
}
