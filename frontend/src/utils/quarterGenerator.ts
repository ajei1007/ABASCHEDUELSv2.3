// Utility to generate quarters from a start date up to the current quarter
export function generateQuarters(
  startDate: Date,
): { value: string; label: string }[] {
  const result: { value: string; label: string }[] = [];
  const now = new Date();
  let year = startDate.getFullYear();
  let quarter = Math.floor(startDate.getMonth() / 3) + 1;
  const currentYear = now.getFullYear();
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;

  while (
    year < currentYear ||
    (year === currentYear && quarter <= currentQuarter)
  ) {
    result.unshift({
      value: `${year}_q${quarter}`,
      label: `${year} - Q${quarter}`,
    });
    quarter++;
    if (quarter > 4) {
      quarter = 1;
      year++;
    }
  }
  return result;
}

export function getCurrentQuarter(): { value: string; label: string } {
  const now = new Date();
  const year = now.getFullYear();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return {
    value: `${year}_q${quarter}`,
    label: `${year} - Q${quarter}`,
  };
}

export function validateQuarter(quarter: string): boolean {
  const regex = /^\d{4}_q[1-4]$/;
  return regex.test(quarter);
}

export function formatQuarter(quarter: string): string {
  const [year, q] = quarter.split('_q');
  return `${year} - Q${q}`;
}
