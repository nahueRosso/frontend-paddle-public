"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Trash2, AlertCircle, Crop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ImageCropperDialog } from "@/components/ImageCropperDialog";

type ImageUploaderProps = {
  id: string;
  label: string;
  preview: string | null;
  /** e.g. 3/2 for logo, 1 for square icon */
  aspectRatio?: number;
  /** Pixel dimensions of the exported image */
  exportWidth?: number;
  exportHeight?: number;
  onFileSelect: (file: File, previewUrl: string) => void;
  onClear: () => void;
};

export function ImageUploader({
  id,
  label,
  preview,
  aspectRatio = 3 / 2,
  exportWidth = 1500,
  exportHeight = 1000,
  onFileSelect,
  onClear,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingFileName, setPendingFileName] = useState("imagen");

  const isSquare = Math.abs(aspectRatio - 1) < 0.01;

  const processFile = useCallback((file: File) => {
    setError(null);

    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
      setError("Solo se permiten imágenes JPG, PNG o WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar los 5 MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPendingFileName(file.name);
    setCropSrc(objectUrl);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleCropConfirm = (croppedFile: File) => {
    const previewUrl = URL.createObjectURL(croppedFile);
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    onFileSelect(croppedFile, previewUrl);
  };

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const handleClear = () => {
    setError(null);
    onClear();
  };

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const g = gcd(exportWidth, exportHeight);
  const ratioLabel = `${exportWidth / g}:${exportHeight / g}`;
  const dimensionHint = isSquare
    ? `Se exporta en ${exportWidth}×${exportHeight} px (1:1). Recomendado: fondo transparente.`
    : `Se exporta en ${exportWidth}×${exportHeight} px (${ratioLabel}).`;

  const friendlyHint = isSquare
    ? `${exportWidth}×${exportHeight} px — cuadrado`
    : `${exportWidth}×${exportHeight} px — horizontal`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-semibold text-[#F2F3F5]">
        {label}
      </Label>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={handleChange}
      />

      {preview ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-4">
            <div
              className={cn(
                "relative overflow-hidden rounded-xl border-2 border-white/10 bg-[#0A0B0D]",
                isSquare ? "h-20 w-20" : "h-20 w-[7.5rem]",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt={`Preview de ${label}`}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 border-white/10 text-[#D6FF3D] hover:bg-[#D6FF3D]/10"
                onClick={() => inputRef.current?.click()}
              >
                <Crop className="h-4 w-4" />
                Cambiar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 border-white/10 text-rose-400 hover:bg-rose-950/30"
                onClick={handleClear}
              >
                <Trash2 className="h-4 w-4" />
                Quitar
              </Button>
            </div>
          </div>
          <p className="text-xs text-[#6B7280]">
            {friendlyHint}
          </p>
        </div>
      ) : (
        <button
          type="button"
          className={cn(
            "flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 transition-colors",
            isDragging
              ? "border-[#D6FF3D]/40 bg-[#D6FF3D]/5"
              : "border-white/10 bg-[#0A0B0D] hover:border-[#D6FF3D]/20 hover:bg-[#D6FF3D]/5",
          )}
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
        >
          <ImagePlus className="h-7 w-7 text-[#D6FF3D]" />
          <span className="text-center text-sm text-[#9CA3AF]">
            Arrastrá o hacé click
          </span>
          <span className="text-center text-xs text-[#6B7280]">
            {dimensionHint}
          </span>
        </button>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-800 bg-rose-950/30 px-3 py-2 text-sm text-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {cropSrc && (
        <ImageCropperDialog
          imageSrc={cropSrc}
          fileName={pendingFileName}
          aspectRatio={aspectRatio}
          exportWidth={exportWidth}
          exportHeight={exportHeight}
          open={Boolean(cropSrc)}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
