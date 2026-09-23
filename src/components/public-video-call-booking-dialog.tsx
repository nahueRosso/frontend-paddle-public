"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "next-auth";
import { Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VideoCallBookingPanel } from "@/components/video-call-booking-panel";

type PublicVideoCallBookingDialogProps = {
  session: Session | null;
  className?: string;
  icon?: ReactNode;
  triggerLabel?: string;
};

export function PublicVideoCallBookingDialog({
  session,
  className,
  icon,
  triggerLabel = "Obtener prueba gratis",
}: PublicVideoCallBookingDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" className={className} onClick={() => setOpen(true)}>
        {icon}
        {triggerLabel}
      </Button>

      <DialogContent
        className="max-h-[90vh] overflow-y-auto border-[rgba(255,255,255,0.09)] p-0 text-[#E4E5E7] shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)] sm:max-w-3xl"
        style={{
          background:
            "radial-gradient(120% 90% at 50% -10%, rgba(216,255,71,0.06), rgba(6,8,6,0) 60%), #0b0d0a",
        }}
      >
        <DialogHeader className="border-b border-white/[0.07] px-8 pt-8 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(216,255,71,0.24)] bg-[rgba(216,255,71,0.12)]">
              <Video className="h-5 w-5 text-[#d8ff47]" />
            </div>
            <div>
              <DialogTitle className="font-heading text-xl text-[#f4f6f0]">
                Agendar videollamada
              </DialogTitle>
              <p className="mt-1 text-sm text-[#8d938a]">
                Conocé la plataforma en una videollamada y obtené <strong className="text-[#d8ff47]">15 días gratis</strong>.
              </p>
            </div>
          </div>
        </DialogHeader>

        {open ? <VideoCallBookingPanel key={session?.user?.email ?? "anon"} session={session} /> : null}
      </DialogContent>
    </Dialog>
  );
}
