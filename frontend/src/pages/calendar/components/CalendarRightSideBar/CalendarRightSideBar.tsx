import { useEffect, memo, type FC } from 'react';
import { Stack, Fade } from '@mui/material';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import { selectRightSidebarOpen } from 'store/slices/calendarOverlayingPanels';
import { showRightSidebar } from 'store/slices/calendarOverlayingPanels/actions';
import { isOptimizerResultsPreviewModeSelector } from 'store/selectors/optimizerSelectors';
import role_permissions from 'helpers/role_permissions';
import SideBarHead from './SideBarHead';
import SideBarBodyMain from './SideBarBodyMain/SideBarBodyMain';
import SideBarBodyOptimizerResults from './SideBarBodyOptimizerResults';

const CalendarRightSideBar: FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((store) => store.auth.currentUser);
  const isOptimizerResultsPreviewMode = useAppSelector(
    isOptimizerResultsPreviewModeSelector,
  );

  const rightSidebarOpen = useAppSelector(selectRightSidebarOpen);

  useEffect(() => {
    if (isOptimizerResultsPreviewMode) {
      dispatch(showRightSidebar());
    }
  }, [isOptimizerResultsPreviewMode]);

  return (
    <Fade in={true} timeout={1000} style={{ transformOrigin: '0 0 0' }}>
      <Stack
        className={`app-calendar-sidebar ${rightSidebarOpen && 'show'}`}
        spacing={2}
        height='100%'
        data-qa='sidebar-container'
      >
        {role_permissions(currentUser, 'createEvent') && <SideBarHead />}
        <Stack
          className={`app-calendar-sidebar-down ${rightSidebarOpen && 'show'}`}
          height='100%'
          overflow='hidden'
        >
          {!isOptimizerResultsPreviewMode ? (
            <SideBarBodyMain />
          ) : (
            <SideBarBodyOptimizerResults />
          )}
        </Stack>
      </Stack>
    </Fade>
  );
};

CalendarRightSideBar.displayName = 'CalendarRightSideBar';

export default memo(CalendarRightSideBar);
