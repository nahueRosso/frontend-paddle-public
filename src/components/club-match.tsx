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
import { fetchWithTenantAdmin } from "@/lib/fetchWithTenantAdmin";
import {
  clearPendingMatchEntry,
  getPendingMatchEntry,
  setPendingMatchEntry,
  type PendingMatchEntry,
} from "@/lib/pending-match-entry";
import { buildPendingPaymentOwnerIdentity } from "@/lib/pending-booking-payment";
import { usePlayer } from "@/providers/player-provider";
import VerifyClubPlayerDialog from "./verify-club-player-dialog";
import { Slider } from "./ui/slider";
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
  const response = await fetchWithTenantAdmin(
    `/match/request/${matchRequestId}/status`,
    { method: "GET", cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(await getResponseError(response));
  }

  return response.json() as Promise<MatchRequestStatusResponse>;
};

const fetchPendingMatchProposals = async ({
  tenantId,
  userPhone,
}: {
  tenantId: string;
  userPhone: string;
}) => {
  const params = new URLSearchParams({
    tenantId,
    phone: userPhone,
  });
  const response = await fetchWithTenantAdmin(
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
  const response = await fetchWithTenantAdmin(
    `/match/proposals/${proposalId}/${action}`,
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
  const [proposalAction, setProposalAction] = useState<
    "confirm" | "reject" | null
  >(null);
  const [refreshedExpiredProposalId, setRefreshedExpiredProposalId] =
    useState<string | null>(null);
  const [pendingMatchEntry, setPendingMatchEntryState] =
    useState<PendingMatchEntry | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const { player, playerId, personId, person } = usePlayer();
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
            tenantId: config.tenantId,
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
      tenantId: dto.tenantId,
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
        response.mode === "payment_required" ? response.checkoutUrl : undefined,
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
        tenantId: config.tenantId,
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

      if (response.mode === "payment_required") {
        window.location.href = response.checkoutUrl;
        return;
      }

      const pendingProposals = await fetchPendingMatchProposals({
        tenantId: config.tenantId,
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
        <section className="rounded-[2rem] border border-emerald-100 bg-white/75 p-6 shadow-lg shadow-emerald-100/60 backdrop-blur dark:border-emerald-900/60 dark:bg-slate-950/75 dark:shadow-emerald-950/20">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 lg:text-3xl">
            Buscar partido
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Encontra companeros para jugar.
          </p>
        </section>

        <Card className="w-full rounded-[1.75rem] border-emerald-100 bg-white/90 shadow-lg shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20">
          <CardContent className="flex flex-col items-center gap-5 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 animate-in zoom-in-50 duration-300 dark:bg-emerald-500/15 dark:text-emerald-300">
              {requestStatus === "awaiting_payment" ||
              requestStatus === "pending" ||
              requestStatus === "proposal_pending" ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <CheckCircle2 className="h-8 w-8" />
              )}
            </div>
            <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
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
              <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
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
              <div className="w-full max-w-md rounded-2xl border border-emerald-100 bg-emerald-50/60 px-5 py-4 text-sm animate-in fade-in slide-in-from-bottom-3 duration-500 dark:border-emerald-900/60 dark:bg-slate-900/70">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      Hay un partido para confirmar
                    </p>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">
                      Vence:{" "}
                      {new Intl.DateTimeFormat("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(pendingProposal.expiresAt))}
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2 text-center font-semibold text-emerald-700 shadow-sm dark:border-emerald-900/60 dark:bg-slate-950 dark:text-emerald-300">
                    {proposalCountdown}
                  </div>
                </div>

                {isProposalExpired ? (
                  <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                    Esta propuesta ya vencio. Estamos actualizando el estado.
                  </p>
                ) : null}

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Button
                    disabled={isProposalExpired || proposalAction !== null}
                    onClick={() => void handleProposalAction("confirm")}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
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
                    className="border-emerald-200 bg-white text-slate-900 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900/60 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-emerald-500/10"
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

            <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-6 py-4 text-sm animate-in fade-in slide-in-from-bottom-3 duration-700 dark:border-emerald-900/60 dark:bg-slate-900/70">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Categoria</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{playerCategoryLabel}</p>
                </div>
                <div className="h-6 w-px bg-emerald-200 dark:bg-emerald-900/60" />
                <div className="text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Modalidad</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {playerGenderLabel}
                  </p>
                </div>
                <div className="h-6 w-px bg-emerald-200 dark:bg-emerald-900/60" />
                <div className="text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Horario</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {formatHour(timeRange[0])} - {formatHour(timeRange[1])}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <p className="max-w-md rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
                {error}
              </p>
            )}

            {requestStatus === "awaiting_payment" && pendingMatchEntry?.checkoutUrl ? (
              <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-amber-50/70 px-5 py-4 text-sm animate-in fade-in slide-in-from-bottom-3 duration-500 dark:border-amber-900/60 dark:bg-amber-950/30">
                <p className="font-semibold text-amber-900 dark:text-amber-100">
                  Falta acreditar el pago para entrar en la busqueda.
                </p>
                <p className="mt-1 text-amber-800 dark:text-amber-200">
                  Si ya pagaste, esta pantalla se actualiza sola. Si no, podés retomar el checkout.
                </p>
                <Button
                  onClick={handleContinuePayment}
                  className="mt-4 bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
                >
                  Continuar pago
                </Button>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => void refreshMatchFlow()}
                disabled={isRefreshingMatch}
                className="border-emerald-200 bg-white text-slate-900 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900/60 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-emerald-500/10"
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
              <Button
                variant="outline"
                onClick={handleReset}
                className="border-emerald-200 bg-white text-slate-900 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900/60 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-emerald-500/10"
              >
                Enviar otra solicitud
              </Button>
            </div>
          </CardContent>
        </Card>

      
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-emerald-100 bg-white/75 p-6 shadow-lg shadow-emerald-100/60 backdrop-blur dark:border-emerald-900/60 dark:bg-slate-950/75 dark:shadow-emerald-950/20">
        <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Match inteligente
        </span>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 lg:text-3xl">
          Buscar partido
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
          Encontra companeros para jugar. Completa el formulario y te buscamos
          un turno.
        </p>
      </section>

      <Card className="w-full rounded-[1.75rem] border-emerald-100 bg-white/90 shadow-lg shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-slate-100">
            <Handshake className="h-5 w-5 text-emerald-600" />
            Datos del partido
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            Elegí tu categoria, el tipo de partido y el horario que preferis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className="space-y-2">
            <Label className="dark:text-slate-100">Categoría</Label>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm font-medium text-slate-800 dark:border-emerald-900/60 dark:bg-slate-900/70 dark:text-slate-100">
              {player ? `${player.category} categoría` : "Disponible al verificar en este club"}
            </div>
          </div>


          <div className="space-y-2">
            <Label className="dark:text-slate-100">Modalidad</Label>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm font-medium text-slate-800 dark:border-emerald-900/60 dark:bg-slate-900/70 dark:text-slate-100">
              {player
                ? player.gender === "male"
                  ? "Masculino"
                  : player.gender === "female"
                    ? "Femenino"
                    : "Mixto"
                : "Se habilita al verificar tu jugador del club"}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="dark:text-slate-100">Rango horario preferido</Label>

            {/* Slider */}
            <Slider
              min={MIN_HOUR}
              max={MAX_HOUR}
              step={1}
              value={timeRange}
              onValueChange={(value) => setTimeRange(value as [number, number])}
              className="mt-4"
            />

            {/* Valores visuales */}
            <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>Desde: {formatHour(timeRange[0])}</span>
              <span>Hasta: {formatHour(timeRange[1])}</span>
            </div>

            {/* Resumen destacado */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-300">
              Disponible entre {formatHour(timeRange[0])} y{" "}
              {formatHour(timeRange[1])}
            </div>
          </div>

          {/* Error */}
          {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">{error}</p>}

          {/* Submit */}
          <Button
            className="w-full dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
            size="lg"
            disabled={createMatchEntryIntentMutation.isPending}
            onClick={handleSubmit}
          >
            {createMatchEntryIntentMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Buscar partido"
            )}
          </Button>
        </CardContent>
      </Card>
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
