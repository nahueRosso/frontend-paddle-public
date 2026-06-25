"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { verifyPlayerInClub } from "@/lib/api/player"
import { playerKeys } from "@/lib/queryKeys/player"
import { tournamentKeys } from "@/lib/queryKeys/tournament"
import { usePlayer } from "@/providers/player-provider"

type VerifyClubPlayerDialogProps = {
  slug: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  autoOpen?: boolean
}

export default function VerifyClubPlayerDialog({
  slug,
  open,
  onOpenChange,
  autoOpen = false,
}: VerifyClubPlayerDialogProps) {
  const {
    personId,
    playerExists,
    person,
    setPlayerSession,
    ensureClubPlayerSession,
  } = usePlayer()
  const queryClient = useQueryClient()
  const [internalOpen, setInternalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasAutoOpenedRef = useRef(false)
  const isControlled = typeof open === "boolean"

  const isOpen = isControlled ? open : internalOpen

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange],
  )

  useEffect(() => {
    if (autoOpen && !playerExists && personId && !hasAutoOpenedRef.current) {
      hasAutoOpenedRef.current = true
      setOpen(true)
    }
  }, [autoOpen, personId, playerExists, setOpen])

  if (playerExists || !personId) {
    return null
  }

  const handleVerify = async () => {
    try {
      setIsSubmitting(true)
      const response = await verifyPlayerInClub(personId, slug)
      setPlayerSession(response)
      await ensureClubPlayerSession()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: playerKeys.all }),
        queryClient.invalidateQueries({ queryKey: tournamentKeys.all }),
      ])
      toast.success("Jugador verificado en este club.")
      setOpen(false)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo verificar el jugador en este club.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      <AlertDialogContent className="border-[#1E2028] bg-[#101216] text-[#F2F3F5]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-900 dark:text-slate-100">
            Verificar en este club
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
            {person?.firstName?.trim() || "Tu perfil"} ya existe como persona global, pero todavía no tiene jugador creado en este club.
            <br />
            <br />
            Podés seguir navegando el club, pero para reservar turnos, inscribirte a torneos o buscar match primero tenés que verificarte en este club.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isSubmitting}
            className="border-[#2a3036] bg-[#14161A] text-[#F2F3F5] hover:bg-[#1a1d24] hover:text-[#D6FF3D]"
          >
            Cerrar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              void handleVerify()
            }}
            disabled={isSubmitting}
            className="bg-[#D6FF3D] text-[#0A0B0D] hover:bg-[#e4ff6a]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              "Verificar en este club"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
