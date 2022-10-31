const BASE_URL = "http://localhost:3002";
// TODO: read token from... somewhere?
const TOKEN = "abcdef123";

export type Ranking = {
  usersTel: string;
  duration: number;
  tries: number;
  score: number;
  hasWon: number;
  key: number;
  isHighlighted?: boolean;
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

export async function getNumberToCall(): Promise<string> {
  const response = await fetch(`${BASE_URL}/getNumberToCall`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });
  if (!response.ok)
    throw new Error(`failed to get numberToCall: ${response.statusText}`);

  return await response.text();
}
