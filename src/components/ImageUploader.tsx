'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Link2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  placeholder?: string;
}

export function ImageUploader({
  value,
  onChange,
  folder = 'fittrock/products',
  label = 'Product Image',
  placeholder = 'https://...',
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const handleUpload = async (file: File) => {
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    // Validate mime type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (JPG, PNG, WEBP, AVIF, SVG)');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch(`${API_URL}/api/upload/image`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image to Cloudinary');
      }

      onChange(data.secure_url || data.url);
      toast.success('Image uploaded to Cloudinary successfully!');
    } catch (err: any) {
      console.error('Upload Error:', err);
      toast.error(err.message || 'Error uploading image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
    }
  };

  const isCloudinaryUrl = (url: string) => {
    return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>{label}</span>
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
              mode === 'upload'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
              mode === 'url'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Direct URL
          </button>
        </div>
      </div>

      {/* When an image is set, show thumbnail preview and controls */}
      {value ? (
        <div className="relative group bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative w-24 h-20 bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800 flex-shrink-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={label}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              {isCloudinaryUrl(value) ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Cloudinary Hosted
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                  External URL
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 truncate font-mono select-all">
              {value}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
              title="Open full size"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/50 border border-red-900/30 rounded-lg transition-colors"
              title="Remove image"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : mode === 'upload' ? (
        /* Drag & Drop Box */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-xl p-5 text-center transition-all flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-2 text-amber-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-medium">Uploading to Cloudinary...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-400">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-200">
                  Click to upload or drag & drop
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  PNG, JPG, WEBP, or SVG (max 10MB)
                </p>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Manual URL Input Box */
        <div className="relative flex items-center">
          <Link2 className="absolute left-3 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
          <input
            type="url"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>
      )}
    </div>
  );
}
