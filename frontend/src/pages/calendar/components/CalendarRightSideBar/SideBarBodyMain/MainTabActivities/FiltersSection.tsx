import { Box, Grow, Typography } from '@mui/material';
import CustomCheckboxBlock from 'components/CustomCheckboxBlock/CustomCheckboxBlock';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { handleSettingValues } from 'store/actions/settingsActions';

const FiltersSection = ({
  updateFilter,
  updateAllFilters,
  cancel,
  filters,
  type,
  disabled = false,
  animationTimeout = 1000,
}: {
  updateFilter: (filter: { id: string; label: string }) => void;
  updateAllFilters: (isChecked: boolean) => void;
  cancel?: boolean;
  filters?: {
    value: string;
    label: string;
    type?: string;
    color?: string;
    className?: string;
  }[];
  type: 'activity' | 'location';
  disabled?: boolean;
  animationTimeout?: number;
}) => {
  const dispatch = useAppDispatch();
  const storeSelectedCalendars = useAppSelector(
    (state) => state.calendar.selectedCalendars,
  );
  const showCancellations = useAppSelector(
    (state) => !state.settings.settingValues.hideCancelations,
  );
  return (
    <div className='sidebar-wrapper'>
      <Grow
        in={true}
        style={{ transformOrigin: '0 0 0' }}
        timeout={animationTimeout}
      >
        <Typography margin='0.5rem 0 0.5rem 0' fontSize={'0.85rem'}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Typography>
      </Grow>
      <Grow
        in={true}
        style={{ transformOrigin: '0 0 0' }}
        timeout={animationTimeout}
      >
        <Box>
          <CustomCheckboxBlock
            label='View All'
            color='#43bc13'
            checked={
              (storeSelectedCalendars as any)[type].length === 0 &&
              showCancellations
            }
            disabled={disabled}
            onChange={(e) => {
              const isChecked = e.target.checked;
              dispatch(updateAllFilters(isChecked));
              dispatch(handleSettingValues('hideCancelations', !isChecked));
            }}
            dataQa='sidebar-location-checkbox'
          />
        </Box>
      </Grow>
      {cancel && (
        <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={1000}>
          <Box>
            <CustomCheckboxBlock
              color='#ff6961'
              label='Cancellations'
              checked={showCancellations}
              disabled={disabled}
              onChange={(e) => {
                dispatch(
                  handleSettingValues('hideCancelations', !e.target.checked),
                );
              }}
              dataQa='sidebar-location-checkbox'
            />
          </Box>
        </Grow>
      )}
      {Array.isArray(filters) && filters?.length > 0 && (
        <div className='calendar-events-filter'>
          {[...filters]
            .sort((a, b) => a.label.localeCompare(b.label))
            .map((filter, index) => (
              <Grow
                key={index}
                in={filters?.length > 0 ? true : false}
                style={{ transformOrigin: '0 0 0' }}
                timeout={100 * index + 1 + animationTimeout}
              >
                <Box>
                  <CustomCheckboxBlock
                    key={filter.value}
                    label={filter.label}
                    color={filter.color}
                    checked={
                      (storeSelectedCalendars as any)[type].find(
                        (e: any) => e.id === filter.value,
                      ) === undefined
                    }
                    disabled={disabled}
                    onChange={(e) => {
                      dispatch(
                        updateFilter({
                          id: filter.value,
                          label: filter.label,
                        }),
                      );
                    }}
                  />
                </Box>
              </Grow>
            ))}
        </div>
      )}
    </div>
  );
};

export default FiltersSection;
