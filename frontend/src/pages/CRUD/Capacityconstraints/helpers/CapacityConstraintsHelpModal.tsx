import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

const CapacityConstraintsHelpModal: React.FC<HelpModalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Need Help?</DialogTitle>
      <DialogContent>
        <Typography>
          This form helps you set up capacity constraints for different roles and activities.
        </Typography>
        <Typography mt={2}>
          - <strong>Step 1:</strong> Select the activity this constraint applies to.
        </Typography>
        <Typography mt={2}>
          - <strong>Step 2:</strong> Assign roles and define min/max values.
        </Typography>
        <Typography mt={2}>
          - <strong>Step 3:</strong> Set additional constraint settings.
        </Typography>
        <Typography mt={2}>
          If you need more assistance, please contact support.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CapacityConstraintsHelpModal;
