import { IconButton, Tooltip } from '@mui/material';

interface LabelTooltipProps {
  title: string;
  icon: React.ReactElement;
}
export const LabelTooltip: React.FC<LabelTooltipProps> = ({ title, icon }) => {
  return (
    <Tooltip title={title} placement='top' arrow>
      <IconButton style={{ padding: 0, marginLeft: '4px' }}>{icon}</IconButton>
    </Tooltip>
  );
};
