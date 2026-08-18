import { Box } from '@mui/material';

interface INpsSurveyRatingButtonProps {
  value: number;
  isSelected: boolean;
  onClick: () => void;
}

const NpsSurveyRatingButton = ({
  value,
  isSelected,
  onClick,
}: INpsSurveyRatingButtonProps) => {
  const getButtonColor = () => {
    if (!isSelected)
      return {
        background: '#f3f4f6',
        color: '#374151',
        '&:hover': { background: '#e5e7eb' },
      };
    if (value >= 9) return { background: '#22c55e', color: '#fff' };
    if (value >= 7) return { background: '#eab308', color: '#fff' };
    return { background: '#ef4444', color: '#fff' };
  };

  const getRingColor = () => {
    if (!isSelected) return '';
    if (value >= 9) return '0 0 0 4px #4ade80'; // green-400
    if (value >= 7) return '0 0 0 4px #fde047'; // yellow-400
    return '0 0 0 4px #f87171'; // red-400
  };

  const getEmoji = () => {
    const emojis = [
      '😡',
      '😠',
      '😤',
      '😒',
      '😕',
      '😐',
      '🙂',
      '😊',
      '😃',
      '😍',
      '🤩',
    ];
    return emojis[value];
  };

  return (
    <Box
      component='button'
      onClick={onClick}
      sx={{
        width: '100%',
        aspectRatio: '1',
        borderRadius: 2,
        fontWeight: 600,
        fontSize: '1.5rem',
        transition: 'all 0.2s',
        transform: 'none',
        outline: 'none',
        boxShadow: isSelected ? getRingColor() : undefined,
        border: 'none',
        ...getButtonColor(),
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: isSelected
            ? getRingColor()
            : '0 0 0 2px #3b82f6, 0 0 0 4px #fff',
          ...getButtonColor()['&:hover'],
        },
        '&:focus': {
          // boxShadow: '0 0 0 2px #3b82f6, 0 0 0 4px #fff',
        },
      }}
    >
      {getEmoji()}
    </Box>
  );
};

export default NpsSurveyRatingButton;
