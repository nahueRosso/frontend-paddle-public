export interface GetAllPlayoff {
  id: string;
  tenantId: string;
  name: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  type: "regular" | string;
  format: "group_stage_playoff" | "group_stage" | string;
  sumLimit: number | null;
  givesPoints: boolean;
  status: "registration" | "group_stage" | string;
  maxTeams: number | null;
  groupsCount: number;
  qualifyPerGroup: number;
  playoffSize: number;

  categories: Category[];
  teams: Team[];
  matches: Match[];
  pointsConfig: PointsConfig[];

  createdAt: string;
  updatedAt: string;
}

// export interface Category {
//   id: string;
//   tenantId: string;
//   categoryLevel: number;
//   gender: string;
//   categoryFemale: number;
// }

export interface Team {
  id: string;
  tenantId: string;
  approved: boolean;
  finalPosition: number | null;
}

export interface Match {
  // actualmente viene vacío en el backend
  [key: string]: unknown;
}

export interface PointsConfig {
  // actualmente viene vacío en el backend
  [key: string]: unknown;
}



export type GetAllStageGroup = {
  id: string;
  tenantId: string;
  name: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  type: string;
  format: string;
  sumLimit: number | null;
  givesPoints: boolean;
  status: string;
  maxTeams: number | null;
  groupsCount: number;
  qualifyPerGroup: number;
  playoffSize: number;

  categories: Category[];
  pointsConfig: PointsConfig[];
  groups: Group[];

  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  tenantId: string;
  categoryLevel: number;
  gender: string;
  categoryFemale: number;
};

export type Group = {
  id: string;
  tenantId: string;
  name: string;
  category: Category;
  teams: GroupTeam[];
  matches: GroupMatch[];
};

export type GroupTeam = {
  id: string;
  team?: TeamDetail;
  points: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
};

export type GroupMatch = {
  id: string;
  tenantId: string;
  team1?: TeamDetail;
  team2?: TeamDetail;
  score: string | null;
  finished: boolean;
};

export type Player = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
};

export type TeamDetail = {
  id: string;
  tenantId: string;
  player1?: Player | null;
  player2?: Player | null;
  approved?: boolean;
  finalPosition?: number | null;
};
