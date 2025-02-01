export interface FinancialData {
  revenue: number | null;
  operatingProfit: number | null;
  netProfit: number | null;
}

export interface ProcessingStatus {
  isProcessing: boolean;
  progress: number;
  stage: 'idle' | 'loading' | 'extracting' | 'analyzing' | 'complete' | 'error';
  error?: string;
}