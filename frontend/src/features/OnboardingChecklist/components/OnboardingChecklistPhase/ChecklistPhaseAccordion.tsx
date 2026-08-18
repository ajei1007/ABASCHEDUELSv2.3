import { type FC } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  type SxProps,
  type Theme,
} from '@mui/material';

export interface IChecklistPhaseAccordionProps {
  /** Whether the accordion is expanded */
  isExpanded?: boolean;
  /** Function to toggle the accordion expansion */
  toggleExpanded?: () => void;
  /** Header element to display in the accordion summary */
  headerElement: React.ReactNode;
  /** Content element to display in the accordion details */
  contentElement: React.ReactNode;
}

// Extracted styles for better performance and readability
const accordionStyles: SxProps<Theme> = {
  borderRadius: '8px',
  backgroundColor: '#fff',
  border: '1px solid #E5E7EB',
  boxShadow: 'none',
  my: '0!important',
};

const accordionSummaryContentStyles: SxProps<Theme> = {
  m: '0!important',
};

const accordionSummaryRootStyles: SxProps<Theme> = {
  px: 0,
  height: 'auto!important',
  minHeight: 'auto!important',
};

const accordionDetailsStyles: SxProps<Theme> = {
  p: 0,
};

const ChecklistPhaseAccordion: FC<IChecklistPhaseAccordionProps> = ({
  headerElement,
  contentElement,
  isExpanded = false,
  toggleExpanded,
}) => {
  return (
    <Accordion
      expanded={isExpanded}
      slotProps={{
        heading: {
          component: 'div',
        },
        root: {
          sx: accordionStyles,
        },
      }}
      onChange={toggleExpanded}
    >
      <AccordionSummary
        slotProps={{
          content: {
            component: 'div',
            sx: accordionSummaryContentStyles,
          },
          root: {
            component: 'div',
            sx: accordionSummaryRootStyles,
          },
        }}
      >
        {headerElement}
      </AccordionSummary>
      <AccordionDetails sx={accordionDetailsStyles}>
        {contentElement}
      </AccordionDetails>
    </Accordion>
  );
};

ChecklistPhaseAccordion.displayName = 'ChecklistPhaseAccordion';

export default ChecklistPhaseAccordion;
