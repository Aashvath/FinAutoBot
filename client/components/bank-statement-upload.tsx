"use client"

import { useState, useRef } from "react"
import { Upload, X, Loader } from "lucide-react"

interface BankStatementUploadProps {
  onClose: () => void
  onSuccess?: (filename: string, eventInfo?: { eventName: string, reasoning: string }) => void
}

export function BankStatementUpload({ onClose, onSuccess }: BankStatementUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);
    setUploadError(null);
    
    // Simulate upload progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) clearInterval(progressInterval);
        return Math.min(prev + 10, 90);
      });
    }, 300);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:3000/hello', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Upload successful:', data);
      
      // Extract event detection info if available
      let eventInfo = undefined;
      if (data.analysis_result && 
          data.analysis_result.event_detection && 
          data.analysis_result.event_detection.eventName) {
        eventInfo = {
          eventName: data.analysis_result.event_detection.eventName,
          reasoning: data.analysis_result.event_detection.reasoning || "No reasoning provided"
        };
        console.log('Event detected:', eventInfo);
      }
      
      // Complete the progress animation
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Small delay to show completed progress
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(file.name, eventInfo);
        }
      }, 500);
    } catch (error) {
      console.error('Error uploading file:', error);
      clearInterval(progressInterval);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      // Don't immediately set isUploading to false - let animation complete
      if (uploadError) {
        setIsUploading(false);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full h-full">
      <div className="bg-gray-900 border border-indigo-900/30 rounded-lg shadow-xl w-full p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Upload Bank Statement</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            disabled={isUploading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="my-6">
          <div className="border-2 border-dashed border-indigo-600/30 rounded-lg p-8 text-center">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".pdf,.csv,.xlsx,.xls" 
              disabled={isUploading}
            />
            
            {fileName ? (
              <div className="text-indigo-200">
                <p className="mb-2">Selected file:</p>
                <p className="font-medium text-white">{fileName}</p>
                
                {isUploading && (
                  <div className="mt-4">
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-200 bg-indigo-800">
                            {uploadProgress < 100 ? 'Uploading...' : 'Complete!'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-indigo-200">
                            {uploadProgress}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-900">
                        <div 
                          style={{ width: `${uploadProgress}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                        ></div>
                      </div>
                    </div>
                    
                    {uploadProgress < 100 && (
                      <div className="flex justify-center items-center mt-2">
                        <Loader className="h-5 w-5 text-indigo-400 animate-spin mr-2" />
                        <span className="text-sm text-indigo-300">Processing your statement...</span>
                      </div>
                    )}
                  </div>
                )}
                
                {uploadError && (
                  <div className="mt-3 p-2 bg-red-900/30 border border-red-700/30 rounded-md text-red-300 text-sm">
                    {uploadError}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400">
                <Upload className="h-12 w-12 mx-auto mb-4 text-indigo-500" />
                <p className="mb-2">Drag and drop your bank statement here</p>
                <p className="text-sm">or</p>
              </div>
            )}
            
            {!fileName && (
              <button 
                onClick={triggerFileInput}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
                disabled={isUploading}
              >
                Browse Files
              </button>
            )}
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          Supported formats: CSV, PDF, Excel (.xlsx, .xls)
        </div>
      </div>
    </div>
  );
}

