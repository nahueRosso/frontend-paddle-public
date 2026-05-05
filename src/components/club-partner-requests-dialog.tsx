"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useClub } from "@/context/club-context";
import {
  acceptTournamentPartnerRequest,
  createTournamentPaymentLink,
  fetchTournamentPartnerRequests,
  rejectTournamentPartnerRequest,
  type TournamentPartnerRegistration,
  type TournamentPartnerRequest,
  type TournamentRegistrationPlayer,
} from "@/lib/api/tournament";
import { playerKeys } from "@/lib/queryKeys/player";
import { tournamentKeys } from "@/lib/queryKeys/tournament";
import { usePlayer } from "@/providers/player-provider";

export function ClubPartnerRequestsDialog() {
  const { config } = useClub();
  const { player, playerId } = usePlayer();
  const resolvedPlayerId = playerId ?? undefined;
  const queryClient = useQueryClient();
  const [requestsOpen, setRequestsOpen] = React.useState(false);
  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const [dismissedRequestsSignature, setDismissedRequestsSignature] = React.useState("");
  const [dismissedPaymentSignature, setDismissedPaymentSignature] = React.useState("");

  const partnerRequestsQuery = useQuery({
    queryKey: tournamentKeys.partnerRequests(config.tenantId, resolvedPlayerId),
    queryFn: () =>
      fetchTournamentPartnerRequests({
        tenantId: config.tenantId,
        playerId: resolvedPlayerId!,
      }),
    enabled: Boolean(config.tenantId && resolvedPlayerId),
  });

  const receivedRequests = React.useMemo(
    () =>
      (partnerRequestsQuery.data?.requests ?? []).filter((request) =>
        playerId ? isReceivedPartnerRequest(request, playerId) : false,
      ),
    [partnerRequestsQuery.data?.requests, playerId],
  );

  const unpaidRegistrations = React.useMemo(
    () =>
      (partnerRequestsQuery.data?.tournamentRegistrations ?? []).filter(
        (registration) => registration.approved === false,
      ),
    [partnerRequestsQuery.data?.tournamentRegistrations],
  );

  const requestsSignature = React.useMemo(
    () =>
      receivedRequests
        .map((request) => `req:${request.id}`)
        .sort()
        .join("|"),
    [receivedRequests],
  );

  const paymentSignature = React.useMemo(
    () =>
      unpaidRegistrations
        .map((registration) => `reg:${registration.teamId}`)
        .sort()
        .join("|"),
    [unpaidRegistrations],
  );

  React.useEffect(() => {
    if (!requestsSignature) {
      setRequestsOpen(false);
      setDismissedRequestsSignature("");
      return;
    }

    if (requestsSignature !== dismissedRequestsSignature) {
      setRequestsOpen(true);
    }
  }, [dismissedRequestsSignature, requestsSignature]);

  React.useEffect(() => {
    if (!paymentSignature) {
      setPaymentOpen(false);
      setDismissedPaymentSignature("");
      return;
    }

    if (paymentSignature !== dismissedPaymentSignature) {
      setPaymentOpen(true);
    }
  }, [dismissedPaymentSignature, paymentSignature]);

  const invalidateRequests = React.useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: tournamentKeys.partnerRequests(config.tenantId, resolvedPlayerId),
      }),
      queryClient.invalidateQueries({
        queryKey: tournamentKeys.list(config.tenantId),
      }),
      queryClient.invalidateQueries({ queryKey: playerKeys.all }),
    ]);
  }, [config.tenantId, queryClient, resolvedPlayerId]);

  const acceptRequestMutation = useMutation({
    mutationFn: (requestId: string) =>
      acceptTournamentPartnerRequest({ requestId, playerId: playerId! }),
    onSuccess: async (response) => {
      toast.success(response.message);
      await invalidateRequests();
    },
    onError: (err) => {
      toast.error(getTournamentActionErrorMessage(err));
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: (requestId: string) =>
      rejectTournamentPartnerRequest({ requestId, playerId: playerId! }),
    onSuccess: async (response) => {
      toast.success(response.message);
      await invalidateRequests();
    },
    onError: (err) => {
      toast.error(getTournamentActionErrorMessage(err));
    },
  });

  const isActionPending =
    acceptRequestMutation.isPending || rejectRequestMutation.isPending;

  const createPaymentLinkMutation = useMutation({
    mutationFn: (registration: TournamentPartnerRegistration) =>
      createTournamentPaymentLink({
        tenantId: config.tenantId,
        tournamentTeamId: registration.teamId,
      }),
    onSuccess: (response) => {
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
        return;
      }

      toast.error("No recibimos un checkoutUrl para continuar con el pago.");
    },
    onError: (err) => {
      toast.error(getTournamentActionErrorMessage(err));
    },
  });

  if (!player || !playerId) {
    return null;
  }

  if (
    receivedRequests.length === 0 &&
    unpaidRegistrations.length === 0 &&
    !partnerRequestsQuery.isLoading
  ) {
    return null;
  }

  return (
    <>
      <Dialog
        open={requestsOpen}
        onOpenChange={(nextOpen) => {
          setRequestsOpen(nextOpen);
          if (!nextOpen) {
            setDismissedRequestsSignature(requestsSignature);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto border-emerald-100 bg-white text-slate-900 shadow-xl shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950 dark:text-slate-100 dark:shadow-emerald-950/20 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Solicitudes de torneo pendientes</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Tenés solicitudes para formar pareja. Podés aceptar, rechazar o cerrar este aviso.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {partnerRequestsQuery.isLoading ? (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 px-4 py-3 text-sm text-slate-500 dark:border-emerald-900/60 dark:text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando solicitudes...
              </div>
            ) : (
              <section className="space-y-3">
                {receivedRequests.map((request) => (
                  <GlobalPartnerRequestRow
                    key={request.id}
                    request={request}
                    disabled={isActionPending}
                    onAccept={() => {
                      acceptRequestMutation.mutate(request.id);
                    }}
                    onReject={() => {
                      rejectRequestMutation.mutate(request.id);
                    }}
                  />
                ))}
              </section>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={paymentOpen}
        onOpenChange={(nextOpen) => {
          setPaymentOpen(nextOpen);
          if (!nextOpen) {
            setDismissedPaymentSignature(paymentSignature);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto border-emerald-100 bg-white text-slate-900 shadow-xl shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950 dark:text-slate-100 dark:shadow-emerald-950/20 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Confirmar inscripción</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Para confirmar la inscripción del torneo, necesitás pagar la seña de inscripción.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {partnerRequestsQuery.isLoading ? (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 px-4 py-3 text-sm text-slate-500 dark:border-emerald-900/60 dark:text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando inscripción pendiente...
              </div>
            ) : (
              unpaidRegistrations.map((registration) => (
                <PendingRegistrationRow
                  key={registration.teamId}
                  registration={registration}
                  isLoading={createPaymentLinkMutation.isPending}
                  onContinuePayment={() => {
                    createPaymentLinkMutation.mutate(registration);
                  }}
                />
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function GlobalPartnerRequestRow({
  request,
  disabled,
  onAccept,
  onReject,
}: {
  request: TournamentPartnerRequest;
  disabled: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-emerald-100 p-4 text-sm dark:border-emerald-900/60">
      <div>
        <p className="font-medium text-slate-900 dark:text-slate-100">
          {getRegistrationPlayerName(getPartnerRequestRequester(request))}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {request.tournament?.name ?? "Torneo"}
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onReject}
          disabled={disabled}
          className="border-rose-200 bg-white text-rose-700 hover:bg-rose-50 dark:border-rose-900/60 dark:bg-slate-900 dark:text-rose-200"
        >
          Rechazar
        </Button>
        <Button
          type="button"
          onClick={onAccept}
          disabled={disabled}
          className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
        >
          Aceptar
        </Button>
      </div>
    </div>
  );
}

function PendingRegistrationRow({
  registration,
  isLoading,
  onContinuePayment,
}: {
  registration: TournamentPartnerRegistration;
  isLoading: boolean;
  onContinuePayment: () => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-emerald-100 p-4 text-sm dark:border-emerald-900/60">
      <div className="space-y-1">
        <p className="font-medium text-slate-900 dark:text-slate-100">
          {getTournamentRegistrationName(registration)}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {registration.partner
            ? `Compañero: ${getRegistrationPlayerName(registration.partner)}`
            : "Sin compañero asignado"}
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-300">
          Estado: pendiente
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          onClick={onContinuePayment}
          disabled={isLoading}
          className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
        >
          {isLoading ? "Generando pago..." : "Pagar inscripción"}
        </Button>
      </div>
    </div>
  );
}

function getTournamentRegistrationName(registration: TournamentPartnerRegistration) {
  if (typeof registration.tournament === "string") {
    return "Torneo";
  }

  return registration.tournament?.name ?? "Torneo";
}

export function isReceivedPartnerRequest(
  request: TournamentPartnerRequest,
  playerId: string,
) {
  if (request.status !== "pending") return false;

  const requestedId =
    request.requestedPlayer?.id ?? request.requested?.id ?? request.requestedPlayerId;
  return requestedId === playerId;
}

export function isSentPartnerRequest(
  request: TournamentPartnerRequest,
  playerId: string,
) {
  if (request.status !== "pending") return false;

  const requesterId =
    request.requesterPlayer?.id ?? request.requester?.id ?? request.requesterPlayerId;
  return requesterId === playerId;
}

export function getPartnerRequestRequester(request: TournamentPartnerRequest) {
  return request.requesterPlayer ?? request.requester ?? null;
}

export function getPartnerRequestRequested(request: TournamentPartnerRequest) {
  return request.requestedPlayer ?? request.requested ?? null;
}

function getRegistrationPlayerName(
  player: TournamentRegistrationPlayer | null | undefined,
) {
  if (!player) return "Jugador";
  return `${player.firstName ?? ""} ${player.lastName ?? ""}`.trim() || "Jugador";
}

export function getTournamentActionErrorMessage(error: unknown) {
  const maybeError = error as {
    response?: { data?: { message?: string } };
  };

  return maybeError.response?.data?.message ?? "No se pudo completar la acción";
}
