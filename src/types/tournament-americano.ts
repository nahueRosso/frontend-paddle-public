export type AmericanoPlayerRef = {
  id: string;
  firstName: string;
  lastName: string;
};

export type AmericanoMatchBooking = {
  id: string;
  courtNumber: number;
  date: string;
  startTime: string;
} | null;

export type AmericanoMatch = {
  id: string;
  finished: boolean;
  score: { sets: { pair1: number; pair2: number }[] } | null;
  winnerSide: "pair1" | "pair2" | null;
  booking: AmericanoMatchBooking;
  courtNumber: number | null;
  scheduledStartTime: string | null;
  pair1: [AmericanoPlayerRef, AmericanoPlayerRef];
  pair2: [AmericanoPlayerRef, AmericanoPlayerRef];
};

export type AmericanoRound = {
  id: string;
  roundNumber: number;
  categoryId: string | null;
  byePlayerIds: string[];
  matches: AmericanoMatch[];
};

export type AmericanoStanding = {
  id: string;
  categoryId: string | null;
  player: AmericanoPlayerRef;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  gamesWon: number;
  gamesLost: number;
};

export type AmericanoData = {
  rounds: AmericanoRound[];
  standings: AmericanoStanding[];
};
