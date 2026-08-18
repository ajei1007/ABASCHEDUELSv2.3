export function getNpsScoreLabel(score: number): string {
  if (score >= 9) return 'Promoter';
  if (score >= 7) return 'Passive';
  return 'Detractor';
}

export function getNpsScoreFgColor(score: number): string {
  const category = getNpsScoreLabel(score);
  if (category === 'Promoter') {
    return 'rgb(22, 101, 52)';
  }
  if (category === 'Passive') {
    return 'rgb(133, 77, 14)';
  }
  return 'rgb(153, 27, 27)';
}

export function getNpsScoreBgColor(score: number): string {
  const category = getNpsScoreLabel(score);
  if (category === 'Promoter') {
    return 'rgb(220, 252, 231)';
  }
  if (category === 'Passive') {
    return 'rgb(254, 249, 195)';
  }
  return 'rgb(254, 226, 226)';
}
