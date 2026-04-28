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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useClub } from "@/context/club-context";
import {
  acceptTournamentPartnerRequest,
  fetchTournamentPartnerRequests,
  rejectTournamentPartnerRequest,
  type TournamentPartnerRequest,
  type TournamentRegistrationPlayer,
} from "@/lib/api/tournament";
import { playerKeys } from "@/lib/queryKeys/player";
import { tournamentKeys } from "@/lib/queryKeys/tournament";
import { usePlayer } from "@/providers/player-provider";

export function ClubPartnerRequestsDialog() {
  const { config } = useClub();
  const { player } = usePlayer();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [dismissedSignature, setDismissedSignature] = React.useState("");

  const partnerRequestsQuery = useQuery({
    queryKey: tournamentKeys.partnerRequests(config.tenantId, player?.id),
    queryFn: () =>
      fetchTournamentPartnerRequests({
        tenantId: config.tenantId,
        playerId: player.id,
      }),
    enabled: Boolean(config.tenantId && player?.id),
  });

  const receivedRequests = React.useMemo(
    () =>
      (partnerRequestsQuery.data ?? []).filter((request) =>
        isReceivedPartnerRequest(request, player.id),
      ),
    [partnerRequestsQuery.data, player.id],
  );

  const requestsSignature = React.useMemo(
    () =>
      receivedRequests
        .map((request) => request.id)
        .sort()
        .join("|"),
    [receivedRequests],
  );

  React.useEffect(() => {
    if (!requestsSignature) {
      setOpen(false);
      setDismissedSignature("");
      return;
    }

    if (requestsSignature !== dismissedSignature) {
      setOpen(true);
    }
  }, [dismissedSignature, requestsSignature]);

  const invalidateRequests = React.useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: tournamentKeys.partnerRequests(config.tenantId, player.id),
      }),
      queryClient.invalidateQueries({
        queryKey: tournamentKeys.list(config.tenantId),
      }),
      queryClient.invalidateQueries({ queryKey: playerKeys.all }),
    ]);
  }, [config.tenantId, player.id, queryClient]);

  const acceptRequestMutation = useMutation({
    mutationFn: (requestId: string) =>
      acceptTournamentPartnerRequest({ requestId, playerId: player.id }),
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
      rejectTournamentPartnerRequest({ requestId, playerId: player.id }),
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

  if (receivedRequests.length === 0 && !partnerRequestsQuery.isLoading) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setDismissedSignature(requestsSignature);
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
            receivedRequests.map((request) => (
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
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
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
