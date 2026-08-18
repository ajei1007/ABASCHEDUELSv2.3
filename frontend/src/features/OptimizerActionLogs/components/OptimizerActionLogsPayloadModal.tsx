import {
  Box,
  IconButton,
  Tooltip,
  Stack,
  CircularProgress,
} from '@mui/material';
import { ContentCopy, Download, Error as ErrorIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import CustomButton from 'components/Button';
import CustomModal from 'components/Modal';
import { memo, useCallback, useMemo, useState } from 'react';

// Constants
const JSON_INDENT = 2;
const MAX_DISPLAY_HEIGHT = '500px';
const FILENAME_MAX_LENGTH = 100;
const DOWNLOAD_TIMEOUT = 5000; // 5 seconds

// Types
type PayloadData =
  | Record<string, unknown>
  | Array<unknown>
  | string
  | number
  | boolean
  | null;

/**
 * Props for the OptimizerActionLogsPayloadModal component
 */
export interface IOptimizerActionLogsPayloadModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Title displayed in the modal header */
  title: string;
  /** Payload data to display as JSON */
  payload?: PayloadData;
  /** Callback when modal is closed */
  handleClose: () => void;
  /** Callback when confirm/close button is clicked */
  handleConfirm: () => void;
}

/**
 * Props for ref-based usage of the component
 */
export interface IOptimizerActionLogsPayloadModalPropsForRef
  extends Pick<IOptimizerActionLogsPayloadModalProps, 'title' | 'payload'> {}

// Utility functions
/**
 * Sanitizes a filename by removing special characters and limiting length
 * @param filename - The original filename
 * @returns Sanitized filename safe for downloads
 */
const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .substring(0, FILENAME_MAX_LENGTH);
};

/**
 * Checks if the Clipboard API is supported in the current browser
 * @returns Whether clipboard operations are supported
 */
const isClipboardSupported = (): boolean => {
  return !!(navigator.clipboard && navigator.clipboard.writeText);
};

/**
 * Formats payload data for display, with error handling
 * @param payload - The payload data to format
 * @returns Formatted JSON string or error message
 */
const formatPayloadForDisplay = (payload: PayloadData | undefined): string => {
  try {
    if (payload === undefined) {
      return 'No payload data available';
    }
    return JSON.stringify(payload, null, JSON_INDENT);
  } catch (error) {
    console.error('Error formatting payload:', error);
    return 'Error: Unable to format payload data';
  }
};

/**
 * Modal component for displaying and managing optimizer action log payloads
 * Provides functionality to view, copy, and download JSON payload data
 */

const OptimizerActionLogsPayloadModal = ({
  isOpen,
  title,
  payload,
  handleClose,
  handleConfirm,
}: IOptimizerActionLogsPayloadModalProps) => {
  const [isCopying, setIsCopying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Memoize the JSON string to avoid re-computation on every render
  const jsonString = useMemo(() => formatPayloadForDisplay(payload), [payload]);

  // Memoize sanitized filename
  const sanitizedFilename = useMemo(() => {
    const baseFilename = title ? sanitizeFilename(title) : 'payload';
    return `${baseFilename}_payload.json`;
  }, [title]);

  const handleCopyToClipboard = useCallback(async () => {
    if (isCopying) return; // Prevent multiple simultaneous copies

    // Check if clipboard API is supported
    if (!isClipboardSupported()) {
      toast.error('Clipboard not supported in this browser');
      return;
    }

    setIsCopying(true);

    try {
      await navigator.clipboard.writeText(jsonString);
      toast.success('JSON copied to clipboard successfully!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);

      // Fallback method for older browsers or security restrictions
      try {
        const textArea = document.createElement('textarea');
        textArea.value = jsonString;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('JSON copied to clipboard successfully!');
      } catch (fallbackError) {
        console.error('Fallback copy method also failed:', fallbackError);
        toast.error(
          'Failed to copy to clipboard. Your browser may not support this feature.',
        );
      }
    } finally {
      setIsCopying(false);
    }
  }, [jsonString, isCopying]);

  const handleDownloadJson = useCallback(() => {
    if (isDownloading) return; // Prevent multiple simultaneous downloads

    setIsDownloading(true);

    try {
      // Validate that we have data to download
      if (!jsonString || jsonString.trim() === '') {
        toast.error('No data available to download');
        return;
      }

      const blob = new Blob([jsonString], {
        type: 'application/json;charset=utf-8',
      });

      // Check blob size (warn if too large)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (blob.size > maxSize) {
        toast.warning('File is large and may take time to download');
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = sanitizedFilename;
      link.style.display = 'none';

      // Add timeout for cleanup
      const timeoutId = setTimeout(() => {
        URL.revokeObjectURL(url);
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, DOWNLOAD_TIMEOUT);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up immediately for successful downloads
      clearTimeout(timeoutId);
      URL.revokeObjectURL(url);

      toast.success('JSON file downloaded successfully!');
    } catch (error) {
      console.error('Failed to download JSON:', error);
      toast.error('Failed to download JSON file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [jsonString, sanitizedFilename, isDownloading]);

  const hasValidPayload = payload !== undefined && payload !== null;
  const displayContent = hasValidPayload
    ? jsonString
    : 'No payload data available';
  const isError = jsonString.startsWith('Error:');

  return (
    <CustomModal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby={`${title}-modal-title`}
      aria-describedby={`${title}-modal-description`}
      title={title}
      maxWidth='lg'
      actionbuttons={
        <Stack direction='row' spacing={1} alignItems='center'>
          <Tooltip title={isCopying ? 'Copying...' : 'Copy to Clipboard'}>
            <span>
              <IconButton
                onClick={handleCopyToClipboard}
                size='small'
                color='primary'
                disabled={!hasValidPayload || isError || isCopying}
                aria-label='Copy JSON to clipboard'
              >
                {isCopying ? <CircularProgress size={20} /> : <ContentCopy />}
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={isDownloading ? 'Downloading...' : 'Download JSON'}>
            <span>
              <IconButton
                onClick={handleDownloadJson}
                size='small'
                color='primary'
                disabled={!hasValidPayload || isError || isDownloading}
                aria-label='Download JSON file'
              >
                {isDownloading ? <CircularProgress size={20} /> : <Download />}
              </IconButton>
            </span>
          </Tooltip>

          <CustomButton
            onClick={handleConfirm}
            variant='outlined'
            aria-label='Close modal'
          >
            Close
          </CustomButton>
        </Stack>
      }
    >
      <Box
        component='pre'
        role='textbox'
        aria-label='JSON payload content'
        aria-readonly='true'
        tabIndex={0}
        sx={{
          backgroundColor: isError ? '#ffebee' : '#f5f5f5',
          border: `1px solid ${isError ? '#f44336' : '#ddd'}`,
          borderRadius: 1,
          padding: 2,
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          overflow: 'auto',
          maxHeight: MAX_DISPLAY_HEIGHT,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          my: 0,
          color: isError ? '#d32f2f' : 'inherit',
          minHeight: '100px',
          position: 'relative',
          '&:focus': {
            outline: '2px solid #1976d2',
            outlineOffset: '2px',
          },
        }}
      >
        {isError && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 1,
              color: '#d32f2f',
            }}
          >
            <ErrorIcon sx={{ mr: 1, fontSize: '1rem' }} />
            <span>Payload Error</span>
          </Box>
        )}
        {displayContent}
      </Box>
    </CustomModal>
  );
};

/**
 * Memoized export to prevent unnecessary re-renders when parent props haven't changed
 * Uses React.memo for performance optimization
 */
export default memo(OptimizerActionLogsPayloadModal);
