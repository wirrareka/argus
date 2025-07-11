import React, { useState, useRef } from 'react';

interface FileDropZoneProps {
  onFilesSelected?: (files: FileList) => void;
  acceptedTypes?: string;
  multiple?: boolean;
  maxSize?: number; // v MB
}

export const DropZone: React.FC<FileDropZoneProps> = ({
  onFilesSelected,
  acceptedTypes = "*",
  multiple = true,
  maxSize = 10
}: FileDropZoneProps) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter - 1 === 0) {
      setIsDragActive(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setDragCounter(0);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    // Validácia veľkosti súborov
    const validFiles = Array.from(files).filter(file => {
      const fileSizeMB = file.size / (1024 * 1024);
      return fileSizeMB <= maxSize;
    });

    if (validFiles.length !== files.length) {
      alert(`Niektoré súbory sú väčšie ako ${maxSize}MB a boli preskočené.`);
    }

    if (validFiles.length > 0 && onFilesSelected) {
      const fileList = new DataTransfer();
      validFiles.forEach(file => fileList.items.add(file));
      onFilesSelected(fileList.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto ">
      <div
        className={`
          w-full h-[400px]
          border-2 border-dashed 
          rounded-lg 
          flex flex-col items-center justify-center 
          cursor-pointer 
          transition-all duration-200 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${isDragActive
          ? 'border-blue-400 bg-blue-50 text-blue-600'
          : 'border-gray-300 bg-gray-50 text-gray-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600'
        }
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        tabIndex={0}
        role="button"
        aria-label="Plocha pre nahranie súborov"
      >
        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        {isDragActive ? (
          <>
            <p className="text-lg font-medium mb-2">Pustite súbor tu</p>
          </>
        ) : (
          <>
            <p className="text-lg font-medium mb-2">Potiahnite súbor sem</p>
            <p className="text-sm mb-1">alebo kliknite pre výber súboru</p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        multiple={multiple}
        accept={acceptedTypes}
      />
    </div>
  );
};
