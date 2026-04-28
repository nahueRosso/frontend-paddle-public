"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { validateSquareImage } from "@/lib/utils";

type ImageUploaderProps = {
  id: string;
  label: string;
//   description: string;
  preview: string | null;
  requireSquare?: boolean;
  onFileSelect: (file: File, previewUrl: string) => void;
  onClear: () => void;
};

export function ImageUploader({
  id,
  label,
//   description,
  preview,
  requireSquare = false,
  onFileSelect,
  onClear,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!file.type.startsWith("image/")) {
        setError("Solo se permiten archivos de imagen.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no puede superar los 5MB.");
        return;
      }

      if (requireSquare) {
        const isSquare = await validateSquareImage(file);
        if (!isSquare) {
          setError(
            "El icono debe ser cuadrado (ancho y alto iguales). Ej: 512x512px.",
          );
          return;
        }
      }

      const previewUrl = URL.createObjectURL(file);
      onFileSelect(file, previewUrl);
    },
    [requireSquare, onFileSelect],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processFile(file);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClear = () => {
    setError(null);
    onClear();
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="dark:text-slate-100">{label}</Label>
      {/* <p className="text-xs text-muted-foreground">{description}</p> */}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="sr-only"
        onChange={handleChange}
      />

      {preview ? (
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "relative overflow-hidden rounded-xl border-2 border-emerald-200 bg-white dark:border-emerald-900/60 dark:bg-slate-950",
              requireSquare ? "h-20 w-20" : "h-20 w-[7.5rem]",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={`Preview de ${label}`}
              className="h-full w-full object-contain"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/30 dark:hover:text-rose-200"
            onClick={handleClear}
          >
            <Trash2 className="h-4 w-4" />
            Quitar
          </Button>
        </div>
      ) : (
        <button
          type="button"
          className={cn(
            "flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors",
            isDragging
              ? "border-emerald-400 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/30"
              : "border-emerald-200 bg-emerald-50/30 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-900/60 dark:bg-slate-900/50 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20",
          )}
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <ImagePlus className="h-8 w-8 text-emerald-400 dark:text-emerald-300" />
          <span className="text-sm text-muted-foreground dark:text-slate-300">
            Arrastra una imagen o hace click para seleccionar
          </span>
          {requireSquare && (
            <span className="text-xs text-muted-foreground/70 dark:text-slate-400">
              Se exporta en 1000x1000 px (1:1). Recomendado: fondo transparente.
            </span>
          )}
          {!requireSquare && (
            <span className="text-xs text-muted-foreground/70 dark:text-slate-400">
              Se exporta en 1500x1000 px (3:2)
            </span>
          )}
        </button>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
