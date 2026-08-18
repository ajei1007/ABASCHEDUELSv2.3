import { CustomIconButton } from './ParameterButtons';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

export const OpenIconButton = ({
  sidebarOpen,
  toggleSidebarOpen,
  disabled = false,
}) => {
  return (
    <CustomIconButton
      name={`${sidebarOpen ? 'Close' : 'Open'} Sidebar`}
      onClick={() => toggleSidebarOpen()}
      id='ToggleSideBarControlButtonGroup'
      className={`toggle-sidebar-button`}
      style={{
        zIndex: '1',
        background: '#fff',
        borderRadius: '8px',
        transition: 'right 0.2s',
      }}
      disabled={disabled}
    >
      {sidebarOpen ? (
        <ChevronRightIcon
          style={{ color: sidebarOpen ? '#4d53e0' : 'inherit' }}
        />
      ) : (
        <ChevronLeftIcon
          style={{ color: sidebarOpen ? '#4d53e0' : 'inherit' }}
        />
      )}
    </CustomIconButton>
  );
};
