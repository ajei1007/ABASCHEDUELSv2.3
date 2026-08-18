import { useCallback, useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import type { WorkBook } from 'xlsx';
import { formatQuarter } from 'utils/quarterGenerator';
import { yieldToMainThread } from 'utils/yieldToMainThread';
import type { IApiNpsStatisticsData } from 'types/api';

export function useNpsStatisticsExport(
  statistics: IApiNpsStatisticsData | null,
) {
  const [isExporting, setIsExporting] = useState(false);
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    return () => {
      abortRef.current = true;
    };
  }, []);

  /**
   * Exports NPS statistics to an Excel file with multiple sheets.
   * Uses lazy import for xlsx functions.
   * Shows toast messages on error.
   * Yields to main thread after each major section.
   * Aborts if component unmounts.
   */
  const exportStatistics = useCallback(async (): Promise<void> => {
    if (!statistics) {
      toast.error('No statistics data to export.');
      return;
    }
    setIsExporting(true);
    try {
      // Section 1: Import xlsx
      const xlsx = await import('xlsx');
      await yieldToMainThread(); // yield
      if (abortRef.current) return;
      const { utils, writeFile } = xlsx;
      // Section 2: Create workbook
      const wb: WorkBook = utils.book_new();
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const safeSheet = (ws: any, cols: number) => {
        ws['!cols'] = Array(cols).fill({ wch: 20 });
        return ws;
      };
      await yieldToMainThread(); // yield
      if (abortRef.current) return;
      // 1. Summary Sheet
      const summaryRows = [
        {
          'Total Responses': statistics.npsTotalResponses,
          'Response Rate (%)': `${statistics.npsResponseRate}%`,
          Mean: statistics.npsRatingStatistics.mean?.toFixed(1),
          Median: statistics.npsRatingStatistics.median?.toFixed(1),
          'Std Deviation': statistics.npsRatingStatistics.deviation?.toFixed(1),
        },
      ];
      if (summaryRows.length) {
        const ws = safeSheet(
          utils.json_to_sheet(summaryRows),
          Object.keys(summaryRows[0]).length,
        );
        utils.book_append_sheet(wb, ws, 'Summary');
      }
      await yieldToMainThread(); // yield
      if (abortRef.current) return;
      // 2. Score by Quarter
      if (statistics.npsScore.length) {
        const rows = statistics.npsScore.map((item) => ({
          Quarter: formatQuarter(item.quarter),
          'NPS Score': item.score?.toFixed(1),
        }));
        const ws = safeSheet(utils.json_to_sheet(rows), 2);
        utils.book_append_sheet(wb, ws, 'Score by Quarter');
      }
      await yieldToMainThread(); // yield
      if (abortRef.current) return;
      // 3. Rating Distribution
      const dist = statistics.npsRatingDistribution;
      const distRows = [
        {
          Type: 'Detractors',
          Count: dist.detractors.count,
          Percentage: `${dist.detractors.percentage}%`,
        },
        {
          Type: 'Passives',
          Count: dist.passives.count,
          Percentage: `${dist.passives.percentage}%`,
        },
        {
          Type: 'Promoters',
          Count: dist.promoters.count,
          Percentage: `${dist.promoters.percentage}%`,
        },
      ];
      if (distRows.length) {
        const ws = safeSheet(utils.json_to_sheet(distRows), 3);
        utils.book_append_sheet(wb, ws, 'Rating Distribution');
      }
      await yieldToMainThread(); // yield
      if (abortRef.current) return;
      // 4. Distribution by Role
      const byRoleRows = Object.entries(statistics.npsDistributionByRole).map(
        ([role, data]) => ({
          Role: role,
          'NPS Score': data.npsScore?.toFixed(1),
          'Total Responses': data.totalResponses,
        }),
      );
      if (byRoleRows.length) {
        const ws = safeSheet(utils.json_to_sheet(byRoleRows), 3);
        utils.book_append_sheet(wb, ws, 'Distribution by Role');
      }
      await yieldToMainThread(); // yield
      if (abortRef.current) return;
      // 5. Response Trends
      if (statistics.npsResponseTrends.length) {
        const rows = statistics.npsResponseTrends.map((item) => ({
          Quarter: formatQuarter(item.quarter),
          'Total Responses': item.totalResponses,
        }));
        const ws = safeSheet(utils.json_to_sheet(rows), 2);
        utils.book_append_sheet(wb, ws, 'Response Trends');
      }
      await yieldToMainThread(); // yield
      if (abortRef.current) return;
      // Download with timestamp for uniqueness
      writeFile(wb, `NPS_Statistics_${timestamp}.xlsx`);
      toast.success('NPS statistics exported successfully!');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Failed to export NPS statistics. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [statistics]);

  return { exportStatistics, isExporting };
}
