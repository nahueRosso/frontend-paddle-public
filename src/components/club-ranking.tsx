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
  createTournamentPartnerRequest,
  fetchEligibleTournamentPartners,
  fetchTournamentAvailablePlayers,
  fetchTournamentPartnerRequests,
  fetchTournamentRegistrationOptions,
  pickTournamentAvailablePlayer,
  rejectTournamentPartnerRequest,
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
import { playerKeys } from "@/lib/queryKeys/player";
import { tournamentKeys } from "@/lib/queryKeys/tournament";
import { usePlayer } from "@/providers/player-provider";
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

type TournamentView = "upcoming" | "ongoing" | "finished" | "ranking";
type EligiblePlayer = {
  category: number;
  gender: string;
  status: "pending" | "verified" | "rejected";
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
  { id: "upcoming", label: "Por empezar" },
  { id: "ongoing", label: "En curso" },
  { id: "finished", label: "Finalizados" },
  { id: "ranking", label: "Ranking" },
];

const CATEGORIES = ["Todas", "1ra", "2da", "3ra", "4ta", "5ta", "6ta", "7ma", "8va"];

export function ClubTorneos() {
  const { config } = useClub();
  const { data: players = [], isLoading: isLoadingPlayers } =
    usePlayersByTenantQuery(config.tenantId);
  const [activeView, setActiveView] = React.useState<TournamentView>("upcoming");

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-emerald-100 bg-white/75 p-6 shadow-lg shadow-emerald-100/60 backdrop-blur dark:border-emerald-900/60 dark:bg-slate-950/75 dark:shadow-emerald-950/20">
        <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          Comunidad competitiva
        </span>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 lg:text-3xl">
          Torneos
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
          Inscribite, seguí los torneos del club y consultá el ranking de jugadores.
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-2 rounded-[1.5rem] border border-emerald-100 bg-white/80 p-3 shadow-sm shadow-emerald-100/50 dark:border-emerald-900/60 dark:bg-slate-950/70 dark:shadow-emerald-950/10">
        {VIEWS.map((view) => (
          <Button
            key={view.id}
            variant={activeView === view.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveView(view.id)}
            className={
              activeView === view.id
                ? "rounded-full bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                : "rounded-full border-emerald-200 bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900/60 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-emerald-500/10"
            }
          >
            {view.label}
          </Button>
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
      {activeView === "ranking" ? (
        <PlayerRanking players={players} loading={isLoadingPlayers} />
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
  onOpenDetails,
}: {
  tournament: Tournament;
  status: "upcoming" | "ongoing" | "finished";
  onRegister: () => void;
  onOpenDetails?: () => void;
}) {
  const eligibility = useTournamentEligibility(tournament);
  const category = tournament.categories?.[0] ?? null;
  const approvedTeams = (tournament.teams ?? []).filter(
    (team) => team.approved,
  ).length;
  const pendingTeams = (tournament.teams ?? []).length - approvedTeams;

  return (
    <Card
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
      className={`overflow-hidden rounded-[1.75rem] border-emerald-100 bg-white/90 shadow-lg shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20 ${
        onOpenDetails
          ? "cursor-pointer transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:shadow-emerald-950/30"
          : ""
      }`}
    >
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <Badge className={getStatusClassName(status)}>
            {getStatusLabel(status)}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Users className="h-3.5 w-3.5" />
            {approvedTeams} aprobados
          </div>
        </div>

        <div>
          <CardTitle className="text-xl text-slate-900 dark:text-slate-100">
            {tournament.name}
          </CardTitle>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {formatTournamentType(tournament.type)} · {formatTournamentFormat(tournament.format)}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <InfoBox label="Categoria" value={formatTournamentCategory(tournament)} />
          <InfoBox
            label="Genero"
            value={category ? formatGender(category.gender) : "Por suma"}
          />
          <InfoBox label="Inicio" value={formatDate(tournament.startDate)} />
          <InfoBox label="Fin" value={formatDate(tournament.endDate)} />
        </div>

        {status === "upcoming" ? (
          <>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
              <p className="font-medium text-slate-900 dark:text-slate-100">
                Cierre de inscripción
              </p>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                {formatDate(tournament.registrationDeadline)}
              </p>
            </div>

            {!eligibility.canRegister ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                {eligibility.reason}
              </p>
            ) : null}

            <Button
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
              disabled={!eligibility.canRegister}
              onClick={onRegister}
            >
              Inscribirme
            </Button>
          </>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-300">
              {approvedTeams} aprobados
            </Badge>
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              {pendingTeams} pendientes
            </Badge>
          </div>
        )}

        {status === "finished" && tournament.results ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
            <p className="font-medium text-slate-900 dark:text-slate-100">
              Resultado
            </p>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Campeones: {formatTeamName(tournament.results.champion)}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
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
      <DialogContent className="max-h-[85vh] overflow-y-auto border-emerald-100 bg-white text-slate-900 shadow-xl shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950 dark:text-slate-100 dark:shadow-emerald-950/20 sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Resultados del torneo{tournament ? ` - ${tournament.name}` : ""}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
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
              <Card className="overflow-hidden rounded-[1.25rem] border-emerald-100 bg-white/90 dark:border-emerald-900/60 dark:bg-slate-950/80">
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
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {row.teamName}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 sm:hidden">
                                {row.label}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge
                              variant={row.position === 1 ? "default" : "outline"}
                              className={
                                row.position === 1
                                  ? "bg-amber-500 text-slate-950 hover:bg-amber-500"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-300"
                              }
                            >
                              {row.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
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
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                Este torneo todavía no tiene resultados cargados.
              </p>
            )}
          </div>
        ) : null}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-emerald-200 bg-white text-slate-900 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900/60 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-emerald-500/10"
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
      <DialogContent className="max-h-[85vh] overflow-y-auto border-emerald-100 bg-white text-slate-900 shadow-xl shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950 dark:text-slate-100 dark:shadow-emerald-950/20 sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>
            Torneo en curso{activeTournament ? ` - ${activeTournament.name}` : ""}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Fixture, tablas y cruces disponibles solo para consulta.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 px-4 py-3 text-sm text-slate-500 dark:border-emerald-900/60 dark:text-slate-400">
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
                  <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                    Este torneo todavía no tiene fixture disponible.
                  </p>
                ) : null}
              </>
            ) : (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                No se encontró el fixture de este torneo.
              </p>
            )}
          </div>
        ) : null}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-emerald-200 bg-white text-slate-900 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900/60 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-emerald-500/10"
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
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
          Grupos
        </p>
        <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
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
    <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-950/80">
      <div className="border-b border-emerald-100 px-5 py-4 dark:border-emerald-900/60">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Zona {groupIndex + 1}
            </p>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {group.name || `Grupo ${groupIndex + 1}`}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Categoria {String(group.category?.categoryLevel ?? "-")} ·{" "}
              {formatGender(group.category?.gender ?? "")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-300">
              {group.teams.length} equipos
            </Badge>
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-500/10 dark:text-blue-300">
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
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 dark:border-emerald-900/60 dark:bg-slate-900/50">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Partidos
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
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
              className="rounded-xl border border-emerald-100 bg-white px-4 py-3 dark:border-emerald-900/60 dark:bg-slate-950/70"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Partido {index + 1}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
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
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-300"
                        : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
                    }
                  >
                    {hasResult ? "Finalizado" : "Pendiente"}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
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
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 dark:border-emerald-900/60 dark:bg-slate-900/50">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Tabla
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Posiciones actuales
          </p>
        </div>
        <Trophy className="h-4 w-4 text-slate-500 dark:text-slate-400" />
      </div>

      <div className="overflow-hidden rounded-lg border border-emerald-100 dark:border-emerald-900/60">
        <div className="grid grid-cols-[minmax(0,1.9fr)_42px_42px_42px_42px_58px] items-center gap-2 border-b border-emerald-100 bg-white/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:border-emerald-900/60 dark:bg-slate-950/70 dark:text-slate-400">
          <span>Equipo</span>
          <span className="text-center">PJ</span>
          <span className="text-center">PG</span>
          <span className="text-center">PP</span>
          <span className="text-center">DS</span>
          <span className="text-right">PTS</span>
        </div>

        <div className="divide-y divide-emerald-100 dark:divide-emerald-900/60">
          {teams.map((team, index) => {
            const position = index + 1;
            const qualifies = position <= qualifyPerGroup;
            const setsDiff = (team.setsWon ?? 0) - (team.setsLost ?? 0);

            return (
              <div
                key={`${team.id}-${index}`}
                className="grid grid-cols-[minmax(0,1.9fr)_42px_42px_42px_42px_58px] items-center gap-2 bg-white px-3 py-3 dark:bg-slate-950/70"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                      qualifies
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400"
                    }`}
                  >
                    {position}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {formatTeamSummaryName(team.team, position)}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
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
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
          Playoff
        </p>
        <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Llave de eliminacion directa
        </h4>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {matchesByRound.map(({ round, matches }) => (
          <div
            key={round}
            className="rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm dark:border-emerald-900/60 dark:bg-slate-950/80"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
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
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 px-4 py-3 dark:border-emerald-900/60 dark:bg-slate-900/50">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
          Juego {match.matchNumber}
        </p>
        <Badge
          variant="outline"
          className={
            match.finished
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-300"
              : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
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
          ? "bg-emerald-600 text-white"
          : "bg-white text-slate-700 dark:bg-slate-950/70 dark:text-slate-200"
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
  const { player } = usePlayerSafe();
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = React.useState("");
  const [flow, setFlow] = React.useState<"partner" | "available" | null>(null);
  const [partnerSearch, setPartnerSearch] = React.useState("");
  const [selectedPartnerId, setSelectedPartnerId] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

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
    open && tournament?.id && config.tenantId && player?.id && categoryReady,
  );

  React.useEffect(() => {
    if (tournament?.type === "sum") {
      setSelectedCategoryId("");
    } else {
      setSelectedCategoryId(getTournamentCategoryId(tournament?.categories?.[0]) ?? "");
    }
    setFlow(null);
    setPartnerSearch("");
    setSelectedPartnerId("");
    setError("");
    setSuccess("");
  }, [tournament?.id]);

  React.useEffect(() => {
    setFlow(null);
    setPartnerSearch("");
    setSelectedPartnerId("");
    setError("");
    setSuccess("");
  }, [selectedCategoryId]);

  const registrationOptionsQuery = useQuery({
    queryKey: tournamentKeys.registrationOptions(
      config.tenantId,
      tournament?.id,
      player?.id,
      apiCategoryId,
    ),
    queryFn: () =>
      fetchTournamentRegistrationOptions({
        tenantId: config.tenantId,
        tournamentId: tournament!.id,
        playerId: player!.id,
        categoryId: apiCategoryId,
      }),
    enabled: canRunTournamentQueries,
  });

  const eligiblePartnersQuery = useQuery({
    queryKey: tournamentKeys.eligiblePartners(
      config.tenantId,
      tournament?.id,
      player?.id,
      apiCategoryId,
    ),
    queryFn: () =>
      fetchEligibleTournamentPartners({
        tenantId: config.tenantId,
        tournamentId: tournament!.id,
        playerId: player!.id,
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
    queryKey: tournamentKeys.partnerRequests(config.tenantId, player?.id),
    queryFn: () =>
      fetchTournamentPartnerRequests({
        tenantId: config.tenantId,
        playerId: player!.id,
      }),
    enabled: Boolean(open && config.tenantId && player?.id),
  });

  const invalidateRegistrationState = React.useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: tournamentKeys.list(config.tenantId) }),
      queryClient.invalidateQueries({ queryKey: tournamentKeys.partnerRequests(config.tenantId, player?.id) }),
      queryClient.invalidateQueries({ queryKey: tournamentKeys.registrationOptions(config.tenantId, tournament?.id, player?.id, apiCategoryId) }),
      queryClient.invalidateQueries({ queryKey: tournamentKeys.availablePlayers(config.tenantId, tournament?.id, apiCategoryId) }),
      queryClient.invalidateQueries({ queryKey: tournamentKeys.eligiblePartners(config.tenantId, tournament?.id, player?.id, apiCategoryId) }),
      queryClient.invalidateQueries({ queryKey: playerKeys.all }),
    ]);
  }, [apiCategoryId, config.tenantId, player?.id, queryClient, tournament?.id]);

  const createRequestMutation = useMutation({
    mutationFn: (requestedPlayerId: string) =>
      createTournamentPartnerRequest({
        tenantId: config.tenantId,
        tournamentId: tournament!.id,
        requesterPlayerId: player!.id,
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
        playerId: player!.id,
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
        pickerPlayerId: player!.id,
        availablePlayerId,
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

  const acceptRequestMutation = useMutation({
    mutationFn: (requestId: string) =>
      acceptTournamentPartnerRequest({ requestId, playerId: player!.id }),
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

  const rejectRequestMutation = useMutation({
    mutationFn: (requestId: string) =>
      rejectTournamentPartnerRequest({ requestId, playerId: player!.id }),
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
    return getAvailablePlayerSourceId(available) !== player?.id;
  });
  const currentAvailablePlayer =
    options?.availablePlayer ??
    (options?.availablePlayerId
      ? ({ id: options.availablePlayerId } as TournamentAvailablePlayer)
      : null) ??
    (availablePlayersQuery.data ?? []).find(
      (available) =>
        (!available.status || available.status === "available") &&
        getAvailablePlayerSourceId(available) === player?.id,
    ) ??
    null;
  const receivedRequests = (
    options?.receivedRequests?.length
      ? options.receivedRequests
      : partnerRequestsQuery.data ?? []
  ).filter((request) => player?.id && isReceivedPartnerRequest(request, player.id));
  const sentRequests = (
    options?.sentRequests?.length
      ? options.sentRequests
      : partnerRequestsQuery.data ?? []
  ).filter(
    (request) => player?.id && isSentPartnerRequest(request, player.id),
  );
  const filteredPartners = (eligiblePartnersQuery.data ?? []).filter((partner) =>
    getRegistrationPlayerName(partner)
      .toLowerCase()
      .includes(partnerSearch.trim().toLowerCase()),
  );

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
      <DialogContent className="max-h-[85vh] overflow-y-auto border-emerald-100 bg-white text-slate-900 shadow-xl shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950 dark:text-slate-100 dark:shadow-emerald-950/20 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Inscribirse al torneo</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Elegí cómo querés anotarte. Si enviás una solicitud, tu compañero debe aceptarla.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
            <p className="font-medium text-slate-900 dark:text-slate-100">
              {tournament?.name}
            </p>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
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
                <SelectTrigger className="w-full border-emerald-200 bg-white dark:border-emerald-900/60 dark:bg-slate-900">
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
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 px-4 py-3 text-sm text-slate-500 dark:border-emerald-900/60 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Consultando estado de inscripción...
            </div>
          ) : null}

          {registrationOptionsQuery.error ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
              {registrationOptionsQuery.error instanceof Error
                ? registrationOptionsQuery.error.message
                : "No se pudo consultar el estado de inscripción."}
            </p>
          ) : null}

          {alreadyHasPartner ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-300">
              Ya tenés pareja en este torneo.
            </p>
          ) : null}

          {!canRegister ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
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
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                  : "border-emerald-200 bg-white text-slate-900 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900/60 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-emerald-500/10"
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
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                  : "border-emerald-200 bg-white text-slate-900 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900/60 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-emerald-500/10"
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
            <div className="space-y-3 rounded-2xl border border-emerald-100 p-4 dark:border-emerald-900/60">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Podés quedar en la lista para que otro jugador te elija y cree la pareja.
              </p>
              <Button
                type="button"
                onClick={handleBecomeAvailable}
                disabled={isCheckingOptions || isActionPending || Boolean(currentAvailablePlayer)}
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
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
                  className="w-full border-emerald-200 bg-white text-slate-900 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900/60 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-emerald-500/10"
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
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-300">
              {success}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-emerald-200 bg-white text-slate-900 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900/60 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-emerald-500/10"
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
    <div className="space-y-3 rounded-2xl border border-emerald-100 p-4 dark:border-emerald-900/60">
      <div className="space-y-2">
        <Label>Buscar jugador elegible</Label>
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Nombre o apellido"
          disabled={loading || disabled}
          className="border-emerald-200 bg-white dark:border-emerald-900/60 dark:bg-slate-900"
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
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
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200"
                  : "border-emerald-100 bg-white text-slate-700 hover:bg-emerald-50 dark:border-emerald-900/60 dark:bg-slate-900/70 dark:text-slate-200"
              }`}
            >
              <span className="font-medium">{getRegistrationPlayerName(partner)}</span>
              <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                {formatPlayerMeta(partner)}
              </span>
            </button>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-emerald-200 px-3 py-4 text-center text-sm text-slate-500 dark:border-emerald-900/60 dark:text-slate-400">
            No hay compañeros elegibles para mostrar.
          </p>
        )}
      </div>

      <Button
        type="button"
        onClick={onSubmit}
        disabled={!selectedPartnerId || disabled}
        className="w-full bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
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
    <div className="space-y-3 rounded-2xl border border-emerald-100 p-4 dark:border-emerald-900/60">
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Jugadores disponibles
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Elegir uno crea la pareja automáticamente.
        </p>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando disponibles...
        </div>
      ) : players.length > 0 ? (
        <div className="space-y-2">
          {players.map((available) => (
            <div
              key={available.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-emerald-100 px-3 py-2 text-sm dark:border-emerald-900/60"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {getAvailablePlayerName(available)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatPlayerMeta(available.player ?? available)}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => onPick(available.id)}
                disabled={disabled}
                className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
              >
                Elegir
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-emerald-200 px-3 py-4 text-center text-sm text-slate-500 dark:border-emerald-900/60 dark:text-slate-400">
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
    <div className="space-y-3 rounded-2xl border border-emerald-100 p-4 dark:border-emerald-900/60">
      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
        Solicitudes pendientes
      </p>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
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
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No tenés solicitudes recibidas pendientes.
        </p>
      )}
      {sentRequests.length > 0 ? (
        <div className="space-y-2 border-t border-emerald-100 pt-3 dark:border-emerald-900/60">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
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
    <div className="flex flex-col gap-2 rounded-lg border border-emerald-100 px-3 py-2 text-sm dark:border-emerald-900/60 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-slate-900 dark:text-slate-100">
          {getRegistrationPlayerName(getPartnerRequestRequested(request))}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {request.tournament?.name ?? "Torneo"} · {formatRequestCategory(request)}
        </p>
      </div>
      <Badge
        variant="outline"
        className="w-fit border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
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
    <div className="flex flex-col gap-3 rounded-lg border border-emerald-100 px-3 py-2 text-sm dark:border-emerald-900/60 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-slate-900 dark:text-slate-100">
          {getRegistrationPlayerName(getPartnerRequestRequester(request))}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
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
          className="border-rose-200 bg-white text-rose-700 hover:bg-rose-50 dark:border-rose-900/60 dark:bg-slate-900 dark:text-rose-200"
        >
          Rechazar
        </Button>
        <Button
          type="button"
          size="sm"
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
      <div className="flex flex-wrap items-center gap-2 rounded-[1.5rem] border border-emerald-100 bg-white/80 p-3 shadow-sm shadow-emerald-100/50 dark:border-emerald-900/60 dark:bg-slate-950/70 dark:shadow-emerald-950/10">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className={
              selectedCategory === cat
                ? "rounded-full bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                : "rounded-full border-emerald-200 bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900/60 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-emerald-500/10"
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
        <Card className="overflow-hidden rounded-[1.75rem] border-emerald-100 bg-white/90 shadow-lg shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20">
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
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {entry.name}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 sm:hidden">
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
                      <span className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
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
  const { player } = usePlayerSafe();

  return React.useMemo(() => {
    if (!player) {
      return {
        canRegister: false,
        reason: "Necesitás iniciar sesión para inscribirte.",
      };
    }

    if (player.status !== "verified") {
      return {
        canRegister: false,
        reason: "Tu cuenta tiene que estar verificada para inscribirte.",
      };
    }

    if (canPlayerJoinTournament(player, tournament)) {
      return { canRegister: true, reason: "" };
    }

    return {
      canRegister: false,
      reason: "Este torneo no corresponde a tu categoria o genero.",
    };
  }, [player, tournament]);
}

function usePlayerSafe() {
  const { player } = usePlayer();
  return { player };
}

function canPlayerJoinTournament(
  player: EligiblePlayer,
  tournament: Tournament,
  fixedPartner?: Pick<EligiblePlayer, "category" | "gender">,
) {
  if (player.status !== "verified") return false;

  if (tournament.type === "sum") {
    if (typeof tournament.sumLimit !== "number") return false;
    if (!fixedPartner) return true;

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
      <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <CalendarClock className="h-3.5 w-3.5" />
        Sin reserva asignada
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-white px-2 py-1 dark:border-emerald-900/60 dark:bg-slate-950/70">
        <MapPin className="h-3 w-3" />
        Cancha {booking.courtNumber}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-white px-2 py-1 dark:border-emerald-900/60 dark:bg-slate-950/70">
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
    return "bg-emerald-600 text-white";
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
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 dark:border-emerald-900/60 dark:bg-slate-900/70">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}

function PositionBadge({ position }: { position: number }) {
  if (position === 1) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
        1
      </span>
    );
  }
  if (position === 2) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
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
    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
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
    <Card className="rounded-[1.75rem] border-emerald-100 bg-white/90 shadow-lg shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20">
      <CardContent className="flex flex-col items-center gap-3 py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          <Trophy className="h-6 w-6" />
        </div>
        <div className="text-center">
          <p className="font-medium text-slate-900 dark:text-slate-100">{title}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function RankingSkeleton() {
  return (
    <Card className="rounded-[1.75rem] border-emerald-100 bg-white/90 shadow-lg shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20">
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
          className="rounded-[1.75rem] border-emerald-100 bg-white/90 shadow-lg shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950/80"
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
