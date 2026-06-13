"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const CONTAINER_W = 360;

type Props = {
  imageSrc: string;
  fileName: string;
  aspectRatio: number;
  exportWidth: number;
  exportHeight: number;
  open: boolean;
  onConfirm: (file: File) => void;
  onCancel: () => void;
};

type Offset = { x: number; y: number };
type NatSize = { w: number; h: number };

function getFitScale(nat: NatSize, containerH: number): number {
  return Math.max(CONTAINER_W / nat.w, containerH / nat.h);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function clampOffset(ox: number, oy: number, nat: NatSize, containerH: number, zoom: number): Offset {
  const ds = getFitScale(nat, containerH) * zoom;
  const maxX = Math.max(0, (nat.w * ds - CONTAINER_W) / 2);
  const maxY = Math.max(0, (nat.h * ds - containerH) / 2);
  return { x: clamp(ox, -maxX, maxX), y: clamp(oy, -maxY, maxY) };
}

export function ImageCropperDialog({
  imageSrc,
  fileName,
  aspectRatio,
  exportWidth,
  exportHeight,
  open,
  onConfirm,
  onCancel,
}: Props) {
  const containerH = Math.round(CONTAINER_W / aspectRatio);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [nat, setNat] = useState<NatSize | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const dragRef = useRef<{ mouseX: number; mouseY: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    if (open) {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setNat(null);
    }
  }, [open, imageSrc]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    setNat({ w, h });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { mouseX: e.clientX, mouseY: e.clientY, ox: offset.x, oy: offset.y };
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current || !nat) return;
      const dx = e.clientX - dragRef.current.mouseX;
      const dy = e.clientY - dragRef.current.mouseY;
      setOffset(clampOffset(dragRef.current.ox + dx, dragRef.current.oy + dy, nat, containerH, zoom));
    },
    [nat, containerH, zoom],
  );

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleZoom = (newZoom: number) => {
    if (!nat) return;
    const clamped = clampOffset(offset.x, offset.y, nat, containerH, newZoom);
    setZoom(newZoom);
    setOffset(clamped);
  };

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img || !nat) return;

    const ds = getFitScale(nat, containerH) * zoom;
    const imageLeft = (CONTAINER_W - nat.w * ds) / 2 + offset.x;
    const imageTop = (containerH - nat.h * ds) / 2 + offset.y;

    const srcX = Math.max(0, -imageLeft) / ds;
    const srcY = Math.max(0, -imageTop) / ds;
    const srcW = CONTAINER_W / ds;
    const srcH = containerH / ds;

    const canvas = document.createElement("canvas");
    canvas.width = exportWidth;
    canvas.height = exportHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, exportWidth, exportHeight);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const baseName = fileName.replace(/\.[^/.]+$/, "");
        onConfirm(new File([blob], `${baseName}.png`, { type: "image/png", lastModified: Date.now() }));
      },
      "image/png",
      0.92,
    );
  };

  const displayScale = nat ? getFitScale(nat, containerH) * zoom : 1;
  const imageStyle: React.CSSProperties = nat
    ? {
        position: "absolute",
        width: nat.w * displayScale,
        height: nat.h * displayScale,
        left: (CONTAINER_W - nat.w * displayScale) / 2 + offset.x,
        top: (containerH - nat.h * displayScale) / 2 + offset.y,
        userSelect: "none",
        pointerEvents: "none",
      }
    : { position: "absolute", opacity: 0 };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Ajustar imagen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Arrastrá para encuadrar y usá el zoom para ajustar.
          </p>

          <div
            className="relative mx-auto overflow-hidden rounded-xl cursor-grab active:cursor-grabbing bg-gray-100 dark:bg-slate-800"
            style={{ width: CONTAINER_W, height: containerH, touchAction: "none" }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Vista previa recorte"
              style={imageStyle}
              draggable={false}
              onLoad={handleImageLoad}
            />

            {/* Thirds grid */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.25) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)
                `,
                backgroundSize: `${CONTAINER_W / 3}px ${containerH / 3}px`,
              }}
            />
            <div className="absolute inset-0 pointer-events-none border-2 border-white/60 rounded-xl" />

            {!nat && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Cargando...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 px-1">
            <span className="text-xs text-muted-foreground shrink-0">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => handleZoom(Number(e.target.value))}
              className="flex-1 accent-emerald-500"
            />
            <span className="text-xs text-muted-foreground w-8 text-right shrink-0">
              {zoom.toFixed(1)}x
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            disabled={!nat}
            onClick={handleConfirm}
            className="bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
          >
            Confirmar recorte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
