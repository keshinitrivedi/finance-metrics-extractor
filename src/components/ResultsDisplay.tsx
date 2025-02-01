import React from 'react';
import { FinancialData } from '../types';

interface ResultsDisplayProps {
  data: FinancialData | null;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data }) => {
  if (!data) return null;

  const formatValue = (value: number | null) => {
    if (value === null) return 'Not found';
    return `₹ ${value} Lakhs or other Units`;
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Extracted Financial Data</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded">
          <span className="font-medium">Revenue/Sales:</span>
          <span className="text-right">{formatValue(data.revenue)}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded">
          <span className="font-medium">Operating Profit:</span>
          <span className="text-right">{formatValue(data.operatingProfit)}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded">
          <span className="font-medium">Net Profit:</span>
          <span className="text-right">{formatValue(data.netProfit)}</span>
        </div>
      </div>
    </div>
  );
};