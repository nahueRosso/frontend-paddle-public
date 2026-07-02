"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContactForm } from "@/components/contact-form";
import { company } from "@/config/company";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactDialog({ open, onOpenChange }: ContactDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-white/[0.07] bg-[#0A0B0D] text-[#E4E5E7]">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl text-[#F2F3F5]">
            Contactanos
          </DialogTitle>
          <p className="text-sm text-[#6B7280]">
            Escribinos a{" "}
            <a
              href={`mailto:${company.email}`}
              className="text-[#D6FF3D] no-underline hover:underline"
            >
              {company.email}
            </a>{" "}
            o enviá un mensaje desde acá.
          </p>
        </DialogHeader>
        <ContactForm />
      </DialogContent>
    </Dialog>
  );
}
