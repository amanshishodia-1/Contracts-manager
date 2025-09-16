import React, { useState, useRef } from 'react';
import { X, Upload, AlertCircle, CheckCircle, FileText, Calendar, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { documentsAPI } from '../../services/api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState({
    contract_name: '',
    parties: '',
    expiry_date: '',
  });
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF, TXT, or DOCX file');
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }
    
    setFile(selectedFile);
    setError('');
    
    // Auto-fill contract name from filename
    const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
    setMetadata(prev => ({
      ...prev,
      contract_name: prev.contract_name || nameWithoutExt,
    }));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMetadata(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }
    
    if (!metadata.contract_name.trim()) {
      setError('Please enter a contract name');
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      await documentsAPI.upload(
        file, 
        metadata.contract_name,
        metadata.parties ? metadata.parties.split(',').map(p => p.trim()) : [],
        metadata.expiry_date || undefined
      );
      onUploadSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Upload error:', err);
      const errorMessage = err?.response?.data?.detail || err?.message || 'Upload failed. Please try again.';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setMetadata({ contract_name: '', parties: '', expiry_date: '' });
    setError('');
    setUploading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-large animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-secondary-200/50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
              <Upload className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-secondary-900">Upload Contract</h3>
              <p className="text-sm text-secondary-600">Add a new contract to your collection</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg p-2 transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload Area */}
          <div
            className={`
              border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
              ${dragActive 
                ? 'border-primary-400 bg-primary-50 scale-[1.02]' 
                : file 
                  ? 'border-success-400 bg-success-50' 
                  : 'border-secondary-300 hover:border-primary-300 hover:bg-primary-50/30'
              }
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.txt,.docx"
              onChange={handleFileInputChange}
            />
            
            {file ? (
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 bg-success-100 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-success-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-success-900 mb-1">{file.name}</p>
                  <p className="text-sm text-success-700">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to upload
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 bg-secondary-100 rounded-2xl flex items-center justify-center">
                  <Upload className="h-8 w-8 text-secondary-500" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-secondary-900 mb-2">
                    Drop your contract here
                  </p>
                  <p className="text-sm text-secondary-600 mb-4">
                    or <span className="font-semibold text-primary-600">browse files</span>
                  </p>
                  <div className="flex items-center justify-center space-x-6 text-xs text-secondary-500">
                    <span className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      PDF, TXT, DOCX
                    </span>
                    <span>Max 10MB</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Metadata Fields */}
          <div className="space-y-5">
            <Input
              label="Contract Name"
              name="contract_name"
              type="text"
              required
              icon={<FileText className="h-5 w-5" />}
              value={metadata.contract_name}
              onChange={handleMetadataChange}
              placeholder="Enter contract name"
            />
            
            <Input
              label="Parties (Optional)"
              name="parties"
              type="text"
              icon={<Users className="h-5 w-5" />}
              value={metadata.parties}
              onChange={handleMetadataChange}
              placeholder="e.g., Company A, Company B"
            />
            
            <Input
              label="Expiry Date (Optional)"
              name="expiry_date"
              type="date"
              icon={<Calendar className="h-5 w-5" />}
              value={metadata.expiry_date}
              onChange={handleMetadataChange}
            />
          </div>

          {error && (
            <div className="flex items-center space-x-3 p-4 bg-danger-50 border border-danger-200 rounded-xl text-danger-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={uploading}
              disabled={!file}
              className="flex-1"
            >
              {uploading ? 'Uploading...' : 'Upload Contract'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
