"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, CheckCircle2, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useClub } from "@/context/club-context";
import { useCreateMatchEntryIntentMutation } from "@/hooks/mutations/match";
import type {
  CreateMatchRequestPayload,
  MatchEntryIntentResponse,
} from "@/lib/api/match";
import { playerFetch } from "@/lib/auth/fetch";
import {
  clearPendingMatchEntry,
  getPendingMatchEntry,
  setPendingMatchEntry,
  type PendingMatchEntry,
} from "@/lib/pending-match-entry";
import { buildPendingPaymentOwnerIdentity } from "@/lib/pending-booking-payment";
import { usePlayer } from "@/providers/player-provider";
import VerifyClubPlayerDialog from "./verify-club-player-dialog";
import VerifyPlayerDialog from "./verify-player-dialog";

type MatchRequestStatus =
  | "awaiting_payment"
  | "pending"
  | "proposal_pending"
  | "confirmed"
  | "assigned"
  | "expired"
  | "cancelled";

type MatchRequestResponse = {
  id: string;
  tenantId: string;
  userName: string;
  userPhone: string;
  gender: "male" | "female" | "mixed";
  categoryMin: number;
  categoryMax: number;
  preferredStart: string;
  preferredEnd: string;
  matchType: "individual" | "group";
  status: MatchRequestStatus;
  matched: boolean;
  matchGroupId?: string | null;
  createdAt: string;
};

type MatchRequestStatusResponse = Partial<MatchRequestResponse> & {
  status: MatchRequestStatus;
};

type MatchProposal = {
  id: string;
  tenantId: string;
  matchGroupId: string;
  matchRequestId: string;
  playerName: string;
  playerPhone: string;
  priority: number;
  status: "pending" | "confirmed" | "rejected" | "expired" | "cancelled";
  expiresAt: string;
  respondedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

const FINAL_MATCH_STATUSES = new Set<MatchRequestStatus>([
  "assigned",
  "cancelled",
  "expired",
]);

const parseHour = (time: string): number => {
  return Number(time.split(":")[0]);
};

const getResponseError = async (response: Response) => {
  const fallback = "Hubo un error al consultar tu solicitud.";
  const text = await response.text();

  if (!text) return fallback;

  try {
    const data = JSON.parse(text) as { message?: string; error?: string };
    return data.message || data.error || fallback;
  } catch {
    return text;
  }
};

const fetchMatchRequestStatus = async (matchRequestId: string) => {
  const response = await playerFetch(
    `/match/request/${matchRequestId}/status`,
    { method: "GET", cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(await getResponseError(response));
  }

  return response.json() as Promise<MatchRequestStatusResponse>;
};

const fetchPendingMatchProposals = async ({
  userPhone,
}: {
  userPhone: string;
}) => {
  const params = new URLSearchParams({ phone: userPhone });
  const response = await playerFetch(
    `/match/proposals?${params.toString()}`,
    { method: "GET", cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(await getResponseError(response));
  }

  return response.json() as Promise<MatchProposal[]>;
};

const respondToProposal = async (
  proposalId: string,
  action: "confirm" | "reject",
) => {
  const response = await playerFetch(
    `/match/proposals/${proposalId}/${action}`,
    { method: "POST" },
  );

  if (!response.ok) {
    throw new Error(await getResponseError(response));
  }
};

const cancelMatchRequest = async (matchRequestId: string) => {
  const response = await playerFetch(
    `/match/request/${matchRequestId}/cancel`,
    { method: "POST" },
  );

  if (!response.ok) {
    throw new Error(await getResponseError(response));
  }
};

const formatCountdown = (expiresAt: string, now: number) => {
  const remaining = new Date(expiresAt).getTime() - now;

  if (remaining <= 0) return "vencida";

  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export function ClubMatch() {
  const { config } = useClub();
  const [verifyPlayer, setVerifyPlayer] = useState(false);
  const [verifyClubPlayer, setVerifyClubPlayer] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [matchRequest, setMatchRequest] = useState<MatchRequestResponse | null>(
    null,
  );
  const [proposals, setProposals] = useState<MatchProposal[]>([]);
  const [isRefreshingMatch, setIsRefreshingMatch] = useState(false);
  const [rangeTap, setRangeTap] = useState<"start" | "end">("start");
  const [isCancellingMatch, setIsCancellingMatch] = useState(false);
  const [proposalAction, setProposalAction] = useState<
    "confirm" | "reject" | null
  >(null);
  const [refreshedExpiredProposalId, setRefreshedExpiredProposalId] =
    useState<string | null>(null);
  const [pendingMatchEntry, setPendingMatchEntryState] =
    useState<PendingMatchEntry | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const { player, playerId, personId, person } = usePlayer();

  // console.log('player: ',player, 'playerId: ',playerId, 'personId: ',personId, 'person: ',person);
  
  const createMatchEntryIntentMutation = useCreateMatchEntryIntentMutation();
  const [timeRange, setTimeRange] = useState<[number, number]>([10, 18]);
  const MIN_HOUR = parseHour(config.openingMorning);
  const MAX_HOUR = config.closingEvening
    ? parseHour(config.closingEvening)
    : parseHour(config.closingMorning);
  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, "0")}:00`;
  };
  const pendingProposal = useMemo(
    () => proposals.find((proposal) => proposal.status === "pending") ?? null,
    [proposals],
  );
  const requestStatus = matchRequest?.status;
  const isFinalStatus = requestStatus
    ? FINAL_MATCH_STATUSES.has(requestStatus)
    : false;
  const isProposalExpired = pendingProposal
    ? new Date(pendingProposal.expiresAt).getTime() <= now
    : false;
  const proposalCountdown = pendingProposal
    ? formatCountdown(pendingProposal.expiresAt, now)
    : "";
  const matchActor = player ?? person;
  const pendingMatchOwnerIdentity = buildPendingPaymentOwnerIdentity({
    playerId,
    personId,
    phoneNumber: matchActor?.phoneNumber ?? null,
    email: matchActor?.email ?? null,
  });
  const playerCategoryLabel =
    player?.category != null ? String(player.category) : "Sin categoria";
  const playerGenderLabel =
    player?.gender === "male"
      ? "Masculino"
      : player?.gender === "female"
        ? "Femenino"
        : player?.gender === "mixed"
          ? "Mixto"
          : "No definido";

  const refreshMatchFlow = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!matchRequest?.id) return;

      if (!options?.silent) {
        setIsRefreshingMatch(true);
      }

      try {
        const statusResponse = await fetchMatchRequestStatus(matchRequest.id);
        setMatchRequest((current) =>
          current
            ? {
                ...current,
                ...statusResponse,
                id: statusResponse.id ?? current.id,
              }
            : (statusResponse as MatchRequestResponse),
        );

        if (player?.phoneNumber) {
          const pendingProposals = await fetchPendingMatchProposals({
            userPhone: player.phoneNumber,
          });
          setProposals(pendingProposals);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Hubo un error al consultar tu solicitud.",
        );
      } finally {
        setIsRefreshingMatch(false);
      }
    },
    [config.tenantId, matchRequest?.id, player?.phoneNumber],
  );

  const persistPendingMatchEntry = useCallback(
    ({
      requestId,
      status,
      checkoutUrl,
      paymentId,
      externalReference,
    }: {
      requestId: string;
      status: MatchRequestStatus;
      checkoutUrl?: string;
      paymentId?: string;
      externalReference?: string;
    }) => {
      if (!pendingMatchOwnerIdentity) {
        return;
      }

      const nextEntry: PendingMatchEntry = {
        tenantId: config.tenantId,
        slug: config.slug,
        ownerIdentity: pendingMatchOwnerIdentity,
        requestId,
        status,
        checkoutUrl,
        paymentId,
        externalReference,
      };

      setPendingMatchEntry(nextEntry);
      setPendingMatchEntryState(nextEntry);
    },
    [config.slug, config.tenantId, pendingMatchOwnerIdentity],
  );

  const clearPersistedPendingMatchEntry = useCallback(() => {
    if (!pendingMatchOwnerIdentity) {
      return;
    }

    clearPendingMatchEntry(config.tenantId, pendingMatchOwnerIdentity);
    setPendingMatchEntryState(null);
  }, [config.tenantId, pendingMatchOwnerIdentity]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!pendingMatchOwnerIdentity || submitted) return;

    const storedEntry = getPendingMatchEntry(
      config.tenantId,
      pendingMatchOwnerIdentity,
    );

    if (!storedEntry?.requestId) return;

    setPendingMatchEntryState(storedEntry);
    setMatchRequest({
      id: storedEntry.requestId,
      tenantId: config.tenantId,
      userName:
        matchActor?.firstName && matchActor?.lastName
          ? `${matchActor.firstName} ${matchActor.lastName}`
          : "",
      userPhone: matchActor?.phoneNumber ?? "",
      gender:
        player?.gender === "male"
          ? "male"
          : player?.gender === "female"
            ? "female"
            : "mixed",
      categoryMin: player?.category ?? 0,
      categoryMax: player?.category ?? 0,
      preferredStart: formatHour(timeRange[0]),
      preferredEnd: formatHour(timeRange[1]),
      matchType: "individual",
      status: storedEntry.status as MatchRequestStatus,
      matched: false,
      matchGroupId: null,
      createdAt: new Date().toISOString(),
    });
    setSubmitted(true);
  }, [
    config.tenantId,
    matchActor?.firstName,
    matchActor?.lastName,
    matchActor?.phoneNumber,
    pendingMatchOwnerIdentity,
    player?.category,
    player?.gender,
    submitted,
    timeRange,
  ]);

  useEffect(() => {
    if (!submitted || !matchRequest?.id || isFinalStatus) return;

    const intervalId = window.setInterval(() => {
      void refreshMatchFlow({ silent: true });
    }, 12_000);

    return () => window.clearInterval(intervalId);
  }, [isFinalStatus, matchRequest?.id, refreshMatchFlow, submitted]);

  useEffect(() => {
    if (!pendingProposal || isFinalStatus) return;

    const expiresIn =
      new Date(pendingProposal.expiresAt).getTime() - Date.now();

    if (expiresIn <= 0) return;

    const timeoutId = window.setTimeout(() => {
      void refreshMatchFlow({ silent: true });
    }, expiresIn + 500);

    return () => window.clearTimeout(timeoutId);
  }, [isFinalStatus, pendingProposal, refreshMatchFlow]);

  useEffect(() => {
    if (!pendingProposal || !isProposalExpired || isFinalStatus) return;
    if (refreshedExpiredProposalId === pendingProposal.id) return;

    setRefreshedExpiredProposalId(pendingProposal.id);
    void refreshMatchFlow({ silent: true });
  }, [
    isFinalStatus,
    isProposalExpired,
    pendingProposal,
    refreshMatchFlow,
    refreshedExpiredProposalId,
  ]);

  useEffect(() => {
    if (!matchRequest?.id || !pendingMatchOwnerIdentity) return;

    persistPendingMatchEntry({
      requestId: matchRequest.id,
      status: matchRequest.status,
      checkoutUrl:
        matchRequest.status === "awaiting_payment"
          ? pendingMatchEntry?.checkoutUrl
          : undefined,
      paymentId: pendingMatchEntry?.paymentId,
      externalReference: pendingMatchEntry?.externalReference,
    });
  }, [
    matchRequest?.id,
    matchRequest?.status,
    pendingMatchEntry?.checkoutUrl,
    pendingMatchEntry?.externalReference,
    pendingMatchEntry?.paymentId,
    pendingMatchOwnerIdentity,
    persistPendingMatchEntry,
  ]);

  useEffect(() => {
    if (!isFinalStatus) return;

    clearPersistedPendingMatchEntry();
  }, [clearPersistedPendingMatchEntry, isFinalStatus]);

  const applyEntryIntentResponse = (
    response: MatchEntryIntentResponse,
    dto: CreateMatchRequestPayload,
  ) => {
    setMatchRequest({
      id: response.requestId,
      tenantId: config.tenantId,
      userName: dto.userName,
      userPhone: dto.userPhone,
      gender: dto.gender,
      categoryMin: dto.categoryMin,
      categoryMax: dto.categoryMax,
      preferredStart: dto.preferredStart,
      preferredEnd: dto.preferredEnd,
      matchType: dto.matchType as "individual" | "group",
      status: response.status,
      matched: false,
      matchGroupId: null,
      createdAt: new Date().toISOString(),
    });

    persistPendingMatchEntry({
      requestId: response.requestId,
      status: response.status,
      checkoutUrl:
        response.mode === "payment_required"
          ? response.checkoutUrl ?? undefined
          : undefined,
      paymentId: response.mode === "payment_required" ? response.paymentId : undefined,
      externalReference:
        response.mode === "payment_required"
          ? response.externalReference
          : undefined,
    });
  };

  const handleSubmit = async () => {
    if (!player) {
      setVerifyClubPlayer(true);
      return;
    }

    if (player.status !== "verified") {
      setVerifyPlayer(true);
      return;
    }

    if (player.category == null) {
      setError("Tu perfil no tiene una categoria asignada para buscar partido.");
      return;
    }

    setError("");

    try {
      const dto: CreateMatchRequestPayload = {
        userName: player.firstName + " " + player.lastName,
        userPhone: player.phoneNumber,
        playerId: player.id,
        payerEmail: player.email || undefined,

        gender:
          player.gender === "male"
            ? "male"
            : player.gender === "female"
            ? "female"
              : "mixed",

        categoryMin: player.category,
        categoryMax: player.category,

        preferredStart: formatHour(timeRange[0]),
        preferredEnd: formatHour(timeRange[1]),

        matchType: "individual", // o dinámico si lo querés
      };

      const response = await createMatchEntryIntentMutation.mutateAsync(
        dto,
      );

      if (!response?.requestId) {
        throw new Error("No se pudo crear la solicitud.");
      }

      applyEntryIntentResponse(response, dto);
      setSubmitted(true);

      if (response.mode === "payment_required" && response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
        return;
      }

      if (response.mode === "payment_required") {
        throw new Error("No se pudo iniciar el pago.");
      }

      const pendingProposals = await fetchPendingMatchProposals({
        userPhone: player.phoneNumber,
      });
      setProposals(pendingProposals);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Hubo un error al enviar tu solicitud.",
      );
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setError("");
    setMatchRequest(null);
    setProposals([]);
    setProposalAction(null);
    setRefreshedExpiredProposalId(null);
    clearPersistedPendingMatchEntry();
  };

  const handleContinuePayment = () => {
    if (!pendingMatchEntry?.checkoutUrl) {
      return;
    }

    window.location.href = pendingMatchEntry.checkoutUrl;
  };

  const handleCancelPaymentRequest = async () => {
    if (!matchRequest?.id) {
      return;
    }

    setIsCancellingMatch(true);
    setError("");

    try {
      await cancelMatchRequest(matchRequest.id);
      handleReset();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cancelar la solicitud de pago.",
      );
    } finally {
      setIsCancellingMatch(false);
    }
  };

  const handleProposalAction = async (action: "confirm" | "reject") => {
    if (!pendingProposal) return;

    setProposalAction(action);
    setError("");

    try {
      await respondToProposal(pendingProposal.id, action);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : action === "confirm"
            ? "No se pudo confirmar la propuesta."
            : "No se pudo rechazar la propuesta.",
      );
    } finally {
      setProposalAction(null);
      await refreshMatchFlow();
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <section className="rounded-2xl border border-[#1E2028] bg-[#101216] p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#F2F3F5] lg:text-3xl">
            Buscar partido
          </h2>
          <p className="mt-2 text-[#6B7280]">
            Encontra companeros para jugar.
          </p>
        </section>

        <Card className="w-full rounded-2xl border-[#1E2028] bg-[#101216]">
          <CardContent className="flex flex-col items-center gap-5 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D6FF3D]/15 text-[#D6FF3D] animate-in zoom-in-50 duration-300">
              {requestStatus === "awaiting_payment" ||
              requestStatus === "pending" ||
              requestStatus === "proposal_pending" ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <CheckCircle2 className="h-8 w-8" />
              )}
            </div>
            <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
              <p className="text-lg font-semibold text-[#F2F3F5]">
                {requestStatus === "awaiting_payment"
                  ? "Pago pendiente de acreditacion"
                  : requestStatus === "pending"
                    ? "Ya estas en la lista de espera"
                  : requestStatus === "proposal_pending" && pendingProposal
                  ? "Propuesta encontrada"
                  : requestStatus === "confirmed"
                    ? "Confirmaste tu lugar"
                    : requestStatus === "assigned"
                      ? "Partido confirmado"
                      : requestStatus === "expired"
                        ? "La propuesta vencio"
                        : requestStatus === "cancelled"
                          ? "Rechazaste la propuesta"
                          : "Estamos buscando jugadores compatibles"}
              </p>
              <p className="mt-1 max-w-sm text-sm leading-relaxed text-[#6B7280]">
                {requestStatus === "awaiting_payment"
                  ? "Estamos esperando la acreditacion del pago para ingresar a la busqueda de match."
                  : requestStatus === "pending"
                    ? "Ya estas en la lista de espera buscando jugadores."
                  : requestStatus === "proposal_pending" && pendingProposal
                  ? "Confirmá tu lugar antes de que venza la propuesta."
                  : requestStatus === "confirmed"
                    ? "Estamos esperando al resto de los jugadores."
                    : requestStatus === "assigned"
                      ? "Los 4 jugadores confirmaron y el turno quedo armado."
                      : requestStatus === "expired"
                        ? "Podés crear una nueva solicitud cuando quieras."
                        : requestStatus === "cancelled"
                          ? "Podés crear una nueva solicitud con otro rango horario."
                          : "Te avisamos cuando encontremos un turno compatible con otros jugadores."}
              </p>
            </div>

            {requestStatus === "proposal_pending" && pendingProposal ? (
              <div className="w-full max-w-md rounded-2xl border border-[#1E2028] bg-[#14161A]/60 px-5 py-4 text-sm animate-in fade-in slide-in-from-bottom-3 duration-500 border-[#1E2028] bg-[#14161A]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#F2F3F5]">
                      Hay un partido para confirmar
                    </p>
                    <p className="mt-1 text-[#6B7280]">
                      Vence:{" "}
                      {new Intl.DateTimeFormat("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(pendingProposal.expiresAt))}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#1E2028] bg-[#101216] px-3 py-2 text-center font-semibold text-[#D6FF3D] shadow-sm border-[#1E2028] bg-[#0A0B0D]">
                    {proposalCountdown}
                  </div>
                </div>

                {isProposalExpired ? (
                  <p className="mt-4 rounded-xl border border-amber-900/60 bg-amber-950/30 px-3 py-2 text-amber-200">
                    Esta propuesta ya vencio. Estamos actualizando el estado.
                  </p>
                ) : null}

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Button
                    disabled={isProposalExpired || proposalAction !== null}
                    onClick={() => void handleProposalAction("confirm")}
                    className="bg-[#D6FF3D] text-[#0A0B0D] hover:bg-[#e4ff6a]"
                  >
                    {proposalAction === "confirm" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Confirmando...
                      </>
                    ) : (
                      "Confirmar"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={proposalAction !== null}
                    onClick={() => void handleProposalAction("reject")}
                    className="border-[#2a3036] bg-[#14161A] text-[#F2F3F5] hover:bg-[#1a1d24] hover:text-[#D6FF3D]"
                  >
                    {proposalAction === "reject" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Rechazando...
                      </>
                    ) : (
                      "Rechazar"
                    )}
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#1E2028] bg-[#14161A]/50 px-6 py-4 text-sm animate-in fade-in slide-in-from-bottom-3 duration-700 border-[#1E2028] bg-[#14161A]">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-[#6B7280]">Categoria</p>
                  <p className="font-medium text-[#F2F3F5]">{playerCategoryLabel}</p>
                </div>
                <div className="h-6 w-px bg-[#2a3036]" />
                <div className="text-center">
                  <p className="text-xs text-[#6B7280]">Modalidad</p>
                  <p className="font-medium text-[#F2F3F5]">
                    {playerGenderLabel}
                  </p>
                </div>
                <div className="h-6 w-px bg-[#2a3036]" />
                <div className="text-center">
                  <p className="text-xs text-[#6B7280]">Horario</p>
                  <p className="font-medium text-[#F2F3F5]">
                    {formatHour(timeRange[0])} - {formatHour(timeRange[1])}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <p className="max-w-md rounded-2xl border border-rose-900/60 bg-rose-950/30 px-4 py-3 text-sm text-rose-300">
                {error}
              </p>
            )}

            {requestStatus === "awaiting_payment" && pendingMatchEntry?.checkoutUrl ? (
              <div className="w-full max-w-md rounded-2xl border border-amber-900/60 bg-amber-950/30 px-5 py-4 text-sm animate-in fade-in slide-in-from-bottom-3 duration-500">
                <p className="font-semibold text-amber-100">
                  Falta acreditar el pago para entrar en la busqueda.
                </p>
                <p className="mt-1 text-amber-200">
                  Si ya pagaste, esta pantalla se actualiza sola. Si no, podés retomar el checkout.
                </p>
                <Button
                  onClick={handleContinuePayment}
                  className="mt-4 bg-amber-500 text-white hover:bg-amber-400"
                >
                  Continuar pago
                </Button>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => void refreshMatchFlow()}
                disabled={isRefreshingMatch || isCancellingMatch}
                className="border-[#2a3036] bg-[#14161A] text-[#F2F3F5] hover:bg-[#1a1d24] hover:text-[#D6FF3D]"
              >
                {isRefreshingMatch ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Consultando...
                  </>
                ) : (
                  "Actualizar estado"
                )}
              </Button>
              {requestStatus === "awaiting_payment" ? (
                <Button
                  variant="outline"
                  onClick={() => void handleCancelPaymentRequest()}
                  disabled={isRefreshingMatch || isCancellingMatch}
                  className="border-rose-900/60 bg-[#14161A] text-rose-300 hover:bg-rose-950/30 hover:text-rose-200 bg-[#14161A]"
                >
                  {isCancellingMatch ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelando...
                    </>
                  ) : (
                    "Cancelar pago"
                  )}
                </Button>
              ) : null}
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isCancellingMatch}
                className="border-[#2a3036] bg-[#14161A] text-[#F2F3F5] hover:bg-[#1a1d24] hover:text-[#D6FF3D]"
              >
                Enviar otra solicitud
              </Button>
            </div>
          </CardContent>
        </Card>

      
      </div>
    );
  }

  const MOCK_MATCHING_MATCHES = [
    { id: 1, time: "19:00", players: ["LR", "MD", "JP"], cat: "4ª", sex: "Masculino", court: "Cancha 3", missing: 1 },
    { id: 2, time: "20:30", players: ["TS", "NV"], cat: "4ª", sex: "Masculino", court: "Cancha 1", missing: 2 },
    { id: 3, time: "21:00", players: ["SR", "PV"], cat: "4ª", sex: "Mixto", court: "Cancha 2", missing: 2 },
    { id: 4, time: "21:30", players: ["AG", "BR"], cat: "4ª", sex: "Masculino", court: "Cancha 4", missing: 2 },
    { id: 5, time: "22:00", players: ["DC", "EF", "GH"], cat: "4ª", sex: "Masculino", court: "Cancha 1", missing: 1 },
  ];

  const allHours: number[] = [];
  for (let h = MIN_HOUR; h <= MAX_HOUR; h++) allHours.push(h);

  const handleHourTap = (h: number) => {
    if (rangeTap === "start") {
      if (h >= timeRange[1]) {
        setTimeRange([h, h + 1 <= MAX_HOUR ? h + 1 : MAX_HOUR]);
      } else {
        setTimeRange([h, timeRange[1]]);
      }
      setRangeTap("end");
    } else {
      if (h <= timeRange[0]) {
        setTimeRange([h > MIN_HOUR ? h - 1 : MIN_HOUR, h]);
      } else {
        setTimeRange([timeRange[0], h]);
      }
      setRangeTap("start");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#F2F3F5]">Armar partido</h2>
        <p className="text-sm text-[#6B7280]">Buscamos según tu categoría y horario</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(320px,420px)]">
      {/* Preferences card */}
      <div className="rounded-2xl border border-[#1E2028] bg-[#101216] p-5">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-[#6B7280]">Tus preferencias</p>

        {/* Category + Gender row */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#1E2028] bg-[#0A0B0D] p-3">
            <p className="text-[10px] text-[#6B7280]">Categoría</p>
            <p className="text-lg font-bold text-[#F2F3F5]">
              {player ? (
                <><span className="text-2xl">{player.category}ª</span> <span className="text-xs font-normal text-[#6B7280]">por defecto</span></>
              ) : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-[#1E2028] bg-[#0A0B0D] p-3">
            <p className="text-[10px] text-[#6B7280]">Sexo</p>
            <p className="text-lg font-bold text-[#F2F3F5]">
              {player
                ? player.gender === "male" ? "Masculino"
                  : player.gender === "female" ? "Femenino"
                  : "Mixto"
                : "—"}
            </p>
          </div>
        </div>

        {/* Time range selector */}
        <p className="mb-3 text-sm font-medium text-[#F2F3F5]">¿Cuándo podés jugar?</p>

        <div className="mb-2 flex gap-4 text-xs text-[#6B7280]">
          <span>Desde: <span className="font-semibold text-[#D6FF3D]">{formatHour(timeRange[0])}</span></span>
          <span>Hasta: <span className="font-semibold text-[#D6FF3D]">{formatHour(timeRange[1])}</span></span>
        </div>

        <div className="mb-5 grid grid-cols-5 gap-2">
          {allHours.map((h) => {
            const isStart = h === timeRange[0];
            const isEnd = h === timeRange[1];
            const isInRange = h > timeRange[0] && h < timeRange[1];
            const now = new Date();
            const cutoffMinutes = now.getHours() * 60 + now.getMinutes() + 30;
            const hourMinutes = h * 60;
            const isPast = hourMinutes < cutoffMinutes;

            return (
              <button
                key={h}
                onClick={() => !isPast && handleHourTap(h)}
                disabled={isPast}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  isPast
                    ? "border border-[#1E2028] bg-[#0A0B0D] text-[#3a3f48] cursor-not-allowed opacity-50"
                    : isStart || isEnd
                    ? "border border-[#D6FF3D] bg-[#D6FF3D]/20 text-[#D6FF3D]"
                    : isInRange
                    ? "border border-[#D6FF3D]/20 bg-[#D6FF3D]/8 text-[#D6FF3D]/70"
                    : "border border-[#1E2028] bg-[#0A0B0D] text-[#6B7280] hover:border-[#2a3036]"
                }`}
              >
                {formatHour(h)}
              </button>
            );
          })}
        </div>

        {/* Create match button */}
        <Button
          className="w-full rounded-2xl border border-[#2a3036] bg-[#14161A] text-sm font-medium text-[#9CA3AF] hover:bg-[#1a1d24] hover:text-[#F2F3F5]"
          variant="outline"
          size="lg"
          disabled={createMatchEntryIntentMutation.isPending}
          onClick={handleSubmit}
        >
          {createMatchEntryIntentMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando...
            </>
          ) : (
            "+ Crear partido abierto"
          )}
        </Button>
      </div>

      {error && <p className="rounded-2xl border border-rose-900/60 bg-rose-950/30 px-4 py-3 text-sm text-rose-300 lg:col-span-full">{error}</p>}

      {/* Matching matches (mock) */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#F2F3F5]">Partidos que coinciden</h3>
          <span className="text-xs text-[#6B7280]">{MOCK_MATCHING_MATCHES.length} disponibles</span>
        </div>
        <div className="space-y-3">
          {MOCK_MATCHING_MATCHES.map((match) => (
            <div key={match.id} className="rounded-2xl border border-[#1E2028] bg-[#101216] p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#F2F3F5]">{match.time}</span>
                  <span className="text-xs text-[#6B7280]">Hoy</span>
                </div>
                <span className="rounded-md bg-[#D6FF3D]/15 px-2 py-0.5 text-[10px] font-semibold text-[#D6FF3D]">
                  Tu nivel
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1.5">
                    {match.players.map((p) => (
                      <div key={p} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#101216] bg-[#1a1d24] text-[9px] font-bold text-[#9CA3AF]">
                        {p}
                      </div>
                    ))}
                    {Array.from({ length: match.missing }).map((_, i) => (
                      <div key={`m-${i}`} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#101216] bg-[#1a1d24] text-[9px] text-[#4B5563]">+</div>
                    ))}
                  </div>
                  <p className="text-xs text-[#6B7280]">
                    {match.cat} · {match.sex}<br />{match.court}
                  </p>
                </div>
                <button className="rounded-full border border-[#D6FF3D]/40 bg-[#D6FF3D]/10 px-4 py-1.5 text-xs font-semibold text-[#D6FF3D] transition hover:bg-[#D6FF3D]/20">
                  Unirme
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>

      <VerifyPlayerDialog
        open={verifyPlayer}
        onClose={() => setVerifyPlayer(false)}
      />
      <VerifyClubPlayerDialog
        slug={config.slug}
        open={verifyClubPlayer}
        onOpenChange={setVerifyClubPlayer}
      />
    </div>
  );
}
