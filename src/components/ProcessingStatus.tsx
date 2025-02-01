import React from 'react';
import { ProcessingStatus as ProcessingStatusType } from '../types';
import { Loader2 } from 'lucide-react';

interface ProcessingStatusProps {
  status: ProcessingStatusType;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ status }) => {
  const getStatusMessage = () => {
    switch (status.stage) {
      case 'loading':
        return 'Loading PDF file...';
      case 'extracting':
        return 'Extracting text from PDF...';
      case 'analyzing':
        return 'Analyzing financial data...';
      case 'complete':
        return 'Processing complete!';
      case 'error':
        return `Error: ${status.error}`;
      default:
        return 'Ready to process';
    }
  };

  if (status.stage === 'idle') return null;

  return (
    <div className="w-full p-4 rounded-lg bg-gray-50">
      <div className="flex items-center space-x-3">
        {status.isProcessing && (
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        )}
        <span className="text-sm font-medium text-gray-700">
          {getStatusMessage()}
        </span>
      </div>
      {status.isProcessing && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${status.progress}%` }}
          />
        </div>
      )}
    </div>
  );
};