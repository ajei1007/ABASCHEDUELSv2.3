/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import { toast } from 'react-toastify';

interface LoomRecorderProps {
  onComplete: (loomUrl: string) => void;
  onCancel: () => void;
}

const LoomRecorder: React.FC<LoomRecorderProps> = ({
  onComplete,
  onCancel,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const latestComplete = useRef(onComplete);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    latestComplete.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let teardown: (() => void) | undefined;

    (async () => {
      try {
        const { isSupported } = await import('@loomhq/record-sdk/is-supported');
        const { supported } = await isSupported();
        if (!supported || !buttonRef.current) {
          return;
        }

        const { setup } = await import('@loomhq/record-sdk');

        const inst: any = await setup({
          publicAppId: import.meta.env.REACT_APP_LOOM_APP_ID,
        });
        const sdkButton = inst.configureButton({ element: buttonRef.current });

        sdkButton.on('insert-click', async ({ sharedUrl }: any) => {
          try {
            const { oembed } = await import('@loomhq/loom-embed');
            const { html } = await oembed(sharedUrl, { width: 400 });
            console.log('[LoomRecorder] insert-click:', sharedUrl);
            setPreviewHtml(html);
            setRecording(false);
            latestComplete.current(sharedUrl);
          } catch (err) {
            console.error('[LoomRecorder] Error inserting Loom video:', err);
            toast.error(
              'An error occurred while inserting the Loom video. Please try again later.',
            );
          }
        });

        inst.on?.('editor:closed', () => {
          setRecording(false);
          onCancel();
        });

        teardown = inst.teardown ?? sdkButton.destroy?.bind(sdkButton);
        setSdkReady(true);
      } catch (err) {
        console.error('[LoomRecorder] Error setting up Loom SDK:', err);
        toast.error(
          'An error occurred while setting up the Loom SDK. Please try again later.',
        );
      }
    })();

    return () => teardown?.();
  }, []);

  if (recording) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        bgcolor: 'rgba(0,0,0,0.7)',
        zIndex: 1500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 4,
          borderRadius: 2,
          width: '90%',
          maxWidth: 640,
        }}
      >
        {!previewHtml ? (
          <Stack spacing={3} alignItems='center'>
            <Typography variant='h6'>Record a Loom video</Typography>
            <Button
              ref={buttonRef}
              variant='contained'
              disabled={!sdkReady}
              sx={{ minWidth: 160 }}
              onClick={() => {
                setRecording(true);
                buttonRef.current!.click();
              }}
            >
              {sdkReady ? 'Start recording' : 'Loading…'}
            </Button>
            <Button variant='outlined' onClick={onCancel}>
              Cancel
            </Button>
          </Stack>
        ) : (
          <Stack spacing={3} alignItems='center'>
            <Typography variant='h6'>Preview</Typography>
            <Box
              dangerouslySetInnerHTML={{ __html: previewHtml }}
              sx={{ width: '100%' }}
            />
            <Stack direction='row' spacing={2}>
              <Button variant='contained' onClick={() => setPreviewHtml(null)}>
                Retake
              </Button>
              <Button variant='outlined' onClick={onCancel}>
                Close
              </Button>
            </Stack>
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default LoomRecorder;
