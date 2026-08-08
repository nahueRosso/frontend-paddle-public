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

      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/[0.07] bg-[#0A0B0D] p-0 text-[#E4E5E7] sm:max-w-3xl">
        <DialogHeader className="border-b border-white/[0.07] px-8 pt-8 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D6FF3D]/10">
              <Video className="h-5 w-5 text-[#D6FF3D]" />
            </div>
            <div>
              <DialogTitle className="font-heading text-xl text-[#F2F3F5]">
                Agendar videollamada
              </DialogTitle>
              <p className="mt-1 text-sm text-[#6B7280]">
                Conocé la plataforma en una videollamada y obtené <strong className="text-[#D6FF3D]">15 días gratis</strong>.
              </p>
            </div>
          </div>
        </DialogHeader>

        {open ? <VideoCallBookingPanel key={session?.user?.email ?? "anon"} session={session} /> : null}
      </DialogContent>
    </Dialog>
  );
}
