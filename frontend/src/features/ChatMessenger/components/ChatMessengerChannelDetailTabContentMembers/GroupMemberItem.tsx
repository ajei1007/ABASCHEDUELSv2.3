import { useMemo } from 'react';
import { Box, Stack, Typography, CircularProgress } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useChatMessengerChannelDetailModalContext } from '../../context/ChatMessengerChannelDetailModalContext';
import GroupMemberItemMenu from './GroupMemberItemMenu';
import { formatNameInitial } from '../../utils';
import { generateColorsForName } from '../../utils/colors';
import type { TChannelMember } from '../../types';

export interface IGroupMemberItemProps {
  member: TChannelMember;
  yourself?: boolean;
  hasAccessRemoveFromGroup?: boolean;
  hasAcceesMakeAdmin?: boolean;
  onRemoveFromGroup?: (member: TChannelMember) => void;
  onToggleAdmin?: (member: TChannelMember) => void;
}

const GroupMemberItem = ({
  member,
  yourself = false,
  hasAccessRemoveFromGroup = false,
  hasAcceesMakeAdmin = false,
  onRemoveFromGroup = () => {},
  onToggleAdmin = () => {},
}: IGroupMemberItemProps) => {
  const { actionsDisabled } = useChatMessengerChannelDetailModalContext();
  const memberName = member.fullName || 'Unknown Member';
  const colors = useMemo(() => generateColorsForName(memberName), [memberName]);

  return (
    <Box
      display='flex'
      alignItems='center'
      height='50px'
      px={1}
      columnGap={1.5}
      sx={{
        borderRadius: '6px',
        userSelect: 'none',
      }}
    >
      <Box
        sx={{
          height: '40px',
          width: '40px',
          backgroundColor: yourself ? '#ddd' : colors.background,
          borderRadius: '100%',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: yourself ? '#666' : colors.foreground,
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
          border: '1px solid #bbb',
          borderColor: yourself ? '#bbb' : colors.background,
          fontWeight: '600',
          lineHeight: 1.2,
        }}
      >
        {yourself ? (
          <PersonIcon
            sx={{
              fontSize: '1.75rem',
            }}
          />
        ) : (
          formatNameInitial(memberName)
        )}
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          fontSize: '1rem!important',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        <Typography
          sx={{
            fontSize: '1rem!important',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {yourself ? `You (${memberName})` : memberName}
        </Typography>
      </Box>
      <Stack flexDirection='row' alignItems='center' columnGap={1} ml='auto'>
        {member.isAdmin && (
          <Typography
            sx={{
              fontSize: '0.75rem!important',
              color: '#666',
            }}
          >
            Admin
          </Typography>
        )}
        {member.isLoading && (
          <CircularProgress
            size='1rem'
            sx={{
              ml: '5px',
              mr: '1px',
            }}
          />
        )}
        {!yourself && (
          <GroupMemberItemMenu
            hasAccessRemoveFromGroup={hasAccessRemoveFromGroup}
            hasAccessMakeAdmin={hasAcceesMakeAdmin}
            isAdmin={member.isAdmin}
            isDisabled={member.isLoading || actionsDisabled}
            onRemoveFromGroup={() => onRemoveFromGroup(member)}
            onToggleAdmin={() => onToggleAdmin(member)}
          />
        )}
      </Stack>
    </Box>
  );
};

export default GroupMemberItem;
