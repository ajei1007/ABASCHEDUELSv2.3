import { SCORE_SECTIONS } from '../constants';

// Define 5 states based on responseRate
export function getResponseRateState(rate: number) {
  if (rate < 20) return 'Very Low';
  if (rate < 40) return 'Low';
  if (rate < 60) return 'Moderate';
  if (rate < 80) return 'High';
  return 'Excellent';
}

export const getScoreSectionName = (score: number) => {
  return (
    SCORE_SECTIONS.find(
      (section) =>
        score >= section.range[0] &&
        score < (section.range[1] === 100 ? 101 : section.range[1]),
    )?.name ?? 'Fair'
  );
};

export const getScoreSectionData = (score: number) => {
  return (
    SCORE_SECTIONS.find(
      (section) =>
        score >= section.range[0] &&
        score < (section.range[1] === 100 ? 101 : section.range[1]),
    ) || SCORE_SECTIONS[2] // Default to 'Fair'
  );
};
