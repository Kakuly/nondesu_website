export interface GameShellOptions {
  slug: string;
  title: string;
  onScore?: (score: number) => void;
}

export function formatScore(score: number): string {
  return score.toLocaleString("ja-JP");
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
