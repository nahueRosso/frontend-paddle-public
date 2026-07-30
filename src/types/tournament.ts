export type TenantConfig = {
  id: string;
  tenantId: string;
  pointsChampion: number;
  pointsFinalist: number;
  pointsSemiFinal: number;
  pointsQuarterFinal: number;
  pointsRound16: number;
  allowWomenPlayLowerMenCategories: boolean;
  womenCategoryOffset: number;
  registrationFeePercentage?: number;
};

export type TournamentType = "regular" | "sum";
export type TournamentFormat =
  | "single_elimination"
  | "group_stage"
  | "group_stage_playoff"
  | "americano";
export type Gender = "male" | "female" | "mixed" | "mixed-only";

export type TournamentCategory = {
  id?: string;
  categoryLevel: number;
  gender: Gender;
  categoryFemale:number | null;
};

export type TournamentResultTeamPlayer = {
  firstName?: string;
  lastName?: string;
};

export type TournamentResultTeam = {
  id?: string;
  player1?: TournamentResultTeamPlayer | null;
  player2?: TournamentResultTeamPlayer | null;
  name?: string | null;
  points?: number | null;
};

export type TournamentResults = {
  champion?: TournamentResultTeam | null;
  finalist?: TournamentResultTeam | null;
  semiFinalists?: TournamentResultTeam[];
  quarterFinalists?: TournamentResultTeam[];
};

export type PointsConfig = {
  pointsChampion: number;
  pointsFinalist: number;
  pointsSemiFinal: number;
  pointsQuarterFinal: number;
  pointsRound16: number;
};

export type Tournament = {
  id: string;
  tenantId: string;
  name: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  categories?: TournamentCategory[];
  type: TournamentType;
  format: TournamentFormat;
  sumLimit?: number;
  givesPoints?: boolean;
  status: string;
  teams?: { approved?: boolean }[];
  groups?: unknown[];
  playoffs?: unknown[];
  results?: TournamentResults | null;
  pointsConfig?: PointsConfig | null;
};

export async function parseApiError(res: Response) {
  // Nest suele responder { statusCode, message, error }
  try {
    const data = await res.json();
    const msg =
      typeof data?.message === "string"
        ? data.message
        : Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.error || "Request failed";
    return { message: msg, raw: data };
  } catch {
    return { message: await res.text().catch(() => "Request failed") };
  }
}
