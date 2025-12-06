import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Upload, FileText, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { transactionsAPI } from '@/services/api';

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export function CSVUploader() {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleUpload = async (file: File) => {
    setStatus('uploading');
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await transactionsAPI.upload(file);
      clearInterval(progressInterval);
      setProgress(100);

      if (response.data.id) {
        setUploadId(response.data.id);
        setStatus('processing');
        
        // Poll for completion
        const checkStatus = async () => {
          try {
            // In a real app, you'd poll the upload status endpoint
            // For now, we'll wait a bit and then mark as success
            setTimeout(() => {
              setStatus('success');
              queryClient.invalidateQueries({ queryKey: ['transactions'] });
              toast.success('File uploaded successfully', {
                description: `Processing ${response.data.transactions_count || 0} transactions.`,
              });
            }, 2000);
          } catch (error) {
            setStatus('error');
            toast.error('Error checking upload status');
          }
        };

        checkStatus();
      } else {
        setStatus('success');
        toast.success('File uploaded successfully');
      }
    } catch (error: any) {
      setStatus('error');
      const errorMsg = error.response?.data?.error || 'Upload failed';
      toast.error('Upload failed', { description: errorMsg });
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      handleUpload(file);
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
    setUploadId(null);
  };

  if (status === 'success') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <Check className="h-5 w-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold">File Uploaded Successfully</h3>
              <p className="text-sm text-muted-foreground">
                Your statement is being processed. Transactions will appear shortly.
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={resetUploader}>
            Upload Another
          </Button>
        </div>
        <div className="rounded-lg border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Check the Transactions page to see your imported transactions once processing is complete.
          </p>
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
