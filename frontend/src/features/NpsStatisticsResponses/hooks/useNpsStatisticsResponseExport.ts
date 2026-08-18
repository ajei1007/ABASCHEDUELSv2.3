import { useCallback, useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { yieldToMainThread } from 'utils/yieldToMainThread';
import type { IApiNpsStatisticsResponseItem } from 'types/api';
import { getNpsScoreLabel } from '../utils';

// Helper to fetch a single page of NPS responses (simulate API call)
async function fetchNpsStatisticsResponseItemsPage({
  page,
  limit,
  companyId,
  questionId,
  quarter,
  signal,
}: {
  page: number;
  limit: number;
  companyId: string | null;
  questionId: string | null;
  quarter: string;
  signal?: AbortSignal;
}) {
  const response = await axios.get('/surveydata', {
    params: {
      companyId,
      questionId,
      quarter,
      page,
      limit,
    },
    signal,
  });
  return {
    items: (response.data?.result || []) as IApiNpsStatisticsResponseItem[],
  };
}

/**
 * Custom hook to export NPS statistics responses as an Excel file.
 */
export function useNpsStatisticsResponseExport({
  companyId,
  questionId,
  quarter,
  totalCount,
}: {
  companyId: string | null;
  questionId: string | null;
  quarter: string;
  totalCount: number;
}) {
  const [isExporting, setIsExporting] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Helper to fetch all pages of responses
  const fetchAllResponses = useCallback(
    async (signal?: AbortSignal): Promise<IApiNpsStatisticsResponseItem[]> => {
      const limit = 1000;
      const pages = Math.ceil(totalCount / limit);
      let allItems: IApiNpsStatisticsResponseItem[] = [];
      for (let page = 1; page <= pages; page++) {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        const { items } = await fetchNpsStatisticsResponseItemsPage({
          page,
          limit,
          companyId,
          questionId,
          quarter,
          signal,
        });
        allItems = allItems.concat(items);
        await yieldToMainThread(); // yield every 1000 items (1 page)
      }
      return allItems;
    },
    [companyId, questionId, quarter, totalCount],
  );

  // Transform API items for export
  const transformForExport = async (
    items: IApiNpsStatisticsResponseItem[],
  ): Promise<any[]> => {
    const result: any[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      result.push({
        Company: item.company?.name || '-',
        'User Type': item.userType,
        'Standard Role':
          item.roles.map((role) => role.standardRoles).join(', ') || '-',
        Role: item.roles.map((role) => role.name).join(', ') || '-',
        'Full Name': `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim(),
        Rating: `${item.rating}/10`,
        Category: getNpsScoreLabel(item.rating),
        Feedback: item.feedback ?? '-',
        'Surveyed At': item.createdAt
          ? typeof window !== 'undefined' && window.moment
            ? window.moment(item.createdAt).format('MM/DD/YYYY HH:mm:ss')
            : item.createdAt
          : '-',
      });
      if ((i + 1) % 1000 === 0) {
        await yieldToMainThread();
      }
    }
    return result;
  };

  /**
   * Export all NPS responses to an Excel file.
   */
  const exportResponsesData = useCallback(async (): Promise<void> => {
    setIsExporting(true);
    abortControllerRef.current?.abort(); // abort any previous export
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    try {
      let allItems;
      try {
        allItems = await fetchAllResponses(signal);
      } catch (err: any) {
        if (
          axios.isCancel(err) ||
          err?.name === 'CanceledError' ||
          err?.code === 'ERR_CANCELED' ||
          err?.message === 'canceled' ||
          err?.message === 'Request aborted' ||
          err?.name === 'AbortError' ||
          signal.aborted
        ) {
          return;
        }
        const msg = 'Error while fetching all NPS responses.';
        toast.error(msg);
        // eslint-disable-next-line no-console
        console.error(msg, err);
        return;
      }

      await yieldToMainThread();
      if (signal.aborted) return;

      let exportData;
      try {
        exportData = await transformForExport(allItems);
      } catch (err) {
        const msg = 'Error during data transformation for export.';
        toast.error(msg);
        // eslint-disable-next-line no-console
        console.error(msg, err);
        return;
      }

      await yieldToMainThread();
      if (signal.aborted) return;

      try {
        const { utils, writeFile } = await import('xlsx');
        if (signal.aborted) return;
        const worksheet = utils.json_to_sheet(exportData);
        // Set column widths
        worksheet['!cols'] = [
          { wch: 20 }, // Company
          { wch: 12 }, // User Type
          { wch: 15 }, // Standard Role
          { wch: 15 }, // Role
          { wch: 20 }, // Full Name
          { wch: 8 }, // Rating
          { wch: 10 }, // Category
          { wch: 40 }, // Feedback
          { wch: 22 }, // Surveyed At
        ];
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'NPS Responses');
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
        writeFile(workbook, `NPS_Responses_${timestamp}.xlsx`);
      } catch (err) {
        const msg = 'Error while generating or saving the Excel file.';
        toast.error(msg);
        // eslint-disable-next-line no-console
        console.error(msg, err);
      }
    } catch (err) {
      // Catch any unexpected errors
      const msg = 'Unexpected error during NPS responses export.';
      toast.error(msg);
      // eslint-disable-next-line no-console
      console.error(msg, err);
    } finally {
      setIsExporting(false);
    }
  }, [fetchAllResponses, transformForExport]);

  return { exportResponsesData, isExporting };
}
