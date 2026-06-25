"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Loader2, MapPin, Trophy, Users } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useClub } from "@/context/club-context";
import { usePlayersByTenantQuery } from "@/hooks/queries/player";
import {
  useTournamentFixtureQuery,
  useTournamentsByStatusQuery,
} from "@/hooks/queries/tournament";
import {
  acceptTournamentPartnerRequest,
  addTournamentAvailablePlayer,
  createTournamentPaymentLink,
  createTournamentPartnerRequest,
  fetchEligibleTournamentPartners,
  fetchBillingTournamentStatus,
  fetchTournamentAvailablePlayers,
  fetchTournamentPartnerRequests,
  fetchTournamentRegistrationOptions,
  pickTournamentAvailablePlayer,
  rejectTournamentPartnerRequest,
  type BillingTournamentStatusResponse,
  type TournamentActionResponse,
  withdrawTournamentAvailablePlayer,
  type TournamentAvailablePlayer,
  type TournamentPartnerRequest,
  type TournamentRegistrationPlayer,
} from "@/lib/api/tournament";
import {
  getPartnerRequestRequester,
  getPartnerRequestRequested,
  getTournamentActionErrorMessage,
  isReceivedPartnerRequest,
  isSentPartnerRequest,
} from "@/components/club-partner-requests-dialog";
import type { TenantPlayer } from "@/lib/api/player";
import {
  clearPendingTournamentPayments,
  listPendingTournamentPayments,
  setPendingTournamentPayment,
  type PendingTournamentPayment,
} from "@/lib/pending-tournament-payment";
import { playerKeys } from "@/lib/queryKeys/player";
import { tournamentKeys } from "@/lib/queryKeys/tournament";
import { usePlayer } from "@/providers/player-provider";
import VerifyClubPlayerDialog from "./verify-club-player-dialog";
import type {
  GroupMatchSummary,
  GroupTeamStanding,
  GroupWrapper,
  MatchBookingInfo,
  MatchScore,
  PlayOffMatch,
  PlayOffTeam,
  TeamSummary,
  TournamentGroup,
} from "@/types/tournament-group";
import type {
  Gender,
  Tournament,
  TournamentCategory,
  TournamentResultTeam,
} from "@/types/tournament";

type TournamentView = "upcoming" | "ongoing" | "finished";
type EligiblePlayer = {
  category: number | null;
  gender: string;
  status: "pending" | "verified" | "rejected" | null;
};
type FinishedTournamentRow = {
  id: string;
  position: number;
  label: string;
  teamName: string;
  points: number;
};
type ReadOnlyGroupMatch = GroupMatchSummary & {
  score?: MatchScore | null;
};

const VIEWS: { id: TournamentView; label: string }[] = [
  { id: "upcoming", label: "Inscripciones" },
  { id: "ongoing", label: "En curso" },
  { id: "finished", label: "Finalizados" },
];

const CATEGORIES = ["Todas", "1ra", "2da", "3ra", "4ta", "5ta", "6ta", "7ma", "8va"];

export function ClubTorneos() {
  const { config } = useClub();
  const queryClient = useQueryClient();
  const { data: players = [], isLoading: isLoadingPlayers } =
    usePlayersByTenantQuery(config.tenantId);
  const [activeView, setActiveView] = React.useState<TournamentView>("upcoming");

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    const externalReference = url.searchParams.get("external_reference");
    const paymentStatus = url.searchParams.get("status");
    const paymentId = url.searchParams.get("payment_id");
    const hasMercadoPagoReturn =
      Boolean(externalReference) || Boolean(paymentStatus) || Boolean(paymentId);

    if (!hasMercadoPagoReturn) {
      return;
    }

    const clearMercadoPagoParams = () => {
      const nextUrl = new URL(window.location.href);
      [
        "collection_id",
        "collection_status",
        "payment_id",
        "status",
        "external_reference",
        "merchant_order_id",
        "preference_id",
        "site_id",
        "processing_mode",
        "merchant_account_id",
        "mp_result",
      ].forEach((param) => nextUrl.searchParams.delete(param));
      nextUrl.searchParams.set("section", "torneos");
      window.history.replaceState(null, "", nextUrl.toString());
    };

    if (!externalReference) {
      toast.error("No recibimos una referencia valida del pago del torneo.");
      clearMercadoPagoParams();
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const refreshTournamentState = async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: tournamentKeys.all }),
        queryClient.invalidateQueries({ queryKey: playerKeys.all }),
      ]);
    };

    const finalize = async (
      uiState: "approved" | "pending" | "rejected" | "unknown",
      response?: BillingTournamentStatusResponse | null,
    ) => {
      if (cancelled) {
        return true;
      }

      if (uiState === "approved" || uiState === "rejected") {
        clearPendingTournamentPayments((pending) =>
          matchesTournamentPendingPayment(pending, externalReference, response),
        );
      }

      if (uiState === "approved") {
        await refreshTournamentState();
        toast.success("Inscripcion paga. El equipo fue actualizado.");
      } else if (uiState === "pending") {
        toast("El pago sigue pendiente. Volve a intentar en unos segundos.");
      } else if (uiState === "rejected") {
        toast.error("Mercado Pago no aprobo el pago del torneo.");
      } else {
        toast("Recibimos el retorno del pago. Actualiza la seccion si no ves cambios.");
      }

      clearMercadoPagoParams();
      return true;
    };

    const pollStatus = async () => {
      while (!cancelled && attempts < 10) {
        attempts += 1;

        try {
          const response = await fetchBillingTournamentStatus(externalReference);
          const resolvedStatus = getTournamentBillingState(response, paymentStatus);

          if (resolvedStatus === "approved") {
            await finalize("approved", response);
            return;
          }

          if (resolvedStatus === "rejected") {
            await finalize("rejected", response);
            return;
          }

          if (resolvedStatus === "pending" && attempts < 10) {
            await new Promise((resolve) => window.setTimeout(resolve, 3000));
            continue;
          }

          await finalize(resolvedStatus, response);
          return;
        } catch (error) {
          if (attempts >= 3) {
            toast.error(
              error instanceof Error
                ? error.message
                : "No pudimos validar el pago del torneo.",
            );
            clearMercadoPagoParams();
            return;
          }

          await new Promise((resolve) => window.setTimeout(resolve, 2000));
        }
      }
    };

    void pollStatus();

    return () => {
      cancelled = true;
    };
  }, [queryClient]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#F2F3F5]">Torneos</h2>
        <p className="text-sm text-[#6B7280]">Inscripciones abiertas</p>
      </div>

      {/* View toggle */}
      <div className="flex rounded-xl border border-[#1E2028] bg-[#101216] p-1 w-fit">
        {VIEWS.map((view) => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id)}
            className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${
              activeView === view.id
                ? "bg-[#F2F3F5] text-[#0A0B0D]"
                : "text-[#6B7280] hover:text-[#9CA3AF]"
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {activeView === "upcoming" ? (
        <TournamentList status="upcoming" />
      ) : null}
      {activeView === "ongoing" ? (
        <TournamentList status="ongoing" />
      ) : null}
      {activeView === "finished" ? (
        <TournamentList status="finished" />
      ) : null}
    </div>
  );
}

export function ClubRanking() {
  return <ClubTorneos />;
}

function TournamentList({
  status,
}: {
  status: "upcoming" | "ongoing" | "finished";
}) {
  const { config } = useClub();
  const { data: tournaments = [], isLoading } = useTournamentsByStatusQuery(
    config.tenantId,
    status,
  );
  const { data: fixtureTournaments = [], isLoading: isLoadingFixture } =
    useTournamentFixtureQuery(config.tenantId);
  const [selectedRegisterTournament, setSelectedRegisterTournament] =
    React.useState<Tournament | null>(null);
  const [verifyClubPlayerOpen, setVerifyClubPlayerOpen] = React.useState(false);
  const [selectedOngoingTournament, setSelectedOngoingTournament] =
    React.useState<Tournament | null>(null);
  const [selectedFinishedTournament, setSelectedFinishedTournament] =
    React.useState<Tournament | null>(null);

  const selectedOngoingFixture = React.useMemo(
    () =>
      selectedOngoingTournament
        ? fixtureTournaments.find(
            (fixture) => String(fixture.id) === selectedOngoingTournament.id,
          ) ?? null
        : null,
    [fixtureTournaments, selectedOngoingTournament],
  );

  if (isLoading) {
    return <TournamentSkeleton />;
  }

  if (tournaments.length === 0) {
    return (
      <EmptyState
        title={getEmptyTitle(status)}
        description={getEmptyDescription(status)}
      />
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tournaments.map((tournament) => (
          <PlayerTournamentCard
            key={tournament.id}
            tournament={tournament}
            status={status}
            onRegister={() => setSelectedRegisterTournament(tournament)}
            onRequireClubVerification={() => setVerifyClubPlayerOpen(true)}
            onOpenDetails={
              status === "ongoing"
                ? () => setSelectedOngoingTournament(tournament)
                : status === "finished"
                ? () => setSelectedFinishedTournament(tournament)
                : undefined
            }
          />
        ))}
      </div>

      <TournamentRegisterDialog
        tournament={selectedRegisterTournament}
        open={Boolean(selectedRegisterTournament)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRegisterTournament(null);
          }
        }}
      />

      <VerifyClubPlayerDialog
        slug={config.slug}
        open={verifyClubPlayerOpen}
        onOpenChange={setVerifyClubPlayerOpen}
      />

      <OngoingTournamentDialog
        tournament={selectedOngoingTournament}
        fixtureTournament={selectedOngoingFixture}
        loading={isLoadingFixture}
        open={Boolean(selectedOngoingTournament)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOngoingTournament(null);
          }
        }}
      />

      <FinishedTournamentDialog
        tournament={selectedFinishedTournament}
        open={Boolean(selectedFinishedTournament)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedFinishedTournament(null);
          }
        }}
      />
    </>
  );
}

function PlayerTournamentCard({
  tournament,
  status,
  onRegister,
  onRequireClubVerification,
  onOpenDetails,
}: {
  tournament: Tournament;
  status: "upcoming" | "ongoing" | "finished";
  onRegister: () => void;
  onRequireClubVerification: () => void;
  onOpenDetails?: () => void;
}) {
  const eligibility = useTournamentEligibility(tournament);
  const category = tournament.categories?.[0] ?? null;
  const approvedTeams = (tournament.teams ?? []).filter(
    (team) => team.approved,
  ).length;
  const pendingTeams = (tournament.teams ?? []).length - approvedTeams;

  const maxTeams = (tournament as Record<string, unknown>).maxTeams as number | undefined ?? (tournament.teams?.length ? Math.max(tournament.teams.length, approvedTeams + 4) : 32);
  const progressPct = maxTeams > 0 ? Math.min((approvedTeams / maxTeams) * 100, 100) : 0;

  return (
    <div
      role={onOpenDetails ? "button" : undefined}
      tabIndex={onOpenDetails ? 0 : undefined}
      onClick={onOpenDetails}
      onKeyDown={(event) => {
        if (!onOpenDetails) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetails();
        }
      }}
      className={`overflow-hidden rounded-2xl border border-[#1E2028] bg-[#14161A] ${
        onOpenDetails ? "cursor-pointer transition hover:border-[#2a3036]" : ""
      }`}
    >
      {/* Gradient bar at top */}
      <div className="h-2" style={{ background: "linear-gradient(90deg, #D6FF3D, #9fd0f0)" }} />

      <div className="p-4">
        {/* Title + status */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#F2F3F5]">{tournament.name}</h3>
            <p className="mt-0.5 text-xs text-[#6B7280]">
              {formatDate(tournament.startDate)} · {formatTournamentFormat(tournament.format)}
            </p>
          </div>
          <span className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
            status === "upcoming"
              ? "bg-[#D6FF3D]/13 text-[#D6FF3D]"
              : status === "ongoing"
              ? "bg-blue-500/13 text-blue-300"
              : "bg-[#1E2028] text-[#6B7280]"
          }`}>
            {getStatusLabel(status)}
          </span>
        </div>

        {/* Tags */}
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-lg border border-[#1E2028] bg-[#0F1114] px-2.5 py-1 text-[11px] text-[#9CA3AF]">
            Cat. {formatTournamentCategory(tournament)}
          </span>
          {(tournament as Record<string, unknown>).registrationPrice != null && (
            <span className="rounded-lg border border-[#1E2028] bg-[#0F1114] px-2.5 py-1 text-[11px] text-[#9CA3AF]">
              ${Number((tournament as Record<string, unknown>).registrationPrice).toLocaleString()} / pareja
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-3 flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-[#0F1114] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, #9fd0f0, #D6FF3D)",
              }}
            />
          </div>
          <span className="text-xs text-[#6B7280] shrink-0">{approvedTeams}/{maxTeams}</span>
        </div>

        {/* Actions */}
        {status === "upcoming" ? (
          <>
            {!eligibility.canRegister && !eligibility.requiresClubVerification ? (
              <p className="mb-3 rounded-xl border border-amber-900/60 bg-amber-950/30 px-3 py-2 text-xs text-amber-200">
                {eligibility.reason}
              </p>
            ) : null}
            <Button
              className="w-full rounded-xl bg-[#D6FF3D] text-[#0A0B0D] font-semibold hover:bg-[#e4ff6a]"
              disabled={!eligibility.canRegister && !eligibility.requiresClubVerification}
              onClick={(e) => {
                e.stopPropagation();
                (eligibility.requiresClubVerification ? onRequireClubVerification : onRegister)();
              }}
            >
              Inscribirme
            </Button>
          </>
        ) : status === "finished" && tournament.results ? (
          <div className="rounded-xl border border-[#1E2028] bg-[#0F1114] px-3 py-2 text-xs">
            <span className="text-[#6B7280]">Campeones: </span>
            <span className="font-medium text-[#F2F3F5]">{formatTeamName(tournament.results.champion)}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FinishedTournamentDialog({
  tournament,
  open,
  onOpenChange,
}: {
  tournament: Tournament | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const rows = React.useMemo(
    () => (tournament ? buildFinishedTournamentRows(tournament) : []),
    [tournament],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-[#1E2028] bg-[#14161A] text-[#F2F3F5] shadow-xl shadow-emerald-100/60 border-[#1E2028] bg-[#0A0B0D]  sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Resultados del torneo{tournament ? ` - ${tournament.name}` : ""}
          </DialogTitle>
          <DialogDescription className="text-[#6B7280]">
            Posiciones finales y puntos otorgados a los equipos que finalizaron.
          </DialogDescription>
        </DialogHeader>

        {tournament ? (
          <div className="space-y-4">
            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <InfoBox label="Formato" value={formatTournamentFormat(tournament.format)} />
              <InfoBox label="Tipo" value={formatTournamentType(tournament.type)} />
              <InfoBox label="Categoria" value={formatTournamentCategory(tournament)} />
              <InfoBox
                label="Fechas"
                value={`${formatDate(tournament.startDate)} - ${formatDate(tournament.endDate)}`}
              />
            </div>

            {rows.length > 0 ? (
              <Card className="overflow-hidden rounded-[1.25rem] border-[#1E2028] bg-[#101216] border-[#1E2028] bg-[#101216]">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20 text-center">#</TableHead>
                        <TableHead>Equipo</TableHead>
                        <TableHead className="hidden sm:table-cell">Resultado</TableHead>
                        <TableHead className="text-right">Puntos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="text-center">
                            <PositionBadge position={row.position} />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-[#F2F3F5]">
                                {row.teamName}
                              </span>
                              <span className="text-xs text-[#6B7280] sm:hidden">
                                {row.label}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge
                              variant={row.position === 1 ? "default" : "outline"}
                              className={
                                row.position === 1
                                  ? "bg-amber-500 text-[#0A0B0D] hover:bg-amber-500"
                                  : "border-[#2a3036] bg-[#D6FF3D]/10 text-[#D6FF3D]"
                              }
                            >
                              {row.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-mono text-sm font-semibold text-[#F2F3F5]">
                              {row.points.toLocaleString()}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <p className="rounded-2xl border border-amber-900/60 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
                Este torneo todavía no tiene resultados cargados.
              </p>
            )}
          </div>
        ) : null}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#2a3036] bg-[#14161A] text-[#F2F3F5] hover:bg-[#1a1d24] hover:text-[#D6FF3D]"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OngoingTournamentDialog({
  tournament,
  fixtureTournament,
  loading,
  open,
  onOpenChange,
}: {
  tournament: Tournament | null;
  fixtureTournament: TournamentGroup | null;
  loading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const activeTournament = fixtureTournament ?? tournament;
  const hasGroups = Boolean(fixtureTournament?.groups?.length);
  const hasPlayoff = Boolean(fixtureTournament?.playOff?.matches?.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-[#1E2028] bg-[#14161A] text-[#F2F3F5] shadow-xl shadow-emerald-100/60 border-[#1E2028] bg-[#0A0B0D]  sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>
            Torneo en curso{activeTournament ? ` - ${activeTournament.name}` : ""}
          </DialogTitle>
          <DialogDescription className="text-[#6B7280]">
            Fixture, tablas y cruces disponibles solo para consulta.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center gap-2 rounded-2xl border border-[#1E2028] px-4 py-3 text-sm text-[#6B7280] border-[#1E2028]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando fixture...
          </div>
        ) : activeTournament ? (
          <div className="space-y-5">
            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <InfoBox label="Formato" value={formatTournamentFormat(activeTournament.format)} />
              <InfoBox label="Estado" value={formatOngoingTournamentStage(fixtureTournament?.status)} />
              <InfoBox
                label="Partidos"
                value={
                  fixtureTournament
                    ? `${fixtureTournament.finishedMatch ?? 0}/${fixtureTournament.totalMatches ?? 0}`
                    : "Sin fixture"
                }
              />
              <InfoBox
                label="Fechas"
                value={`${formatDate(activeTournament.startDate)} - ${formatDate(activeTournament.endDate)}`}
              />
            </div>

            {fixtureTournament ? (
              <>
                {hasPlayoff && fixtureTournament.status === "playoff" ? (
                  <ReadOnlyPlayoffSection tournament={fixtureTournament} />
                ) : null}

                {hasGroups ? (
                  <ReadOnlyGroupsSection tournament={fixtureTournament} />
                ) : null}

                {hasPlayoff && fixtureTournament.status !== "playoff" ? (
                  <ReadOnlyPlayoffSection tournament={fixtureTournament} />
                ) : null}

                {!hasGroups && !hasPlayoff ? (
                  <p className="rounded-2xl border border-amber-900/60 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
                    Este torneo todavía no tiene fixture disponible.
                  </p>
                ) : null}
              </>
            ) : (
              <p className="rounded-2xl border border-amber-900/60 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
                No se encontró el fixture de este torneo.
              </p>
            )}
          </div>
        ) : null}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#2a3036] bg-[#14161A] text-[#F2F3F5] hover:bg-[#1a1d24] hover:text-[#D6FF3D]"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReadOnlyGroupsSection({ tournament }: { tournament: TournamentGroup }) {
  return (
    <section className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D6FF3D]">
          Grupos
        </p>
        <h4 className="text-base font-semibold text-[#F2F3F5]">
          Tabla y partidos de grupos
        </h4>
      </div>

      <div className="grid gap-5">
        {tournament.groups.map((group, groupIndex) => (
          <ReadOnlyGroupCard
            key={`${group.id}-${groupIndex}`}
            group={group}
            groupIndex={groupIndex}
            qualifyPerGroup={tournament.qualifyPerGroup ?? 0}
          />
        ))}
      </div>
    </section>
  );
}

function ReadOnlyGroupCard({
  group,
  groupIndex,
  qualifyPerGroup,
}: {
  group: GroupWrapper;
  groupIndex: number;
  qualifyPerGroup: number;
}) {
  const sortedTeams = [...group.teams].sort(compareGroupStandings);

  return (
    <section className="overflow-hidden rounded-2xl border border-[#1E2028] bg-[#101216] shadow-sm border-[#1E2028] bg-[#101216]">
      <div className="border-b border-[#1E2028] px-5 py-4 border-[#1E2028]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-[#6B7280]">
              Zona {groupIndex + 1}
            </p>
            <h3 className="text-xl font-semibold text-[#F2F3F5]">
              {group.name || `Grupo ${groupIndex + 1}`}
            </h3>
            <p className="text-sm text-[#6B7280]">
              Categoria {String(group.category?.categoryLevel ?? "-")} ·{" "}
              {formatGender(group.category?.gender ?? "")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-[#2a3036] bg-[#D6FF3D]/10 text-[#D6FF3D]">
              {group.teams.length} equipos
            </Badge>
            <Badge variant="outline" className="border-blue-900/60 bg-blue-950/30 text-blue-300">
              Clasifican {qualifyPerGroup}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <ReadOnlyGroupMatches matches={group.matches} groupIndex={groupIndex} />
        <ReadOnlyGroupStandings teams={sortedTeams} qualifyPerGroup={qualifyPerGroup} />
      </div>
    </section>
  );
}

function ReadOnlyGroupMatches({
  matches,
  groupIndex,
}: {
  matches: GroupMatchSummary[];
  groupIndex: number;
}) {
  return (
    <div className="rounded-xl border border-[#1E2028] bg-[#14161A]/40 p-3 border-[#1E2028] bg-[#14161A]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-[#F2F3F5]">
            Partidos
          </p>
          <p className="text-xs text-[#6B7280]">
            Fixture del grupo
          </p>
        </div>
        <Badge variant="outline">{matches.length}</Badge>
      </div>

      <div className="space-y-2">
        {matches.map((match, index) => {
          const hasResult = Boolean(match.finished);

          return (
            <div
              key={`${match.id}-${groupIndex}-${index}`}
              className="rounded-xl border border-[#1E2028] bg-[#101216] px-4 py-3 border-[#1E2028] bg-[#101216]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#F2F3F5]">
                    Partido {index + 1}
                  </p>
                  <p className="mt-1 truncate text-xs text-[#6B7280]">
                    {formatTeamSummaryName(match.team1, index * 2 + 1)} vs{" "}
                    {formatTeamSummaryName(match.team2, index * 2 + 2)}
                  </p>
                  <MatchBookingHint booking={match.booking} />
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Badge
                    variant="outline"
                    className={
                      hasResult
                        ? "border-[#2a3036] bg-[#D6FF3D]/10 text-[#D6FF3D]"
                        : "border-amber-900/60 bg-amber-950/30 text-amber-200"
                    }
                  >
                    {hasResult ? "Finalizado" : "Pendiente"}
                  </Badge>
                  <span className="text-xs font-semibold text-[#6B7280]">
                    {formatMatchScore(getGroupMatchScore(match))}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReadOnlyGroupStandings({
  teams,
  qualifyPerGroup,
}: {
  teams: GroupTeamStanding[];
  qualifyPerGroup: number;
}) {
  return (
    <div className="rounded-xl border border-[#1E2028] bg-[#14161A]/40 p-3 border-[#1E2028] bg-[#14161A]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-[#F2F3F5]">
            Tabla
          </p>
          <p className="text-xs text-[#6B7280]">
            Posiciones actuales
          </p>
        </div>
        <Trophy className="h-4 w-4 text-[#6B7280]" />
      </div>

      <div className="overflow-hidden rounded-lg border border-[#1E2028]">
        <div className="grid grid-cols-[minmax(0,1.9fr)_42px_42px_42px_42px_58px] items-center gap-2 border-b border-[#1E2028] bg-[#14161A] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#6B7280] border-[#1E2028] bg-[#101216]">
          <span>Equipo</span>
          <span className="text-center">PJ</span>
          <span className="text-center">PG</span>
          <span className="text-center">PP</span>
          <span className="text-center">DS</span>
          <span className="text-right">PTS</span>
        </div>

        <div className="divide-y divide-[#1E2028]">
          {teams.map((team, index) => {
            const position = index + 1;
            const qualifies = position <= qualifyPerGroup;
            const setsDiff = (team.setsWon ?? 0) - (team.setsLost ?? 0);

            return (
              <div
                key={`${team.id}-${index}`}
                className="grid grid-cols-[minmax(0,1.9fr)_42px_42px_42px_42px_58px] items-center gap-2 bg-[#101216] px-3 py-3 bg-[#101216]"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                      qualifies
                        ? "bg-[#D6FF3D] text-[#0A0B0D]"
                        : "bg-[#1a1d24] text-[#6B7280] bg-[#14161A]"
                    }`}
                  >
                    {position}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#F2F3F5]">
                      {formatTeamSummaryName(team.team, position)}
                    </p>
                    <p className="truncate text-xs text-[#6B7280]">
                      {formatTeamSummaryPlayers(team.team)}
                    </p>
                  </div>
                </div>

                <span className="text-center text-sm">{team.matchesPlayed}</span>
                <span className="text-center text-sm">{team.matchesWon}</span>
                <span className="text-center text-sm">{team.matchesLost}</span>
                <span className="text-center text-sm">
                  {setsDiff > 0 ? `+${setsDiff}` : setsDiff}
                </span>
                <span className="text-right text-base font-semibold">{team.points}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ReadOnlyPlayoffSection({ tournament }: { tournament: TournamentGroup }) {
  const matchesByRound = React.useMemo(() => {
    const map = new Map<number, PlayOffMatch[]>();

    for (const match of tournament.playOff?.matches ?? []) {
      const bucket = map.get(match.round) ?? [];
      bucket.push(match);
      map.set(match.round, bucket);
    }

    return [...map.entries()]
      .sort(([leftRound], [rightRound]) => rightRound - leftRound)
      .map(([round, matches]) => ({
        round,
        matches: matches.sort((left, right) => left.matchNumber - right.matchNumber),
      }));
  }, [tournament.playOff?.matches]);

  if (matchesByRound.length === 0) return null;

  return (
    <section className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D6FF3D]">
          Playoff
        </p>
        <h4 className="text-base font-semibold text-[#F2F3F5]">
          Llave de eliminacion directa
        </h4>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {matchesByRound.map(({ round, matches }) => (
          <div
            key={round}
            className="rounded-2xl border border-[#1E2028] bg-[#101216] p-4 shadow-sm border-[#1E2028] bg-[#101216]"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold text-[#F2F3F5]">
                {formatPlayoffRound(round)}
              </p>
              <Badge variant="outline">{matches.length} partidos</Badge>
            </div>
            <div className="space-y-2">
              {matches.map((match) => (
                <ReadOnlyPlayoffMatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReadOnlyPlayoffMatchCard({ match }: { match: PlayOffMatch }) {
  return (
    <div className="rounded-xl border border-[#1E2028] bg-[#14161A]/40 px-4 py-3 border-[#1E2028] bg-[#14161A]">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
          Juego {match.matchNumber}
        </p>
        <Badge
          variant="outline"
          className={
            match.finished
              ? "border-[#2a3036] bg-[#D6FF3D]/10 text-[#D6FF3D]"
              : "border-amber-900/60 bg-amber-950/30 text-amber-200"
          }
        >
          {match.finished ? "Finalizado" : "Pendiente"}
        </Badge>
      </div>

      <div className="space-y-1">
        <PlayoffTeamLine
          team={match.team1}
          winnerId={match.winner?.id}
          fallback="Pendiente"
          score={getPlayoffTeamScore(match.score, "team1")}
        />
        <PlayoffTeamLine
          team={match.team2}
          winnerId={match.winner?.id}
          fallback="Pendiente"
          score={getPlayoffTeamScore(match.score, "team2")}
        />
      </div>

      <MatchBookingHint booking={match.booking} />
    </div>
  );
}

function PlayoffTeamLine({
  team,
  winnerId,
  fallback,
  score,
}: {
  team: PlayOffTeam | null;
  winnerId?: string;
  fallback: string;
  score: string;
}) {
  const isWinner = Boolean(winnerId && team?.id === winnerId);

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm ${
        isWinner
          ? "bg-[#D6FF3D] text-[#0A0B0D]"
          : "bg-[#14161A] text-[#9CA3AF] bg-[#101216]"
      }`}
    >
      <span className="truncate font-medium">
        {team ? formatTournamentTeamName(team.tournamentTeam, team.seed) : fallback}
      </span>
      <span className="shrink-0 font-mono text-xs font-semibold">{score}</span>
    </div>
  );
}

function TournamentRegisterDialog({
  tournament,
  open,
  onOpenChange,
}: {
  tournament: Tournament | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { config } = useClub();
  const { clubPlayer, person, playerId } = usePlayerSafe();
  const resolvedPlayerId = playerId ?? undefined;
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = React.useState("");
  const [flow, setFlow] = React.useState<"partner" | "available" | null>(null);
  const [partnerSearch, setPartnerSearch] = React.useState("");
  const [selectedPartnerId, setSelectedPartnerId] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [pendingTournamentPayment, setPendingTournamentPaymentState] =
    React.useState<PendingTournamentPayment | null>(null);
  const [paymentResolved, setPaymentResolved] = React.useState(false);

  const categories = React.useMemo(
    () => tournament?.categories ?? [],
    [tournament],
  );
  const requiresCategory = Boolean(tournament && tournament.type !== "sum");
  const needsCategorySelection = requiresCategory && categories.length > 1;
  const categoryReady = !requiresCategory || Boolean(selectedCategoryId);
  const apiCategoryId =
    tournament?.type === "sum" ? undefined : selectedCategoryId || undefined;
  const canRunTournamentQueries = Boolean(
    open && tournament?.id && config.tenantId && playerId && categoryReady,
  );

  const tournamentType = tournament?.type;
  const firstTournamentCategory = tournament?.categories?.[0];

  React.useEffect(() => {
    if (tournamentType === "sum") {
      setSelectedCategoryId("");
    } else {
      setSelectedCategoryId(getTournamentCategoryId(firstTournamentCategory) ?? "");
    }
    setFlow(null);
    setPartnerSearch("");
    setSelectedPartnerId("");
    setError("");
    setSuccess("");
    setPendingTournamentPaymentState(null);
    setPaymentResolved(false);
  }, [firstTournamentCategory, tournament?.id, tournamentType]);

  React.useEffect(() => {
    setFlow(null);
    setPartnerSearch("");
    setSelectedPartnerId("");
    setError("");
    setSuccess("");
    setPendingTournamentPaymentState(null);
    setPaymentResolved(false);
  }, [selectedCategoryId]);

  const registrationOptionsQuery = useQuery({
    queryKey: tournamentKeys.registrationOptions(
      config.tenantId,
      tournament?.id,
      resolvedPlayerId,
      apiCategoryId,
    ),
    queryFn: () =>
      fetchTournamentRegistrationOptions({
        tenantId: config.tenantId,
        tournamentId: tournament!.id,
        playerId: resolvedPlayerId!,
        categoryId: apiCategoryId,
      }),
    enabled: canRunTournamentQueries,
  });

  const eligiblePartnersQuery = useQuery({
    queryKey: tournamentKeys.eligiblePartners(
      config.tenantId,
      tournament?.id,
      resolvedPlayerId,
      apiCategoryId,
    ),
    queryFn: () =>
      fetchEligibleTournamentPartners({
        tenantId: config.tenantId,
        tournamentId: tournament!.id,
        playerId: resolvedPlayerId!,
        categoryId: apiCategoryId,
      }),
    enabled: canRunTournamentQueries && flow === "partner",
  });

  const availablePlayersQuery = useQuery({
    queryKey: tournamentKeys.availablePlayers(
      config.tenantId,
      tournament?.id,
      apiCategoryId,
    ),
    queryFn: () =>
      fetchTournamentAvailablePlayers({
        tenantId: config.tenantId,
        tournamentId: tournament!.id,
        categoryId: apiCategoryId,
      }),
    enabled: canRunTournamentQueries,
  });

  const partnerRequestsQuery = useQuery({
    queryKey: tournamentKeys.partnerRequests(config.tenantId, resolvedPlayerId),
    queryFn: () =>
      fetchTournamentPartnerRequests({
        tenantId: config.tenantId,
        playerId: resolvedPlayerId!,
      }),
    enabled: Boolean(open && config.tenantId && resolvedPlayerId),
  });

  const invalidateRegistrationState = React.useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: tournamentKeys.list(config.tenantId) }),
      queryClient.invalidateQueries({ queryKey: tournamentKeys.fixture(config.tenantId) }),
      queryClient.invalidateQueries({ queryKey: tournamentKeys.partnerRequests(config.tenantId, resolvedPlayerId) }),
      queryClient.invalidateQueries({ queryKey: tournamentKeys.registrationOptions(config.tenantId, tournament?.id, resolvedPlayerId, apiCategoryId) }),
      queryClient.invalidateQueries({ queryKey: tournamentKeys.availablePlayers(config.tenantId, tournament?.id, apiCategoryId) }),
      queryClient.invalidateQueries({ queryKey: tournamentKeys.eligiblePartners(config.tenantId, tournament?.id, resolvedPlayerId, apiCategoryId) }),
      queryClient.invalidateQueries({ queryKey: playerKeys.all }),
    ]);
  }, [apiCategoryId, config.tenantId, queryClient, resolvedPlayerId, tournament?.id]);

  const fetchLatestRegistrationOptions = React.useCallback(async () => {
    if (!tournament?.id || !resolvedPlayerId) {
      return null;
    }

    return queryClient.fetchQuery({
      queryKey: tournamentKeys.registrationOptions(
        config.tenantId,
        tournament.id,
        resolvedPlayerId,
        apiCategoryId,
      ),
      queryFn: () =>
        fetchTournamentRegistrationOptions({
          tenantId: config.tenantId,
          tournamentId: tournament.id,
          playerId: resolvedPlayerId,
          categoryId: apiCategoryId,
        }),
    });
  }, [
    apiCategoryId,
    config.tenantId,
    queryClient,
    resolvedPlayerId,
    tournament?.id,
  ]);

  const syncPendingTournamentPayment = React.useCallback(
    (teamId?: string | null) => {
      if (typeof window === "undefined" || !tournament?.id) {
        setPendingTournamentPaymentState(null);
        return;
      }

      const matchingPayment =
        listPendingTournamentPayments().find(({ value }) => {
          if (value.tournamentId !== tournament.id) {
            return false;
          }

          if (teamId && value.tournamentTeamId !== teamId) {
            return false;
          }

          return true;
        })?.value ?? null;

      setPendingTournamentPaymentState(matchingPayment);
    },
    [tournament?.id],
  );

  const handleTeamPayment = React.useCallback(
    async (response: TournamentActionResponse) => {
      const actionMessage =
        typeof response.message === "string" && response.message.trim()
          ? response.message
          : "La pareja fue creada correctamente.";

      setSuccess(actionMessage);
      await invalidateRegistrationState();
      const refreshedOptions = await fetchLatestRegistrationOptions();
      const teamId =
        extractTournamentTeamId(response) ?? extractTournamentTeamId(refreshedOptions);
      syncPendingTournamentPayment(teamId);

      if (!teamId || !tournament?.id) {
        toast.success(actionMessage);
        return;
      }

      const billingContact = getTournamentBillingContact(clubPlayer, person);

      if (
        !billingContact.playerName ||
        !billingContact.playerPhone ||
        !billingContact.playerEmail
      ) {
        const message =
          "La pareja se creo, pero faltan tus datos de contacto para iniciar el pago.";
        setError(message);
        toast.error(message);
        return;
      }

      try {
        const paymentResponse = await createTournamentPaymentLink({
          tenantId: config.tenantId,
          tournamentTeamId: teamId,
          playerName: billingContact.playerName,
          playerPhone: billingContact.playerPhone,
          playerEmail: billingContact.playerEmail,
          tournamentId: tournament.id,
        });

        if (paymentResponse.alreadyPaid) {
          clearPendingTournamentPayments(
            (pending) =>
              pending.tenantId === config.tenantId &&
              pending.tournamentTeamId === teamId,
          );
          setPendingTournamentPaymentState(null);
          setPaymentResolved(true);
          setSuccess("Inscripcion paga.");
          toast.success("Inscripcion paga.");
          await invalidateRegistrationState();
          return;
        }

        if (paymentResponse.checkoutUrl) {
          const nextPendingPayment: PendingTournamentPayment = {
            tenantId: config.tenantId,
            slug: config.slug,
            tournamentId: tournament.id,
            tournamentTeamId: teamId,
            checkoutUrl: paymentResponse.checkoutUrl,
            externalReference:
              getStringValue(paymentResponse.externalReference) ?? undefined,
          };

          setPendingTournamentPayment(nextPendingPayment);
          setPendingTournamentPaymentState(nextPendingPayment);
          setPaymentResolved(false);
          window.location.href = paymentResponse.checkoutUrl;
          return;
        }
      } catch (paymentError) {
        const message =
          paymentError instanceof Error
            ? paymentError.message
            : "La pareja se creo, pero no pudimos iniciar el pago del torneo.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(actionMessage);
    },
    [
      clubPlayer,
      config.slug,
      config.tenantId,
      fetchLatestRegistrationOptions,
      invalidateRegistrationState,
      person,
      syncPendingTournamentPayment,
      tournament?.id,
    ],
  );

  const createRequestMutation = useMutation({
    mutationFn: (requestedPlayerId: string) =>
      createTournamentPartnerRequest({
        tenantId: config.tenantId,
        tournamentId: tournament!.id,
        requesterPlayerId: playerId!,
        requestedPlayerId,
        categoryId: apiCategoryId,
      }),
    onSuccess: async (response) => {
      if (
        response.code === "partner_request_already_pending" ||
        response.created === false
      ) {
        toast.warning(response.message);
      } else {
        toast.success(response.message);
      }
      setSuccess(response.message);
      setSelectedPartnerId("");
      await invalidateRegistrationState();
    },
    onError: (err) => {
      const message = getTournamentActionErrorMessage(err);
      toast.error(message);
      setError(message);
    },
  });

  const becomeAvailableMutation = useMutation({
    mutationFn: () =>
      addTournamentAvailablePlayer({
        tenantId: config.tenantId,
        tournamentId: tournament!.id,
        playerId: playerId!,
        categoryId: apiCategoryId,
      }),
    onSuccess: async (response) => {
      toast.success(response.message);
      setSuccess(response.message);
      await invalidateRegistrationState();
    },
    onError: (err) => {
      const message = getTournamentActionErrorMessage(err);
      toast.error(message);
      setError(message);
    },
  });

  const withdrawAvailableMutation = useMutation({
    mutationFn: withdrawTournamentAvailablePlayer,
    onSuccess: async (response) => {
      toast.success(response.message);
      setSuccess(response.message);
      await invalidateRegistrationState();
    },
    onError: (err) => {
      const message = getTournamentActionErrorMessage(err);
      toast.error(message);
      setError(message);
    },
  });

  const pickAvailableMutation = useMutation({
    mutationFn: (availablePlayerId: string) =>
      pickTournamentAvailablePlayer({
        tenantId: config.tenantId,
        tournamentId: tournament!.id,
        pickerPlayerId: playerId!,
        availablePlayerId,
      }),
    onSuccess: async (response) => {
      await handleTeamPayment(response);
    },
    onError: (err) => {
      const message = getTournamentActionErrorMessage(err);
      toast.error(message);
      setError(message);
    },
  });

  const acceptRequestMutation = useMutation({
    mutationFn: (requestId: string) =>
      acceptTournamentPartnerRequest({ requestId, playerId: playerId! }),
    onSuccess: async (response) => {
      await handleTeamPayment(response);
    },
    onError: (err) => {
      const message = getTournamentActionErrorMessage(err);
      toast.error(message);
      setError(message);
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: (requestId: string) =>
      rejectTournamentPartnerRequest({ requestId, playerId: playerId! }),
    onSuccess: async (response) => {
      toast.success(response.message);
      setSuccess(response.message);
      await invalidateRegistrationState();
    },
    onError: (err) => {
      const message = getTournamentActionErrorMessage(err);
      toast.error(message);
      setError(message);
    },
  });

  const isActionPending =
    createRequestMutation.isPending ||
    becomeAvailableMutation.isPending ||
    withdrawAvailableMutation.isPending ||
    pickAvailableMutation.isPending ||
    acceptRequestMutation.isPending ||
    rejectRequestMutation.isPending;
  const options = registrationOptionsQuery.data;
  const isCheckingOptions =
    registrationOptionsQuery.isLoading || registrationOptionsQuery.isFetching;
  const canRegister = options?.canRegister ?? true;
  const alreadyHasPartner = Boolean(options?.alreadyHasPartner || options?.hasPartner);
  const availablePlayers = (availablePlayersQuery.data ?? []).filter((available) => {
    if (available.status && available.status !== "available") return false;
    return getAvailablePlayerSourceId(available) !== playerId;
  });
  const currentAvailablePlayer =
    options?.availablePlayer ??
    (options?.availablePlayerId
      ? ({ id: options.availablePlayerId } as TournamentAvailablePlayer)
      : null) ??
    (availablePlayersQuery.data ?? []).find(
      (available) =>
        (!available.status || available.status === "available") &&
        getAvailablePlayerSourceId(available) === playerId,
    ) ??
    null;
  const currentTeamId = extractTournamentTeamId(options);
  const receivedRequests = (
    options?.receivedRequests?.length
      ? options.receivedRequests
      : partnerRequestsQuery.data?.requests ?? []
  ).filter((request) => playerId && isReceivedPartnerRequest(request, playerId));
  const sentRequests = (
    options?.sentRequests?.length
      ? options.sentRequests
      : partnerRequestsQuery.data?.requests ?? []
  ).filter(
    (request) => playerId && isSentPartnerRequest(request, playerId),
  );
  const filteredPartners = (eligiblePartnersQuery.data ?? []).filter((partner) =>
    getRegistrationPlayerName(partner)
      .toLowerCase()
      .includes(partnerSearch.trim().toLowerCase()),
  );

  React.useEffect(() => {
    syncPendingTournamentPayment(currentTeamId);
  }, [currentTeamId, syncPendingTournamentPayment]);

  const handleCreateRequest = () => {
    if (!selectedPartnerId || isActionPending) return;
    setError("");
    setSuccess("");
    createRequestMutation.mutate(selectedPartnerId);
  };

  const handleBecomeAvailable = () => {
    if (isActionPending) return;
    setError("");
    setSuccess("");
    becomeAvailableMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-[#1E2028] bg-[#14161A] text-[#F2F3F5] shadow-xl shadow-emerald-100/60 border-[#1E2028] bg-[#0A0B0D]  sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Inscribirse al torneo</DialogTitle>
          <DialogDescription className="text-[#6B7280]">
            Elegí cómo querés anotarte. Si enviás una solicitud, tu compañero debe aceptarla.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#1E2028] bg-[#14161A] px-4 py-3 text-sm">
            <p className="font-medium text-[#F2F3F5]">
              {tournament?.name}
            </p>
            <p className="mt-1 text-[#6B7280]">
              {tournament?.type === "sum"
                ? "Torneo por suma. No hace falta elegir categoria."
                : "Seleccioná la categoria para consultar tus opciones de inscripción."}
            </p>
          </div>

          {needsCategorySelection ? (
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
                disabled={isActionPending}
              >
                <SelectTrigger className="w-full border-[#1E2028] bg-[#101216]">
                  <SelectValue placeholder="Seleccionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category, index) => {
                    const categoryId = getTournamentCategoryId(category);
                    return (
                      <SelectItem
                        key={`${categoryId ?? "category"}-${index}`}
                        value={categoryId ?? String(index)}
                        disabled={!categoryId}
                      >
                        {formatTournamentCategoryOption(category)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {registrationOptionsQuery.isLoading ? (
            <div className="flex items-center gap-2 rounded-2xl border border-[#1E2028] px-4 py-3 text-sm text-[#6B7280] border-[#1E2028]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Consultando estado de inscripción...
            </div>
          ) : null}

          {registrationOptionsQuery.error ? (
            <p className="rounded-2xl border border-rose-900/60 bg-rose-950/30 px-4 py-3 text-sm text-rose-300">
              {registrationOptionsQuery.error instanceof Error
                ? registrationOptionsQuery.error.message
                : "No se pudo consultar el estado de inscripción."}
            </p>
          ) : null}

          {alreadyHasPartner ? (
            <p className="rounded-2xl border border-[#2a3036] bg-[#14161A] px-4 py-3 text-sm text-[#D6FF3D] border-[#1E2028]">
              Ya tenés pareja en este torneo.
            </p>
          ) : null}

          {paymentResolved ? (
            <p className="rounded-2xl border border-[#2a3036] bg-[#14161A] px-4 py-3 text-sm text-[#D6FF3D] border-[#1E2028]">
              Inscripcion paga.
            </p>
          ) : null}

          {alreadyHasPartner && pendingTournamentPayment?.checkoutUrl && !paymentResolved ? (
            <div className="rounded-2xl border border-amber-900/60 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
              <p>Tu equipo tiene un pago pendiente.</p>
              <Button
                type="button"
                onClick={() => {
                  window.location.href = pendingTournamentPayment.checkoutUrl;
                }}
                className="mt-3 bg-amber-500 text-white hover:bg-amber-400"
              >
                Continuar pago
              </Button>
            </div>
          ) : null}

          {!canRegister ? (
            <p className="rounded-2xl border border-amber-900/60 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
              {options?.message ?? "No podés inscribirte en este momento."}
            </p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant={flow === "partner" ? "default" : "outline"}
              disabled={!categoryReady || isCheckingOptions || alreadyHasPartner || !canRegister || isActionPending}
              onClick={() => {
                setFlow("partner");
                setError("");
                setSuccess("");
              }}
              className={
                flow === "partner"
                  ? "bg-[#D6FF3D] text-[#0A0B0D] hover:bg-[#e4ff6a]"
                  : "border-[#2a3036] bg-[#14161A] text-[#F2F3F5] hover:bg-[#1a1d24] hover:text-[#D6FF3D]"
              }
            >
              Tengo compañero
            </Button>
            <Button
              type="button"
              variant={flow === "available" ? "default" : "outline"}
              disabled={!categoryReady || isCheckingOptions || alreadyHasPartner || !canRegister || isActionPending}
              onClick={() => {
                setFlow("available");
                setError("");
                setSuccess("");
              }}
              className={
                flow === "available"
                  ? "bg-[#D6FF3D] text-[#0A0B0D] hover:bg-[#e4ff6a]"
                  : "border-[#2a3036] bg-[#14161A] text-[#F2F3F5] hover:bg-[#1a1d24] hover:text-[#D6FF3D]"
              }
            >
              No tengo compañero
            </Button>
          </div>

          {flow === "partner" ? (
            <PartnerSelectionPanel
              partners={filteredPartners}
              search={partnerSearch}
              selectedPartnerId={selectedPartnerId}
              loading={eligiblePartnersQuery.isLoading}
              disabled={isActionPending}
              submitting={createRequestMutation.isPending}
              onSearchChange={setPartnerSearch}
              onSelect={setSelectedPartnerId}
              onSubmit={handleCreateRequest}
            />
          ) : null}

          {flow === "available" ? (
            <div className="space-y-3 rounded-2xl border border-[#1E2028] p-4 border-[#1E2028]">
              <p className="text-sm text-[#6B7280]">
                Podés quedar en la lista para que otro jugador te elija y cree la pareja.
              </p>
              <Button
                type="button"
                onClick={handleBecomeAvailable}
                disabled={isCheckingOptions || isActionPending || Boolean(currentAvailablePlayer)}
                className="w-full bg-[#D6FF3D] text-[#0A0B0D] hover:bg-[#e4ff6a]"
              >
                {becomeAvailableMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : currentAvailablePlayer ? (
                  "Ya estás disponible"
                ) : (
                  "Quedar disponible"
                )}
              </Button>
              {currentAvailablePlayer ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    withdrawAvailableMutation.mutate(currentAvailablePlayer.id);
                  }}
                  disabled={isCheckingOptions || isActionPending}
                  className="w-full border-[#2a3036] bg-[#14161A] text-[#F2F3F5] hover:bg-[#1a1d24] hover:text-[#D6FF3D]"
                >
                  {withdrawAvailableMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saliendo...
                    </>
                  ) : (
                    "Salir de disponibles"
                  )}
                </Button>
              ) : null}
            </div>
          ) : null}

          <AvailablePlayersPanel
            players={availablePlayers}
            loading={availablePlayersQuery.isLoading}
            disabled={isCheckingOptions || isActionPending || alreadyHasPartner || !canRegister}
            onPick={(availablePlayerId) => {
              setError("");
              setSuccess("");
              pickAvailableMutation.mutate(availablePlayerId);
            }}
          />

          <PartnerRequestsPanel
            requests={receivedRequests}
            sentRequests={sentRequests}
            loading={partnerRequestsQuery.isLoading}
            disabled={isActionPending}
            onAccept={(requestId) => {
              setError("");
              setSuccess("");
              acceptRequestMutation.mutate(requestId);
            }}
            onReject={(requestId) => {
              setError("");
              setSuccess("");
              rejectRequestMutation.mutate(requestId);
            }}
          />

          {error ? (
            <p className="rounded-2xl border border-rose-900/60 bg-rose-950/30 px-4 py-3 text-sm text-rose-300">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="rounded-2xl border border-[#2a3036] bg-[#14161A] px-4 py-3 text-sm text-[#D6FF3D] border-[#1E2028]">
              {success}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#2a3036] bg-[#14161A] text-[#F2F3F5] hover:bg-[#1a1d24] hover:text-[#D6FF3D]"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PartnerSelectionPanel({
  partners,
  search,
  selectedPartnerId,
  loading,
  disabled,
  submitting,
  onSearchChange,
  onSelect,
  onSubmit,
}: {
  partners: TournamentRegistrationPlayer[];
  search: string;
  selectedPartnerId: string;
  loading: boolean;
  disabled: boolean;
  submitting: boolean;
  onSearchChange: (value: string) => void;
  onSelect: (playerId: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-[#1E2028] p-4 border-[#1E2028]">
      <div className="space-y-2">
        <Label>Buscar jugador elegible</Label>
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Nombre o apellido"
          disabled={loading || disabled}
          className="border-[#1E2028] bg-[#101216]"
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Buscando jugadores...
        </div>
      ) : null}

      <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
        {partners.length > 0 ? (
          partners.map((partner) => (
            <button
              key={partner.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(partner.id)}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                selectedPartnerId === partner.id
                  ? "border-emerald-500 bg-[#14161A] text-[#D6FF3D]"
                  : "border-[#1E2028] bg-[#14161A] text-[#9CA3AF] hover:bg-[#14161A] border-[#1E2028] bg-[#14161A]"
              }`}
            >
              <span className="font-medium">{getRegistrationPlayerName(partner)}</span>
              <span className="ml-2 text-xs text-[#6B7280]">
                {formatPlayerMeta(partner)}
              </span>
            </button>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-[#2a3036] px-3 py-4 text-center text-sm text-[#6B7280] border-[#1E2028]">
            No hay compañeros elegibles para mostrar.
          </p>
        )}
      </div>

      <Button
        type="button"
        onClick={onSubmit}
        disabled={!selectedPartnerId || disabled}
        className="w-full bg-[#D6FF3D] text-[#0A0B0D] hover:bg-[#e4ff6a]"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando solicitud...
          </>
        ) : (
          "Enviar solicitud"
        )}
      </Button>
    </div>
  );
}

function AvailablePlayersPanel({
  players,
  loading,
  disabled,
  onPick,
}: {
  players: TournamentAvailablePlayer[];
  loading: boolean;
  disabled: boolean;
  onPick: (availablePlayerId: string) => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-[#1E2028] p-4 border-[#1E2028]">
      <div>
        <p className="text-sm font-medium text-[#F2F3F5]">
          Jugadores disponibles
        </p>
        <p className="text-xs text-[#6B7280]">
          Elegir uno crea la pareja automáticamente.
        </p>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando disponibles...
        </div>
      ) : players.length > 0 ? (
        <div className="space-y-2">
          {players.map((available) => (
            <div
              key={available.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-[#1E2028] px-3 py-2 text-sm border-[#1E2028]"
            >
              <div>
                <p className="font-medium text-[#F2F3F5]">
                  {getAvailablePlayerName(available)}
                </p>
                <p className="text-xs text-[#6B7280]">
                  {formatPlayerMeta(available.player ?? available)}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => onPick(available.id)}
                disabled={disabled}
                className="bg-[#D6FF3D] text-[#0A0B0D] hover:bg-[#e4ff6a]"
              >
                Elegir
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-[#2a3036] px-3 py-4 text-center text-sm text-[#6B7280] border-[#1E2028]">
          Todavía no hay jugadores disponibles.
        </p>
      )}
    </div>
  );
}

function PartnerRequestsPanel({
  requests,
  sentRequests,
  loading,
  disabled,
  onAccept,
  onReject,
}: {
  requests: TournamentPartnerRequest[];
  sentRequests: TournamentPartnerRequest[];
  loading: boolean;
  disabled: boolean;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-[#1E2028] p-4 border-[#1E2028]">
      <p className="text-sm font-medium text-[#F2F3F5]">
        Solicitudes pendientes
      </p>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando solicitudes...
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-2">
          {requests.map((request) => (
            <PartnerRequestRow
              key={request.id}
              request={request}
              disabled={disabled}
              onAccept={() => onAccept(request.id)}
              onReject={() => onReject(request.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#6B7280]">
          No tenés solicitudes recibidas pendientes.
        </p>
      )}
      {sentRequests.length > 0 ? (
        <div className="space-y-2 border-t border-[#1E2028] pt-3 border-[#1E2028]">
          <p className="text-sm font-medium text-[#F2F3F5]">
            Solicitudes enviadas
          </p>
          {sentRequests.map((request) => (
            <SentPartnerRequestRow key={request.id} request={request} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SentPartnerRequestRow({
  request,
}: {
  request: TournamentPartnerRequest;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[#1E2028] px-3 py-2 text-sm border-[#1E2028] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-[#F2F3F5]">
          {getRegistrationPlayerName(getPartnerRequestRequested(request))}
        </p>
        <p className="text-xs text-[#6B7280]">
          {request.tournament?.name ?? "Torneo"} · {formatRequestCategory(request)}
        </p>
      </div>
      <Badge
        variant="outline"
        className="w-fit border-amber-900/60 bg-amber-950/30 text-amber-200"
      >
        Pendiente de aceptación
      </Badge>
    </div>
  );
}

function PartnerRequestRow({
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
    <div className="flex flex-col gap-3 rounded-lg border border-[#1E2028] px-3 py-2 text-sm border-[#1E2028] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-[#F2F3F5]">
          {getRegistrationPlayerName(getPartnerRequestRequester(request))}
        </p>
        <p className="text-xs text-[#6B7280]">
          {request.tournament?.name ?? "Torneo"} · {formatRequestCategory(request)}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          onClick={onReject}
          disabled={disabled}
          variant="outline"
          className="border-rose-900/60 bg-[#14161A] text-rose-300 hover:bg-rose-950/30 bg-[#14161A]"
        >
          Rechazar
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onAccept}
          disabled={disabled}
          className="bg-[#D6FF3D] text-[#0A0B0D] hover:bg-[#e4ff6a]"
        >
          Aceptar
        </Button>
      </div>
    </div>
  );
}

function PlayerRanking({
  players,
  loading,
}: {
  players: TenantPlayer[];
  loading: boolean;
}) {
  const [selectedCategory, setSelectedCategory] = React.useState("Todas");

  const entries = React.useMemo(() => {
    const selectedCategoryLevel =
      selectedCategory === "Todas" ? null : Number(selectedCategory.slice(0, 1));

    return players
      .filter((player) => player.status === "verified")
      .filter(
        (player) =>
          selectedCategoryLevel === null ||
          player.category === selectedCategoryLevel,
      )
      .sort((left, right) => {
        const points = (right.puntos ?? 0) - (left.puntos ?? 0);
        if (points !== 0) return points;
        return `${left.lastName} ${left.firstName}`.localeCompare(
          `${right.lastName} ${right.firstName}`,
          "es",
        );
      })
      .map((player, index) => ({
        id: player.id,
        name: `${player.firstName} ${player.lastName}`,
        category: `${player.category}°`,
        position: index + 1,
        points: player.puntos ?? 0,
      }));
  }, [players, selectedCategory]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 rounded-[1.5rem] border border-[#1E2028] bg-[#14161A] p-3  border-[#1E2028] bg-[#101216] ">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className={
              selectedCategory === cat
                ? "rounded-full bg-[#D6FF3D] text-[#0A0B0D] hover:bg-[#e4ff6a]"
                : "rounded-full border-[#2a3036] bg-[#14161A] text-[#9CA3AF] hover:bg-[#14161A] hover:text-[#D6FF3D] border-[#1E2028] bg-[#14161A]"
            }
          >
            {cat}
          </Button>
        ))}
      </div>

      {loading ? (
        <RankingSkeleton />
      ) : entries.length === 0 ? (
        <EmptyState
          title="Sin datos de ranking"
          description="No hay jugadores registrados en esta categoria todavia."
        />
      ) : (
        <Card className="overflow-hidden rounded-2xl border-[#1E2028] bg-[#101216]">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">#</TableHead>
                  <TableHead>Jugador</TableHead>
                  <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                  <TableHead className="text-right">Puntos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-center">
                      <PositionBadge position={entry.position} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-[#F2F3F5]">
                          {entry.name}
                        </span>
                        <span className="text-xs text-[#6B7280] sm:hidden">
                          {entry.category}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary" className="font-normal">
                        {entry.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono text-sm font-semibold text-[#F2F3F5]">
                        {entry.points.toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function useTournamentEligibility(tournament: Tournament) {
  const { clubPlayer, playerId } = usePlayerSafe();

  return React.useMemo(() => {
    if (!clubPlayer) {
      return {
        canRegister: false,
        requiresClubVerification: true,
        reason: playerId
          ? "Necesitás iniciar sesión para inscribirte."
          : "Primero verificá tu jugador en este club.",
      };
    }

    if (clubPlayer.status !== "verified") {
      return {
        canRegister: false,
        requiresClubVerification: false,
        reason: "Tu cuenta tiene que estar verificada para inscribirte.",
      };
    }

    if (canPlayerJoinTournament(clubPlayer, tournament)) {
      return { canRegister: true, requiresClubVerification: false, reason: "" };
    }

    return {
      canRegister: false,
      requiresClubVerification: false,
      reason: "Este torneo no corresponde a tu categoria o genero.",
    };
  }, [clubPlayer, playerId, tournament]);
}

function usePlayerSafe() {
  const { person, player, playerId } = usePlayer();
  return { clubPlayer: player, person, playerId };
}

function getStringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function getTournamentBillingState(
  response: BillingTournamentStatusResponse | null,
  queryStatus: string | null,
) {
  const paymentStatus = (
    getStringValue(response?.paymentStatus) ??
    getStringValue(response?.billingPayment?.status) ??
    getStringValue(response?.status) ??
    queryStatus ??
    ""
  ).toLowerCase();
  const teamApproved =
    response?.tournamentTeam?.approved === true || response?.team?.approved === true;

  if (teamApproved) {
    return "approved" as const;
  }

  if (paymentStatus === "approved") {
    return "approved" as const;
  }

  if (paymentStatus === "pending" || paymentStatus === "in_process") {
    return "pending" as const;
  }

  if (
    paymentStatus === "rejected" ||
    paymentStatus === "failure" ||
    paymentStatus === "failed" ||
    paymentStatus === "cancelled"
  ) {
    return "rejected" as const;
  }

  return "unknown" as const;
}

function matchesTournamentPendingPayment(
  pending: PendingTournamentPayment,
  externalReference: string,
  response?: BillingTournamentStatusResponse | null,
) {
  const responseExternalReference =
    getStringValue(response?.externalReference) ??
    getStringValue(response?.billingPayment?.externalReference);
  const responseTeamId =
    getStringValue(response?.tournamentTeam?.id) ??
    getStringValue(response?.team?.id);

  return Boolean(
    pending.externalReference === externalReference ||
      (responseExternalReference &&
        pending.externalReference === responseExternalReference) ||
      (responseTeamId && pending.tournamentTeamId === responseTeamId),
  );
}

function extractTournamentTeamId(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  return (
    getStringValue(record.tournamentTeamId) ??
    getStringValue(record.teamId) ??
    getStringValue((record.team as Record<string, unknown> | undefined)?.id) ??
    getStringValue(
      (record.tournamentTeam as Record<string, unknown> | undefined)?.id,
    ) ??
    null
  );
}

function getTournamentBillingContact(
  clubPlayer: ReturnType<typeof usePlayerSafe>["clubPlayer"],
  person: ReturnType<typeof usePlayerSafe>["person"],
) {
  const firstName = clubPlayer?.firstName || person?.firstName || "";
  const lastName = clubPlayer?.lastName || person?.lastName || "";
  const playerName = [firstName, lastName].filter(Boolean).join(" ").trim();

  return {
    playerName,
    playerPhone: clubPlayer?.phoneNumber || person?.phoneNumber || "",
    playerEmail: clubPlayer?.email || person?.email || "",
  };
}

function canPlayerJoinTournament(
  player: EligiblePlayer,
  tournament: Tournament,
  fixedPartner?: Pick<EligiblePlayer, "category" | "gender">,
) {
  if (player.status !== "verified") return false;
  if (player.category == null) return false;

  if (tournament.type === "sum") {
    if (typeof tournament.sumLimit !== "number") return false;
    if (!fixedPartner) return true;
    if (fixedPartner.category == null) return false;

    return player.category + fixedPartner.category >= tournament.sumLimit;
  }

  return (tournament.categories ?? []).some((category) => {
    const matchesCategory = isCategoryAllowed(player, category);
    const matchesGender = isGenderAllowed(player.gender, category.gender, fixedPartner?.gender);
    return matchesCategory && matchesGender;
  });
}

function isCategoryAllowed(
  player: Pick<EligiblePlayer, "category" | "gender">,
  category: TournamentCategory,
) {
  if (player.category == null) return false;

  const tournamentCategory =
    player.gender === "female" && category.categoryFemale
      ? category.categoryFemale
      : category.categoryLevel;

  return tournamentCategory >= player.category;
}

function isGenderAllowed(
  playerGender: string,
  tournamentGender: Gender,
  fixedPartnerGender?: string,
) {
  if (tournamentGender === "male" || tournamentGender === "female") {
    return playerGender === tournamentGender;
  }

  if (tournamentGender === "mixed-only") {
    if (!fixedPartnerGender) return playerGender === "male" || playerGender === "female";
    return playerGender !== fixedPartnerGender;
  }

  return playerGender === "male" || playerGender === "female" || playerGender === "mixed";
}

function getTournamentCategoryId(category: TournamentCategory | null | undefined) {
  if (!category) return null;
  return category.id ?? String(category.categoryLevel);
}

function formatTournamentCategoryOption(category: TournamentCategory) {
  const base = category.categoryFemale
    ? `${category.categoryLevel}° / Fem. ${category.categoryFemale}°`
    : `${category.categoryLevel}°`;

  return `${base} · ${formatGender(category.gender)}`;
}

function getRegistrationPlayerName(
  player: TournamentRegistrationPlayer | null | undefined,
) {
  if (!player) return "Jugador";
  return `${player.firstName ?? ""} ${player.lastName ?? ""}`.trim() || "Jugador";
}

function getAvailablePlayerName(player: TournamentAvailablePlayer) {
  return getRegistrationPlayerName(player.player ?? player);
}

function getAvailablePlayerSourceId(player: TournamentAvailablePlayer) {
  return player.player?.id ?? player.playerId ?? player.id;
}

function formatPlayerMeta(
  player:
    | TournamentRegistrationPlayer
    | Pick<TournamentAvailablePlayer, "category" | "gender">
    | null
    | undefined,
) {
  const category = typeof player?.category === "number" ? `${player.category}°` : "Sin categoria";
  const gender = player?.gender ? formatGender(player.gender) : "Sin genero";
  return `${category} · ${gender}`;
}

function formatRequestCategory(request: TournamentPartnerRequest) {
  return request.category ? formatTournamentCategoryOption(request.category) : "Categoria del torneo";
}

function compareGroupStandings(
  leftTeam: GroupTeamStanding,
  rightTeam: GroupTeamStanding,
) {
  const pointsDiff = (rightTeam.points ?? 0) - (leftTeam.points ?? 0);
  if (pointsDiff !== 0) return pointsDiff;

  const rightSetsDiff = (rightTeam.setsWon ?? 0) - (rightTeam.setsLost ?? 0);
  const leftSetsDiff = (leftTeam.setsWon ?? 0) - (leftTeam.setsLost ?? 0);
  if (rightSetsDiff !== leftSetsDiff) return rightSetsDiff - leftSetsDiff;

  const rightGamesDiff = (rightTeam.gamesWon ?? 0) - (rightTeam.gamesLost ?? 0);
  const leftGamesDiff = (leftTeam.gamesWon ?? 0) - (leftTeam.gamesLost ?? 0);
  return rightGamesDiff - leftGamesDiff;
}

function formatTeamSummaryName(
  team: TeamSummary | null | undefined,
  fallbackIndex: number,
) {
  if (!team) return `Equipo ${fallbackIndex}`;

  const players = [team.player1, team.player2]
    .map(formatPlayerSummaryName)
    .filter((name) => name !== "Jugador");

  return players.join(" / ") || `Equipo ${fallbackIndex}`;
}

function formatTournamentTeamName(
  team:
    | {
        player1?: { firstName?: string; lastName?: string } | null;
        player2?: { firstName?: string; lastName?: string } | null;
      }
    | null
    | undefined,
  fallbackIndex: number,
) {
  if (!team) return `Equipo ${fallbackIndex}`;

  const players = [team.player1, team.player2]
    .map(formatPlayerSummaryName)
    .filter((name) => name !== "Jugador");

  return players.join(" / ") || `Equipo ${fallbackIndex}`;
}

function formatTeamSummaryPlayers(team: TeamSummary | null | undefined) {
  if (!team) return "Sin jugadores definidos";

  return [team.player1, team.player2]
    .map(formatPlayerSummaryName)
    .filter((name) => name !== "Jugador")
    .join(" / ") || "Sin jugadores definidos";
}

function formatPlayerSummaryName(
  player: { firstName?: string; lastName?: string } | null | undefined,
) {
  if (!player) return "Jugador";
  return `${player.firstName ?? ""} ${player.lastName ?? ""}`.trim() || "Jugador";
}

function formatMatchScore(score: MatchScore | null | undefined) {
  if (!score?.sets?.length) return "";

  return score.sets.map((set) => `${set.team1}-${set.team2}`).join(" ");
}

function getGroupMatchScore(match: GroupMatchSummary) {
  return (match as ReadOnlyGroupMatch).score ?? null;
}

function getPlayoffTeamScore(
  score: MatchScore | null | undefined,
  team: "team1" | "team2",
) {
  if (!score?.sets?.length) return "";

  return score.sets.map((set) => String(set[team])).join(" ");
}

function formatBookingDate(date?: string) {
  if (!date) return "Sin fecha";

  try {
    return new Date(date).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return date;
  }
}

function MatchBookingHint({
  booking,
}: {
  booking?: MatchBookingInfo | null;
}) {
  if (!booking) {
    return (
      <div className="mt-2 flex items-center gap-2 text-[11px] text-[#6B7280]">
        <CalendarClock className="h-3.5 w-3.5" />
        Sin reserva asignada
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#6B7280]">
      <span className="inline-flex items-center gap-1 rounded-full border border-[#1E2028] bg-[#101216] px-2 py-1 border-[#1E2028] bg-[#101216]">
        <MapPin className="h-3 w-3" />
        Cancha {booking.courtNumber}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full border border-[#1E2028] bg-[#101216] px-2 py-1 border-[#1E2028] bg-[#101216]">
        <CalendarClock className="h-3 w-3" />
        {formatBookingDate(booking.date)} · {booking.startTime}
        {booking.endTime ? ` - ${booking.endTime}` : ""}
      </span>
    </div>
  );
}

function formatPlayoffRound(round: number) {
  if (round === 2) return "Final";
  if (round === 4) return "Semifinales";
  if (round === 8) return "Cuartos";
  if (round === 16) return "Octavos";
  return `Ronda de ${round}`;
}

function formatOngoingTournamentStage(status?: string) {
  if (status === "group_stage") return "Fase de grupos";
  if (status === "playoff") return "Playoff";
  if (status === "finished") return "Finalizado";
  if (status === "registration") return "Inscripcion";
  return "En curso";
}

function buildFinishedTournamentRows(tournament: Tournament): FinishedTournamentRow[] {
  const results = tournament.results;
  if (!results) return [];

  const rows: FinishedTournamentRow[] = [];
  const addTeam = (
    team: TournamentResultTeam | null | undefined,
    position: number,
    label: string,
    fallbackPoints: number,
    index = 0,
  ) => {
    if (!team) return;

    rows.push({
      id: `${position}-${team.id ?? formatTeamName(team)}-${index}`,
      position,
      label,
      teamName: formatTeamName(team),
      points: typeof team.points === "number" ? team.points : fallbackPoints,
    });
  };

  addTeam(results.champion, 1, "Campeon", getTournamentResultPoints(tournament, "champion"));
  addTeam(results.finalist, 2, "Finalista", getTournamentResultPoints(tournament, "finalist"));

  results.semiFinalists?.forEach((team, index) => {
    addTeam(
      team,
      3,
      "Semifinalista",
      getTournamentResultPoints(tournament, "semiFinalist"),
      index,
    );
  });

  getTournamentQuarterFinalists(tournament).forEach((team, index) => {
    addTeam(
      team,
      4,
      "Cuartos",
      getTournamentResultPoints(tournament, "quarterFinalist"),
      index,
    );
  });

  return rows.sort((left, right) => left.position - right.position);
}

function getTournamentQuarterFinalists(tournament: Tournament) {
  const results = tournament.results as
    | (NonNullable<Tournament["results"]> & {
        quarterfinalists?: TournamentResultTeam[];
        quarterFinals?: TournamentResultTeam[];
        quarterFinalLosers?: TournamentResultTeam[];
      })
    | null
    | undefined;

  return (
    results?.quarterFinalists ??
    results?.quarterfinalists ??
    results?.quarterFinals ??
    results?.quarterFinalLosers ??
    []
  );
}

function getTournamentResultPoints(
  tournament: Tournament,
  result: "champion" | "finalist" | "semiFinalist" | "quarterFinalist",
) {
  const pointsConfig = tournament.pointsConfig;

  if (result === "champion") return pointsConfig?.pointsChampion ?? 1000;
  if (result === "finalist") return pointsConfig?.pointsFinalist ?? 600;
  if (result === "semiFinalist") return pointsConfig?.pointsSemiFinal ?? 360;
  return pointsConfig?.pointsQuarterFinal ?? 180;
}

function formatTournamentCategory(tournament: Tournament) {
  if (tournament.type === "sum") {
    return `Suma ${tournament.sumLimit ?? "-"}`;
  }

  const category = tournament.categories?.[0];
  if (!category) return "Sin categoria";

  if (category.categoryFemale) {
    return `${category.categoryLevel}° / Fem. ${category.categoryFemale}°`;
  }

  return `${category.categoryLevel}°`;
}

function formatGender(gender: string) {
  if (gender === "male") return "Masculino";
  if (gender === "female") return "Femenino";
  if (gender === "mixed") return "Mixto";
  if (gender === "mixed-only") return "Solo mixto";
  return "Sin definir";
}

function formatTournamentType(type: string) {
  if (type === "regular") return "Competencia regular";
  if (type === "sum") return "Competencia por suma";
  return type;
}

function formatTournamentFormat(format: string) {
  if (format === "single_elimination") return "Eliminacion simple";
  if (format === "group_stage") return "Fase de grupos";
  if (format === "group_stage_playoff") return "Grupos + playoff";
  return format;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTeamName(team: TournamentResultTeam | null | undefined) {
  if (!team || typeof team !== "object") return "Sin definir";

  const maybeTeam = team as {
    name?: string | null;
    player1?: { firstName?: string; lastName?: string } | null;
    player2?: { firstName?: string; lastName?: string } | null;
  };

  if (maybeTeam.name) return maybeTeam.name;

  return [maybeTeam.player1, maybeTeam.player2]
    .filter(Boolean)
    .map((player) => `${player?.firstName ?? ""} ${player?.lastName ?? ""}`.trim())
    .filter(Boolean)
    .join(" / ") || "Sin definir";
}

function getStatusLabel(status: "upcoming" | "ongoing" | "finished") {
  if (status === "upcoming") return "Por empezar";
  if (status === "ongoing") return "En curso";
  return "Finalizado";
}

function getStatusClassName(status: "upcoming" | "ongoing" | "finished") {
  if (status === "upcoming") {
    return "bg-blue-600 text-white";
  }

  if (status === "ongoing") {
    return "bg-[#D6FF3D] text-[#0A0B0D]";
  }

  return "bg-slate-600 text-white";
}

function getEmptyTitle(status: "upcoming" | "ongoing" | "finished") {
  if (status === "upcoming") return "No hay torneos por empezar";
  if (status === "ongoing") return "No hay torneos en curso";
  return "No hay torneos finalizados";
}

function getEmptyDescription(status: "upcoming" | "ongoing" | "finished") {
  if (status === "upcoming") {
    return "Cuando el club abra inscripciones, las vas a ver aca.";
  }

  if (status === "ongoing") {
    return "Los torneos activos van a aparecer en esta seccion.";
  }

  return "Los torneos terminados van a aparecer en esta seccion.";
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#1E2028] bg-[#14161A]/60 px-4 py-3 border-[#1E2028] bg-[#14161A]">
      <p className="text-xs text-[#6B7280]">{label}</p>
      <p className="mt-1 font-medium text-[#F2F3F5]">
        {value}
      </p>
    </div>
  );
}

function PositionBadge({ position }: { position: number }) {
  if (position === 1) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-200">
        1
      </span>
    );
  }
  if (position === 2) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1a1d24] text-sm font-bold text-[#6B7280]">
        2
      </span>
    );
  }
  if (position === 3) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
        3
      </span>
    );
  }
  return (
    <span className="text-sm font-medium text-[#6B7280]">
      {position}
    </span>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="rounded-2xl border-[#1E2028] bg-[#101216]">
      <CardContent className="flex flex-col items-center gap-3 py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D6FF3D]/15 text-[#D6FF3D]">
          <Trophy className="h-6 w-6" />
        </div>
        <div className="text-center">
          <p className="font-medium text-[#F2F3F5]">{title}</p>
          <p className="text-sm text-[#6B7280]">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function RankingSkeleton() {
  return (
    <Card className="rounded-2xl border-[#1E2028] bg-[#101216]">
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TournamentSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card
          key={index}
          className="rounded-[1.75rem] border-[#1E2028] bg-[#101216]  border-[#1E2028] bg-[#101216]"
        >
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-7 w-3/4" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-16 rounded-2xl" />
              <Skeleton className="h-16 rounded-2xl" />
              <Skeleton className="h-16 rounded-2xl" />
              <Skeleton className="h-16 rounded-2xl" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
