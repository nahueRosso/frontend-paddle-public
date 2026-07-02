"use client";

import { Smartphone, MessageCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PlayerAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlayerAccessDialog({ open, onOpenChange }: PlayerAccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:!max-w-md border-white/[0.07] bg-[#0A0B0D] p-0 text-[#E4E5E7]">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="font-heading text-xl text-[#F2F3F5]">
            ¿Cómo querés acceder?
          </DialogTitle>
          <p className="mt-1 text-sm text-[#6B7280]">
            Elegí la forma más cómoda para reservar tu cancha.
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-3 px-6 pb-6 pt-4">
          <a
            href="https://app.miclubpadel.com"
            className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-[#101216] p-5 no-underline transition-colors hover:border-[#D6FF3D]/30"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#D6FF3D]/10 transition-colors group-hover:bg-[#D6FF3D]/20">
              <Smartphone className="h-6 w-6 text-[#D6FF3D]" />
            </div>
            <div>
              <div className="text-base font-semibold text-[#F2F3F5]">Abrir la app</div>
              <div className="mt-0.5 text-sm text-[#6B7280]">
                Reservá, pagá y gestioná desde el navegador.
              </div>
            </div>
          </a>

          <a
            href="https://wa.me/5491178239667?text=Hola%2C%20quiero%20reservar%20una%20cancha"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-[#101216] p-5 no-underline transition-colors hover:border-emerald-500/30"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 transition-colors group-hover:bg-emerald-500/20">
              <MessageCircle className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <div className="text-base font-semibold text-[#F2F3F5]">WhatsApp</div>
              <div className="mt-0.5 text-sm text-[#6B7280]">
                Escribinos y reservá directo por chat.
              </div>
            </div>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
