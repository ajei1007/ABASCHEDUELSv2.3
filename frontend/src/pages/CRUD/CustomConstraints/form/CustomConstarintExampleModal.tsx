import React from 'react';
import CustomModal from 'components/Modal';
import { Stack, Typography, Box } from '@mui/material';

interface ICustomConstarintExampleModal {
  openIconModal: boolean;
  setOpenIconModal: () => void;
}

const CustomConstarintExampleModal = ({
  openIconModal,
  setOpenIconModal,
}: ICustomConstarintExampleModal) => {
  return (
    <CustomModal
      open={openIconModal}
      onClose={setOpenIconModal}
      aria-labelledby='Need help Modal'
      aria-describedby='Need help Modal'
      title='Definitions/Examples'
    >
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography fontSize='1.25rem' fontWeight='600'>Matching</Typography>
          <Typography color='#16365f'>
            This constraint allows you to match a specific user, role, branch,
            or tag to another specific user, role, branch, or tag. I few example
            that you would use this constraint for are:
          </Typography>
          <Typography>
            Ex 1: Adam Silver (the client) can only have three certain RBTs This
            is what the Description would look like.
          </Typography>
          <Box
            sx={{
              bgcolor: '#F7F8FB',
              padding: '1rem',
              borderRadius: '0.5rem',
              '& strong': { fontWeight: '500', color: '#4d53e0' },
            }}
          >
            <Typography>
              If the appointment is with <strong>Adam Silver</strong> then it
              must have <strong>Isla-Grace Hopkins</strong> or{' '}
              <strong>Sally Dean</strong> or <strong>Penelope Saenz</strong>
            </Typography>
          </Box>
          <Typography>
            Ex 2. There are a group of therapists that can work with High
            Support clients This is what the description would look like.
          </Typography>
          <Box
            sx={{
              bgcolor: '#F7F8FB',
              padding: '1rem',
              borderRadius: '0.5rem',
              '& strong': { fontWeight: '500', color: '#4d53e0' },
            }}
          >
            <Typography>
              A <strong>Client</strong> tagged{' '}
              <strong>High Severity must</strong> have a <strong>RBT</strong>
            </Typography>
          </Box>
        </Stack>
        <Stack spacing={1}>
          <Typography fontSize='1.25rem' fontWeight='600'>
            Unmatching constraint
          </Typography>
          <Typography color='#16365f'>
            This constraint allows you to unmatch a specific user, role, branch,
            or tag to another specific user, role, branch, or tag. A few example
            that you would use this constraint for are:
          </Typography>
          <Typography>
            Ex 1. BTs cannot work with High severity clients The description
            would look like this.
          </Typography>
          <Box
            sx={{
              bgcolor: '#F7F8FB',
              padding: '1rem',
              borderRadius: '0.5rem',
              '& strong': { fontWeight: '500', color: '#4d53e0' },
            }}
          >
            <Typography>
              If the appointment is with <strong>User1</strong> is{' '}
              <strong>BT</strong> then it <strong>cannot</strong> have a
              <strong>High Severuty client</strong>
            </Typography>
          </Box>
          <Typography>
            Ex 2. You do not want a certain employee working with a certain
            client The description would look like this.
          </Typography>
          <Box
            sx={{
              bgcolor: '#F7F8FB',
              padding: '1rem',
              borderRadius: '0.5rem',
              '& strong': { fontWeight: '500', color: '#4d53e0' },
            }}
          >
            <Typography>
              If the appointment is with <strong>Snow White</strong> then it{' '}
              <strong>cannot</strong> have ____
            </Typography>
          </Box>
        </Stack>
        <Stack spacing={1}>
          <Typography fontSize='1.25rem' fontWeight='600'>
            User to user frequency
          </Typography>
          <Typography color='#16365f'>
            This constraint is going to allow you to limit the amount of clients
            you would like a user, role, tag, or branch to have with another
            user, role, tag, or branch. A few example that you would use this
            constraint for are:
          </Typography>
          <Typography>
            Ex 1. An RBT cannot have more than three clients per day.
          </Typography>
          <Box
            sx={{
              bgcolor: '#F7F8FB',
              padding: '1rem',
              borderRadius: '0.5rem',
              '& strong': { fontWeight: '500', color: '#4d53e0' },
            }}
          >
            <Typography>
              A <strong>RBT</strong> can work each <strong>Client</strong>{' '}
              between <strong>0</strong> and <strong>3</strong> times{' '}
              <strong>per Day</strong>
            </Typography>
          </Box>
          <Typography sx={{ fontStyle: 'italic' }}>
            TIP: The difference between the constraint below and the one above
            is that you can limit the number of clients a tech can have in the
            example above, it may still offer five different sessions with those
            same three clients. With this constraint you can limit the number of
            sessions.
          </Typography>
        </Stack>
        <Stack spacing={1}>
          <Typography fontSize='1.25rem' fontWeight='600'>
            User session frequency
          </Typography>
          <Typography color='#16365f'>
            This constraint is going to allow you to limit the amount of
            sessions you would like a user, role, tag, or branch to have with
            another user, role, tag, or branch. A few example that you would use
            this constraint for are:
          </Typography>
          <Typography>
            Ex 1. An RBT cannot have more than three sessions per day.
          </Typography>
          <Box
            sx={{
              bgcolor: '#F7F8FB',
              padding: '1rem',
              borderRadius: '0.5rem',
              '& strong': { fontWeight: '500', color: '#4d53e0' },
            }}
          >
            <Typography>
              A <strong>RBT</strong> can work each <strong>Client</strong>{' '}
              between <strong>0</strong> and <strong>3</strong> times{' '}
              <strong>per Day</strong>
            </Typography>
          </Box>
        </Stack>
        <Stack spacing={1}>
          <Typography fontSize='1.25rem' fontWeight='600'>
            Time
          </Typography>
          <Typography color='#16365f'>
            This constraint is going to limit the amount of time a user spends
            with another user. This can be limited per day, per week, or per
            session. A few examples for this constraint are:
          </Typography>
          <Typography>
            Ex. 1 An RBT cannot have a session longer than 5 hours
          </Typography>
          <Box
            sx={{
              bgcolor: '#F7F8FB',
              padding: '1rem',
              borderRadius: '0.5rem',
              '& strong': { fontWeight: '500', color: '#4d53e0' },
            }}
          >
            <Typography>
              A <strong>RBT</strong> can work each <strong>Client</strong>{' '}
              between <strong>0</strong> and{' '}
              <strong>5 hours per Session</strong>
            </Typography>
          </Box>
          <Typography>
            Ex. 2 An RBT can work with a High Severity client between 0 and 2
            hours per sessionrs
          </Typography>
          <Box
            sx={{
              bgcolor: '#F7F8FB',
              padding: '1rem',
              borderRadius: '0.5rem',
              '& strong': { fontWeight: '500', color: '#4d53e0' },
            }}
          >
            <Typography>
              A <strong>RBT</strong> can work each <strong>Client</strong>{' '}
              tagged <strong>High Severity</strong> between <strong>0</strong>{' '}
              and <strong>2 hours per Session</strong>
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </CustomModal>
  );
};

export default CustomConstarintExampleModal;
