import { MaterialReactTable } from 'material-react-table';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import { filter, isEqual } from 'lodash';
import { Grid2 as Grid, Stack, Typography } from '@mui/material';
import moment from 'moment';
import CustomDateRangePicker from 'components/CustomDateRangePicker/CustomDateRangePicker';
import isDateRangeMoreThanTheLimit from 'utils/isDateRangeMoreThanTheLimit';
import { toast } from 'react-toastify';
import { useLatestCallback } from 'hooks/useLatestCallback';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import CustomInput from 'components/CustomInputModal/CustomInput';

const formatDateRange = (date) => {
  return moment(date).format('YYYY-MM-DD');
};

const hasVal = (value) => value !== undefined || value !== null || value !== '';

// TODO
export const EventStatuses = {
  CONFIRMED: 'Confirmed',
  PENDING_CONFIRM: 'Pending Confirmation',
  PENDING_CANCEL: 'Pending Cancelation',
  CANCELED: 'Canceled',
};
Object.freeze(EventStatuses);
export const COLORS = {
  primary: '#3D5AF1',
  danger: '#d32f2f',
  warning: '#ed6c02',
  success: '#2e7d32',
};
export const APPOINTMENT_COLORS = {
  new: COLORS.primary,
  confirmed: COLORS.success,
  pending: COLORS.warning,
  canceled: COLORS.danger,
};

export const eventStatusColor = (status) => {
  let backgroundColor = APPOINTMENT_COLORS.new;
  switch (status) {
    case EventStatuses.PENDING_CANCEL:
      backgroundColor = APPOINTMENT_COLORS.pending;
      break;
    case EventStatuses.CANCELED:
      backgroundColor = APPOINTMENT_COLORS.canceled;
      break;
    case EventStatuses.CONFIRMED:
      backgroundColor = APPOINTMENT_COLORS.confirmed;
      break;
    default:
      backgroundColor = APPOINTMENT_COLORS.pending;
      break;
  }
  return backgroundColor;
};

const DEFAULT_SELECT_FIELDS = [];
const CustomTable = ({
  columns,
  rows,
  loading = false,
  fetchData,
  count,
  expandedInitially = false,
  enableColumnFilters = true,
  enabledDateRange = false,
  type = '',
  isExpandable = false,
  selectFields = DEFAULT_SELECT_FIELDS,
  searchFields = [],
  defaultColumnFilters = [],
}) => {
  const isFirstRender = useRef(true);
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = useMemo(() => {
    return queryString.parse(location.search);
  }, [location.search]);

  const [cachedType, setCachedType] = useState('');
  const initialPagination = useMemo(() => {
    return {
      pageIndex: queryParams.page ? parseInt(queryParams.page, 10) - 1 : 0,
      pageSize: queryParams.limit ? parseInt(queryParams.limit, 10) : 10,
    };
  }, [queryParams.page, queryParams.limit]);

  const initialSorting = useMemo(() => {
    return queryParams.sort && queryParams.field
      ? [
          {
            id: queryParams.field,
            desc: queryParams.sort === 'desc',
          },
        ]
      : [];
  }, [queryParams]);

  const initialColumnFilters = useMemo(() => {
    // Exclude known parameters
    const filterParams = { ...queryParams };
    delete filterParams.page;
    delete filterParams.limit;
    delete filterParams.field;
    delete filterParams.sort;

    for (const item of defaultColumnFilters) {
      if (!(item.id in filterParams)) {
        filterParams[item.id] = item.value;
      }
    }

    return Object.keys(filterParams).map((key) => ({
      id: key,
      value: filterParams[key],
    }));
  }, [queryParams, defaultColumnFilters]);

  const [pagination, setPagination] = useState(initialPagination);
  const [sorting, setSorting] = useState(initialSorting);

  const [columnFilters, setColumnFilters] = useState(initialColumnFilters);
  const [globalFilter, setGlobalFilter] = useState('');

  const initialDateRange = useMemo(() => {
    return {
      start: queryParams.start
        ? moment(queryParams.start).startOf('day').toDate()
        : moment().startOf('day').toDate(),
      end: queryParams.end
        ? moment(queryParams.end).startOf('day').toDate()
        : moment().startOf('day').toDate(),
    };
  }, [queryParams]);
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [debouncedSearchFields, setDebouncedSearchFields] =
    useState(searchFields);

  useEffect(() => {
    if (searchFields?.length) {
      const handler = setTimeout(() => {
        setDebouncedSearchFields(searchFields);
      }, 500);

      // Cleanup on unmount or when `searchFields` changes
      return () => {
        clearTimeout(handler);
      };
    }
  }, [searchFields]);

  const handleFilterChangeEffect = useLatestCallback(
    async ({
      pagination,
      sorting,
      columnFilters,
      type,
      selectFields,
      dateRange,
      debouncedSearchFields,
    }) => {
      const isTableChanged = cachedType !== type;

      /* URL Synchronization */
      const newParams = {
        page:
          isTableChanged && cachedType ? '1' : String(pagination.pageIndex + 1),
        limit: String(pagination.pageSize),
      };

      // Sorting
      if (sorting.length > 0) {
        newParams.field = sorting[0].id;
        newParams.sort = sorting[0].desc ? 'desc' : 'asc';
      }

      // Filters
      if (columnFilters?.length) {
        columnFilters.forEach((filter) => {
          newParams[filter.id] = filter.value;
        });
      }
      //Select
      if (selectFields?.length > 0) {
        selectFields.forEach((sField) => {
          if (sField?.value?.value) {
            if (hasVal(sField.value.value)) {
              newParams[sField.name] = sField.value.value;
            }
          }
        });
      }
      //Date
      if (enabledDateRange) {
        newParams.start = formatDateRange(dateRange.start);
        newParams.end = formatDateRange(dateRange.end);
      }
      /* SEARCH */
      if (debouncedSearchFields?.length) {
        debouncedSearchFields.forEach((sField) => {
          if (sField?.value) {
            if (hasVal(sField.value)) {
              newParams[sField.name] = sField.value;
            }
          }
        });
      }

      const currentParams = queryString.parse(location.search);

      // Normalize parameters
      Object.keys(newParams).forEach((key) => {
        if (newParams[key] === undefined || newParams[key] === null) {
          delete newParams[key];
        }
      });

      Object.keys(currentParams).forEach((key) => {
        if (currentParams[key] === undefined || currentParams[key] === null) {
          delete currentParams[key];
        }
      });

      setCachedType(type);
      if (!isEqual(currentParams, newParams)) {
        const search = queryString.stringify(newParams);
        navigate({
          pathname: location.pathname,
          search: `?${search}`,
        });
      }
      /*  */

      const filters = {
        page: isTableChanged && cachedType ? 1 : pagination.pageIndex + 1,
        limit: pagination.pageSize,
      };

      // Sorting
      if (sorting?.length) {
        filters.field = sorting[0].id;
        filters.sort = sorting[0].desc ? 'desc' : 'asc';
      }

      // Filters
      if (columnFilters?.length) {
        columnFilters.forEach((filter) => {
          filters[filter.id] = filter.value;
        });
      }

      //Select
      if (selectFields?.length > 0) {
        selectFields.forEach((sField) => {
          if (sField?.value?.value) {
            if (hasVal(sField.value.value)) {
              filters[sField.name] = sField.value.value;
            }
          }
        });
      }
      //Date
      if (enabledDateRange) {
        filters.start = formatDateRange(dateRange.start);
        filters.end = formatDateRange(dateRange.end);
      }

      /* SEARCH */
      if (debouncedSearchFields?.length > 0) {
        debouncedSearchFields.forEach((sField) => {
          if (sField?.value) {
            if (hasVal(sField.value)) {
              filters[sField.name] = sField.value;
            }
          }
        });
      }
      setCachedType(type);
      await fetchData(filters);
      isFirstRender.current = false;
    },
  );

  // Fetch data when pagination or sorting changes
  useEffect(() => {
    handleFilterChangeEffect({
      pagination,
      sorting,
      columnFilters,
      type,
      selectFields,
      dateRange,
      debouncedSearchFields,
    });
  }, [
    pagination,
    sorting,
    columnFilters,
    type,
    selectFields,
    dateRange,
    handleFilterChangeEffect,
    debouncedSearchFields,
  ]);

  const handleDateRange = (startDate, endDate) => {
    if (isDateRangeMoreThanTheLimit(startDate, endDate, 31)) {
      return toast.error('Date range cannot be more than 31 days!');
    }
    setDateRange({ start: startDate, end: endDate });
  };

  return (
    <>
      {/* Table */}
      <MaterialReactTable
        columns={columns}
        data={rows}
        rowCount={Number(count)}
        // Pagination
        manualPagination
        enablePagination={true}
        onPaginationChange={(updater) => {
          const nextState = updater(pagination);
          if (!isFirstRender.current) {
            setPagination(nextState);
          }
        }}
        // States
        initialState={{
          showColumnFilters: true,
          density: 'compact',
          expanded: expandedInitially,
          columnPinning: {
            left: ['mrt-row-expand', 'id', 'name', 'firstName', 'lastName'],
          },
        }}
        state={{
          columnFilters,
          sorting,
          globalFilter,
          pagination,
          showSkeletons: loading,
          // showProgressBars: loading,
        }}
        // Sorting
        manualSorting
        onSortingChange={setSorting}
        // Filters
        manualFiltering
        onColumnFiltersChange={setColumnFilters}
        onGlobalFilterChange={setGlobalFilter}
        enableGlobalFilter={false}
        enableColumnFilters={enableColumnFilters}
        //
        enableColumnActions={false}
        enableColumnPinning={true}
        enableDensityToggle={true}
        // Expandable
        renderDetailPanel={
          isExpandable
            ? ({ row }) => {
                const users = row.original.users;
                if (users?.length) {
                  return (
                    <Stack paddingLeft={'60px'} spacing={2}>
                      {users.map((user) => (
                        <Stack flexDirection='row' fontSize={'14px'}>
                          <Typography
                            fontWeight={600}
                            fontSize={'14px'}
                            width='180px'
                          >
                            {user?.firstName} {user?.lastName ?? ''}
                          </Typography>
                          <Stack flexDirection='row' columnGap={2}>
                            <Typography fontSize={'14px'}>Status: </Typography>
                            <Typography
                              fontSize={'14px'}
                              color={eventStatusColor(
                                user?.statusEvent?.status,
                              )}
                            >
                              {user?.statusEvent?.status}
                            </Typography>
                          </Stack>
                        </Stack>
                      ))}
                    </Stack>
                  );
                }
                return '';
              }
            : null
        }
        // Styles
        muiTableProps={{
          sx: {
            zIndex: 1,
            tableLayout: 'auto', // Allow table rows to grow as needed
            overflowWrap: 'break-word', // Ensure long words wrap within cells
          },
        }}
        muiTableHeadRowProps={{ sx: { boxShadow: 'none' } }}
        muiSkeletonProps={{ sx: { minHeight: '30px' } }}
        muiTableHeadProps={{
          sx: () => ({
            '& th': {
              border: 'none',
              boxShadow: 'none',
              color: '#16365f',
              fontWeight: '600',
              fontSize: '0.875rem',
            },
            '& th[data-pinned]:before': {
              display: 'none',
            },

            '.MuiIconButton-root': {
              padding: '0.5rem !important',
            },
            '.MuiIconButton-root svg': {
              height: '0.75rem !important',
              width: '0.75rem !important',
            },
          }),
        }}
        muiTableBodyProps={{
          sx: () => ({
            '& td': {
              border: 'none',
              color: '#16365f',
              boxShadow: 'none !important',
              whiteSpace: 'normal', // Allow text to wrap to a new line
              wordWrap: 'break-word', // Ensure long words wrap within cells
            },
            '& tr': {
              transition: 'none',
            },
            '& tr:nth-of-type(odd)': {
              backgroundColor: '#F7F8FB !important',
              boxShadow: 'none',
              '& td': {
                backgroundColor: '#F7F8FB',
                boxShadow: 'none',
              },
            },
            '& tr td[data-pinned]:before': {
              display: 'none',
            },
          }),
        }}
        muiTableBodyRowProps={{
          hover: true,
          sx: {
            '&:hover': {
              '& *': { color: 'white' },
              '& td': { backgroundColor: '#4d53e0 !important' },
            },
          },
        }}
        muiPaginationProps={{
          rowsPerPageOptions: [10, 25, 50, 100],
          showFirstButton: false,
          showLastButton: false,
        }}
        muiSelectCheckboxProps={{
          sx: {
            '& .MuiFormControlLabel-label': {
              lineHeight: '14px',
            },
          },
        }}
        {...((enabledDateRange ||
          (selectFields && selectFields.length > 0)) && {
          renderTopToolbarCustomActions: ({ table }) => {
            return (
              <Grid
                container
                spacing={2}
                columns={{ sm: 12, md: 12 }}
                sx={{
                  mb: '1rem',
                  mt: 0,
                  alignItems: 'flex-end',
                  direction: 'row',
                  overflow: 'visible', // Allow the dropdown to overflow if needed
                  width: '100%',
                  marginTop: '0.5rem',
                }}
                alignItems='flex-end' // Aligns items vertically in the center
                direction='row' // Ensures that items are aligned horizontally in a row
              >
                {selectFields.length > 0 && (
                  <>
                    {selectFields.map((selectField) => (
                      <Grid
                        key={selectField.name}
                        sx={{ position: 'relative', zIndex: '900' }}
                        size={{
                          sm: 12,
                          md: 2
                        }}>
                        <label htmlFor={selectField.name}>
                          {selectField.label}
                        </label>
                        <CustomSelect
                          isMulti={false}
                          onChange={(val) => selectField.onChange(val)}
                          value={selectField.value}
                          options={selectField.options}
                          name={selectField.name}
                          menuPortalTarget={document.body}
                        />
                      </Grid>
                    ))}
                    {searchFields.length > 0 && (
                      <>
                        {searchFields.map((searchField) => (
                          <Grid
                            key={searchField.name}
                            size={{
                              sm: 12,
                              md: 4
                            }}>
                            <label htmlFor={searchField.name}>
                              {searchField.label}
                            </label>
                            <CustomInput
                              type='text'
                              name={searchField.name}
                              id={searchField.name}
                              value={searchField.value}
                              onChange={(e) =>
                                searchField.onChange(e.target.value)
                              }
                            />
                          </Grid>
                        ))}
                      </>
                    )}
                    {enabledDateRange && (
                      <Grid
                        size={{
                          sm: 12,
                          md: 'auto'
                        }}>
                        <CustomDateRangePicker
                          startDate={dateRange.start}
                          endDate={dateRange.end}
                          onSubmit={handleDateRange}
                        />
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
            );
          },
        })}
        muiTopToolbarProps={{
          sx: {
            '& .MuiBox-root': {
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
            },
          },
        }}
        // muiExpandAllButtonProps={{
        //   sx: {
        //         '&. .MuiIconButton-root': {
        //           svg: {
        //             height: '2rem !important',  // Set the icon height
        //             width: '2rem !important',    // Optionally, set the width for a consistent size
        //           },
        //         }
        //   },
        // }}
      />
    </>
  );
};

export default CustomTable;
