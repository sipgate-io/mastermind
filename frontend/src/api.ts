const BASE_URL = "http://localhost:3002";
// TODO: read token from... somewhere?
const TOKEN = "";

export type Ranking = {
  usersTel: string;
  duration: number;
  tries: number;
  hasWon: number;
};

export async function getRankings(): Promise<Ranking[]> {
  const rankingResponse = await fetch(`${BASE_URL}/ranking`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });
  if (!rankingResponse.ok)
    throw new Error(`failed to get rankings: ${rankingResponse.statusText}`);

  const rankings: Ranking[] = await rankingResponse.json();
  return rankings;
}
