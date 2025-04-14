import React from 'react';
import { ImSpinner8 } from 'react-icons/im';

interface LoadingOverlayProps {
  message?: string;
  progress?: number;
  isOpen: boolean;
}

export function LoadingOverlay({
  message = 'Processing your image...',
  progress,
  isOpen,
}: LoadingOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="bg-card border rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <ImSpinner8 className="h-12 w-12 animate-spin text-primary" />
            {progress !== undefined && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-semibold">{progress}%</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">{message}</h3>
            <p className="text-sm text-muted-foreground">
              Please don't close this page until the conversion is complete. This may take a few
              seconds depending on the image size.
            </p>
          </div>

          {progress !== undefined && (
            <div className="w-full bg-muted rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
