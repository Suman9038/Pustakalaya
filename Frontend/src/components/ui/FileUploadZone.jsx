import { useState, useRef } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { gsap } from '../../lib/gsap';

export default function FileUploadZone({ onFileSelect, selectedFile, onClear }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dropRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  if (selectedFile) {
    return (
      <div
        className="flex items-center justify-between p-4 rounded-xl"
        style={{
          background: 'var(--color-elevated)',
          border: '1px solid var(--border-hover)',
        }}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: '40px', height: '40px', background: 'var(--color-amber-ghost)', color: 'var(--color-amber)' }}
          >
            <FileIcon size={20} />
          </div>
          <div className="overflow-hidden">
            <p className="font-sans text-sm font-medium truncate" style={{ color: 'var(--color-text-1)' }}>
              {selectedFile.name}
            </p>
            <p className="font-sans text-xs" style={{ color: 'var(--color-text-3)' }}>
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="cursor-pointer p-2 rounded-full transition-colors"
          style={{ color: 'var(--color-text-3)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-error)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-3)')}
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={dropRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex flex-col items-center justify-center p-8 text-center rounded-xl transition-all cursor-pointer overflow-hidden"
      style={{
        border: `2px dashed ${isDragOver ? 'var(--color-amber)' : 'var(--border-hover)'}`,
        background: isDragOver ? 'var(--color-elevated)' : 'var(--color-card)',
        minHeight: '200px',
      }}
      onMouseEnter={(e) => {
        if (!isDragOver) {
          e.currentTarget.style.borderColor = 'var(--color-amber)';
          e.currentTarget.style.boxShadow = 'inset 0 0 40px var(--color-amber-ghost)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragOver) {
          e.currentTarget.style.borderColor = 'var(--border-hover)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
      onClick={() => document.getElementById('file-upload').click()}
    >
      <input
        id="file-upload"
        type="file"
        accept=".pdf,.epub,.docx,application/pdf,application/epub+zip,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={handleChange}
      />
      
      <div
        className="mb-4 p-4 rounded-full transition-transform"
        style={{
          background: 'var(--color-amber-ghost)',
          color: 'var(--color-amber)',
          transform: isDragOver ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        <UploadCloud size={32} />
      </div>
      
      <h3
        className="font-display text-xl mb-2 transition-transform"
        style={{
          color: 'var(--color-text-1)',
          transform: isDragOver ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        {isDragOver ? 'Drop it here!' : 'Click or drag file to this area to upload'}
      </h3>
      <p className="font-sans text-sm" style={{ color: 'var(--color-text-3)' }}>
        Supported formats: PDF, EPUB, DOCX. Max size: 50MB.
      </p>
    </div>
  );
}
