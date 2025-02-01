import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ProcessingStatus } from './components/ProcessingStatus';
import { ResultsDisplay } from './components/ResultsDisplay';
import { PDFProcessor } from './utils/pdfProcessor';
import { FinancialData, ProcessingStatus as ProcessingStatusType } from './types';
import { FileText } from 'lucide-react';

function App() {
  const [pdfProcessor, setPdfProcessor] = useState<PDFProcessor | null>(null);
  const [status, setStatus] = useState<ProcessingStatusType>({
    isProcessing: false,
    progress: 0,
    stage: 'idle'
  });
  const [results, setResults] = useState<FinancialData | null>(null);

  useEffect(() => {
    const initProcessor = async () => {
      const processor = new PDFProcessor();
      await processor.initialize();
      setPdfProcessor(processor);
    };

    initProcessor();

    return () => {
      if (pdfProcessor) {
        pdfProcessor.cleanup();
      }
    };
  }, []);

  const handleFileSelect = async (file: File) => {
    if (!pdfProcessor) return;

    setStatus({
      isProcessing: true,
      progress: 0,
      stage: 'loading'
    });
    setResults(null);

    try {
      const data = await pdfProcessor.processPDF(file, (progress) => {
        setStatus(prev => ({
          ...prev,
          progress,
          stage: progress < 50 ? 'extracting' : 'analyzing'
        }));
      });

      setResults(data);
      setStatus({
        isProcessing: false,
        progress: 100,
        stage: 'complete'
      });
    } catch (error) {
      setStatus({
        isProcessing: false,
        progress: 0,
        stage: 'error',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Financial Report Extractor
          </h1>
          <p className="text-gray-600">
            Upload a financial report PDF to extract key metrics automatically
          </p>
        </div>

        <FileUpload
          onFileSelect={handleFileSelect}
          disabled={status.isProcessing}
        />

        <ProcessingStatus status={status} />
        
        <ResultsDisplay data={results} />
      </div>
    </div>
  );
}

export default App;