//types/tournament-group.ts

import { AmericanoData } from "./tournament-americano";

export type PlayerGender = "male" | "female";
export type CategoryGender = "male" | "female" | "mixed" | "mixed-only";
export type Round = 2 | 4 | 8 | 16 | 32 | number;

export type TournamentFormat =
  | "single_elimination"
  | "group_stage"
  | "group_stage_playoff"
  | "americano";

export type TournamentStatus =
  | "registration"
  | "group_stage"
  | "playoff"
  | "americano"
  | "finished";

export type SourceType = "direct" | "group";

export interface PlayOffTeam {
  id: string;
  tenantId: string;
  tournamentTeam: Team;
  seed: number;
  sourceType: SourceType;
  sourceRank: number | null;
  eliminated: boolean;
}

export interface MatchBookingInfo {
  id: string;
  date: string;
  startTime: string;
  endTime?: string;
  courtNumber: number;
  tenantId?: string;
  userName?: string;
  userPhone?: string;
  playerId?: string | null;
  status?: string;
  reservedBy?: string;
  source?: string;
  createdAt?: string;
}

export interface PlayOffNextMatch {
  id: string;
  tenantId: string;
  round: Round;
  matchNumber: number;
  score: MatchScore | null;
  finished: boolean;
  team1: PlayOffTeam | null;
  team2: PlayOffTeam | null;
  winner: PlayOffTeam | null;
  booking: MatchBookingInfo | null;
  nextSlot: "team1" | "team2" | null;
}

export interface PlayOffMatch {
  id: string;
  tenantId: string;
  round: Round;
  matchNumber: number;
  score?: MatchScore | null;
  finished: boolean;
  booking: MatchBookingInfo | null;
  team1: PlayOffTeam | null;
  team2: PlayOffTeam | null;
  winner: PlayOffTeam | null;
  nextMatch: PlayOffNextMatch | null;
}

export interface PlayOff {
  teams: PlayOffTeam[];
  matches: PlayOffMatch[];
}

export interface Player {
  id: string;
  dni: string | null;
  birthdayDate: string | null;
  tenantId: string;
  phoneNumber: string;
  puntos: number | null;
  email: string;
  firstName: string;
  lastName: string;
  category: number;
  gender: PlayerGender;
  status: "pending" | "verified" | "rejected";
  verified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  tenantId: string;
  player1?: Player;
  player2?: Player;
  approved: boolean;
  finalPosition: string | number | null;
}

export interface TeamStanding {
  id: string;
  team: Team;
  points: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
}

export interface SetScore {
  team1: number;
  team2: number;
}

export interface MatchScore {
  sets: SetScore[];
}

export interface Match {
  id: string;
  tenantId: string;
  team1: Team | null;
  team2: Team | null;
  winner: Team | null;
  score: MatchScore | null;
  finished: boolean;
  booking?: MatchBookingInfo | null;
}

export interface Category {
  id?: string;
  tenantId?: string;
  categoryLevel: number;
  gender: CategoryGender;
  categoryFemale?: number;
}

export interface Group {
  id: string;
  tenantId: string;
  name: string;
  category: Category;
  teams: TeamStanding[];
  matches: Match[];
}

export interface PlayerSummary {
  firstName: string;
  lastName: string;
}

export interface TeamSummary {
  id: string;
  player1: PlayerSummary;
  player2: PlayerSummary;
}

export interface GroupCategorySummary {
  categoryLevel: number;
  gender: CategoryGender;
}

export interface GroupTeamStanding {
  id: string;
  points: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  team: TeamSummary;
}

export interface GroupMatchSummary {
  id: string;
  finished: boolean;
  team1: TeamSummary | null;
  team2: TeamSummary | null;
  booking?: MatchBookingInfo | null;
}

export interface GroupWrapper {
  id: string;
  name: string;
  category?: GroupCategorySummary;
  categoryId?: string;
  teams: GroupTeamStanding[];
  matches: GroupMatchSummary[];
}

export interface TournamentGroup {
  id: string;
  name: string;
  format: TournamentFormat;
  status: TournamentStatus;
  startDate: string;
  endDate: string;
  groupsCount: number | null;
  qualifyPerGroup: number | null;
  americanoMinMatches?: number | null;
  americanoRoundRobin?: boolean | null;
  americanoSetsPerMatch?: number | null;
  americanoTotalRounds?: number | null;
  finishedMatch: number;
  totalMatches: number;
  allMatchesFinished: boolean;
  categories?: Category[];
  groups: GroupWrapper[];
  playOff: PlayOff; // 👈 añadir esto al tipo existente
  americano: AmericanoData;
}

export type GetAllStageGroup = TournamentGroup[];
