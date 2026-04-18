"use client";

import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  onChange: (dataUrl: string | null) => void;
  label?: string;
  hint?: string;
  allowCamera?: boolean;
  initialPreview?: string;
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function ImageUploader({
  onChange,
  label = "Upload a photo",
  hint = "Drag & drop or click to choose • JPG/PNG/WEBP",
  allowCamera = true,
  initialPreview,
}: Props) {
  const [preview, setPreview] = useState<string | null>(initialPreview ?? null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      const dataUrl = await readFile(file);
      setPreview(dataUrl);
      onChange(dataUrl);
    },
    [onChange]
  );

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) void handleFile(accepted[0]);
    },
    [handleFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    noClick: false,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
          isDragActive
            ? "border-brand bg-brand/5"
            : "border-gray-300 bg-gray-50 hover:border-brand hover:bg-brand/5"
        }`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="mx-auto max-h-72 rounded-xl object-contain"
            />
            <p className="mt-3 text-sm text-gray-500">
              Tap to replace the photo
            </p>
          </div>
        ) : (
          <>
            <div className="text-4xl">📷</div>
            <p className="mt-2 font-semibold text-gray-800">{label}</p>
            <p className="mt-1 text-xs text-gray-500">{hint}</p>
          </>
        )}
      </div>

      {allowCamera && (
        <>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-brand/20 bg-white py-3 text-sm font-semibold text-brand hover:bg-brand/5 md:hidden"
          >
            📸 Use Camera
          </button>
        </>
      )}

      {preview && (
        <button
          type="button"
          onClick={() => {
            setPreview(null);
            onChange(null);
          }}
          className="mt-2 w-full rounded-xl py-2 text-xs text-gray-500 hover:text-gray-800"
        >
          Remove photo
        </button>
      )}
    </div>
  );
}
