import React from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full">
      <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer 
        ${disabled ? 'bg-gray-100 border-gray-300' : 'border-blue-300 hover:bg-blue-50'}`}>
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="w-8 h-8 mb-2 text-gray-500" />
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PDF files only</p>
        </div>
        <input
          type="file"
          className="hidden"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </label>
    </div>
  );
};