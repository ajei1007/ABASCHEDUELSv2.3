import type { ChannelMembership } from '@mattermost/types/channels';
import type { UserProfile } from '@mattermost/types/users';

export type TChannelMember = {
  user: UserProfile;
  userId: string;
  fullName: string;
  membership: ChannelMembership;
  isAdmin: boolean;
  isLoading: boolean;
};
