import { Typography } from '@mui/material';

const SectionTitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <Typography
      color='#16365f'
      fontSize='1rem'
      fontWeight='600'
      marginBottom='1rem'
    >
      {children}
    </Typography>
  );
};

SectionTitle.displayName = 'SectionTitle';

export default SectionTitle;
