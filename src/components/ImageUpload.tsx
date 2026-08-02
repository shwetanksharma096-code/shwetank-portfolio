import React, { useState, useRef } from "react";
import { Upload, Trash2, Loader2, X } from "lucide-react";

// ── Image Processing Config ──────────────────────────────────────────────
const MAX_SIDE     = 1200;   // px — sharp & crisp on any screen
const JPEG_QUALITY = 0.88;   // high visual quality, ultra-compact size

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folderPath: string;
  label?: string;
}

/** Convert file to compressed Data URL (direct client-side processing) */
const fileToDataUrl = (file: File, maxSide = MAX_SIDE, quality = JPEG_QUALITY): Promise<string> =>
  new Promise((resolve, reject) => {
    if (file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read SVG file"));
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxSide || height > maxSide) {
        if (width > height) { height = Math.round((height / width) * maxSide); width = maxSide; }
        else                { width  = Math.round((width / height) * maxSide); height = maxSide; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      URL.revokeObjectURL(img.src);
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Failed to load image file"));
    };
    img.src = URL.createObjectURL(file);
  });

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  folderPath: _folderPath,
  label = "Upload Image",
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [error, setError]         = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processUpload = async (file: File) => {
    if (file.size > 15 * 1024 * 1024) { setError("File too large. Max 15MB."); return; }
    const ok = ["image/jpeg","image/png","image/webp","image/avif","image/gif","image/svg+xml"];
    if (!ok.includes(file.type)) { setError("Only JPG, PNG, WebP, AVIF, GIF, SVG allowed."); return; }

    setError(null); setUploading(true); setProgress(30);
    try {
      // Direct high-quality client-side compression — 100% reliable, zero 401 network errors
      const dataUrl = await fileToDataUrl(file, 1000, 0.88);
      setProgress(100);
      onChange(dataUrl);
    } catch (err: any) {
      setError(err?.message || "Failed to process image.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processUpload(file);
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) await processUpload(file);
  };

  const handleDelete = async () => {
    if (!value) return;
    if (!confirm("Is image ko hatana chahte ho?")) return;
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs uppercase tracking-widest text-[#D7E2EA]/40 font-medium">{label}</label>

      {value ? (
        <div className="relative bg-[#0C0C0C] border border-[#222] rounded-xl overflow-hidden">
          <img
            src={value}
            alt="Preview"
            className="w-full max-h-40 object-contain bg-[#0C0C0C] p-2"
            onError={(e) => (e.currentTarget.style.opacity = "0.3")}
          />
          <div className="flex items-center justify-between px-3 py-2 bg-[#111] border-t border-[#222]">
            <span className="text-[10px] text-green-500 font-semibold">✔ Image set</span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 bg-[#7621B0]/20 text-[#a855f7] border border-[#7621B0]/30 rounded-lg hover:bg-[#7621B0]/40 transition disabled:opacity-50"
              >
                <Upload size={11} /> Change
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={handleDelete}
                className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 bg-red-950/30 text-red-400 border border-red-900/40 rounded-lg hover:bg-red-950/60 transition disabled:opacity-50"
              >
                <Trash2 size={11} /> Delete
              </button>
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center border-2 border-dashed border-[#222] hover:border-[#7621B0]/60 bg-[#0C0C0C]/50 rounded-xl p-6 cursor-pointer transition text-center min-h-[110px]"
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          {uploading ? (
            <div className="flex flex-col items-center gap-2 w-full">
              <Loader2 className="animate-spin text-[#7621B0]" size={22} />
              <span className="text-xs text-[#D7E2EA]/60">Uploading… {progress}%</span>
              <div className="w-40 bg-[#222] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#7621B0] h-full transition-all duration-200" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <Upload className="text-[#D7E2EA]/30" size={22} />
              <span className="text-xs text-[#D7E2EA]/60">
                Drag &amp; drop ya <span className="text-[#a855f7] font-semibold">browse</span>
              </span>
              <span className="text-[10px] text-[#D7E2EA]/30">JPG · PNG · WebP · AVIF · SVG (max 5 MB)</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg px-3 py-2">
          <X size={12} /> {error}
        </div>
      )}
    </div>
  );
};
