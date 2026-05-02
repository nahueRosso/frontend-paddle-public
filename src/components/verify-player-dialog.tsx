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
      <AlertDialogContent className="border-emerald-100 bg-white text-slate-900 shadow-xl shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950 dark:text-slate-100 dark:shadow-emerald-950/20">
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
          <AlertDialogAction className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400">
            Entendido
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
