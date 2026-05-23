export type SessionState =
  | "loading"
  | "unauthenticated"
  | "needs_person_registration"
  | "forbidden"
  | "authenticated";

export type PlayerSessionResult = {
  status: SessionState;
  message?: string | null;
  personExists?: boolean;
  playerExists?: boolean;
  verifiedInClub?: boolean;
  personId?: string | null;
  playerId?: string | null;
  payload?: unknown;
};

export type AdminSessionResult = {
  status: SessionState;
  message?: string | null;
  tenantId?: string | null;
  slug?: string | null;
  payload?: unknown;
};
