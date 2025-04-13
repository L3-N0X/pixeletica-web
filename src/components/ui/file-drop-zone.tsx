import * as React from 'react';
import { cn } from '@/lib/utils';

interface FileDropZoneProps extends React.HTMLAttributes<HTMLDivElement> {
  onFilesDrop: (files: File[]) => void;
  acceptedFileTypes?: string[];
  maxFiles?: number;
  className?: string;
  children?: React.ReactNode;
}

export function FileDropZone({
  onFilesDrop,
  acceptedFileTypes = ['image/*'],
  maxFiles = 1,
  className,
  children,
  ...props
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragEnter = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFiles = (files: File[]): File[] => {
    if (maxFiles && files.length > maxFiles) {
      files = files.slice(0, maxFiles);
    }

    if (acceptedFileTypes?.length) {
      files = files.filter((file) => {
        const fileType = file.type;
        return acceptedFileTypes.some((type) => {
          // Handle wildcards like image/*
          if (type.endsWith('/*')) {
            const category = type.split('/')[0];
            return fileType.startsWith(`${category}/`);
          }
          return type === fileType;
        });
      });
    }

    return files;
  };

  const handleDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      const { files } = event.dataTransfer;
      if (files && files.length > 0) {
        const fileList = Array.from(files);
        const validFiles = validateFiles(fileList);
        onFilesDrop(validFiles);
      }
    },
    [onFilesDrop]
  );

  const handleFileInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = event.target;
      if (files && files.length > 0) {
        const fileList = Array.from(files);
        const validFiles = validateFiles(fileList);
        onFilesDrop(validFiles);
      }
    },
    [onFilesDrop]
  );

  const handleClick = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 transition-colors cursor-pointer',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-primary/50',
        className
      )}
      {...props}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFileTypes.join(',')}
        onChange={handleFileInputChange}
        multiple={maxFiles !== 1}
        className="sr-only"
      />
      {children}
    </div>
  );
}
