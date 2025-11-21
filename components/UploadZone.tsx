import React, { useState } from 'react';
import { UploadCloud, FileText } from 'lucide-react';

interface UploadZoneProps {
  title: string;
  description: string;
  onFileSelect: (content: string, fileName: string) => void;
  accept?: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ title, description, onFileSelect, accept = ".csv,.txt" }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        onFileSelect(text, file.name);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-xl mx-auto animate-fade-in-up">
      <div 
        className={`
          relative flex flex-col items-center justify-center w-full h-64 
          border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 scale-105 shadow-xl' 
            : 'border-gray-300 bg-white hover:bg-gray-50 hover:border-blue-400 shadow-sm'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <div className={`p-4 rounded-full mb-3 ${isDragging ? 'bg-blue-200' : 'bg-gray-100'}`}>
            <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
          <p className="mb-2 text-xl font-bold text-gray-700">{title}</p>
          <p className="mb-4 text-sm text-gray-500">{description}</p>
          <p className="text-xs text-gray-400">Hỗ trợ: .csv, .txt</p>
        </div>
        <input 
          id="file-upload" 
          type="file" 
          className="hidden" 
          accept={accept} 
          onChange={handleInputChange} 
        />
      </div>

      <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h4 className="font-semibold text-blue-800 text-sm flex items-center gap-2 mb-2">
          <FileText size={16} />
          Định dạng hỗ trợ
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Cách 1: Chỉ MSSV (txt/csv)</p>
            <div className="bg-white p-2 rounded border border-blue-100 font-mono text-xs text-gray-600">
              2011001<br/>
              2011002<br/>
              2011003
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Cách 2: CSV đầy đủ</p>
            <div className="bg-white p-2 rounded border border-blue-100 font-mono text-xs text-gray-600">
              MSSV,Họ Tên,Ngành<br/>
              2011001,Nguyen A,CNTT
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};