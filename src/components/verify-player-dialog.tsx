"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function VerifyPlayerDialog({
  open,
  onClose,
  reason,
}: {
  open: boolean;
  onClose: () => void;
  reason?: string | null;
}) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <AlertDialogContent className="border-[#1E2028] bg-[#101216] text-[#F2F3F5]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-900 dark:text-slate-100">
            Cuenta pendiente de verificación
          </AlertDialogTitle>

          <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
            {reason?.trim() ? (
              reason
            ) : (
              <>
                Usted aún no ha sido verificado.
                <br /><br />
                Cuando el dueño del club confirme su registro,
                podrá reservar turnos y acceder a todas las funciones.
                <br /><br />
                Si cree que esto es un error,
                comuníquese con el dueño del club.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction className="bg-[#D6FF3D] text-[#0A0B0D] hover:bg-[#e4ff6a]">
            Entendido
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
