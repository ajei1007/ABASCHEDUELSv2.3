/* eslint-disable react-hooks/exhaustive-deps */
import { MaterialReactTable } from 'material-react-table';
import { useCallback, useEffect, useState } from 'react';
import { Grid2 as Grid, Stack, Typography } from '@mui/material';
import CustomSelect from '../../components/CustomSelect/CustomSelect';
import { debounce } from 'lodash';
import CustomInput from '../CustomInputModal/CustomInput';
import CustomDateRangePicker from 'components/CustomDateRangePicker/CustomDateRangePicker';
import moment from 'moment';
import { toast } from 'react-toastify';
import isDateRangeMoreThanTheLimit from 'utils/isDateRangeMoreThanTheLimit';

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

const CustomTable = ({
  columns,
  rows,
  loading = false,
  fetchData,
  count,
  searchFields = [],
  selectFields = [],
  type = '',
  enabledDateRange = false,
  isExpandable = false,
  expandedInitially = false,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedField, setSelectedField] = useState(
    searchFields.length ? searchFields[0] : null,
  );
  const [sort, setSort] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [dateRange, setDateRange] = useState({
    start: moment().startOf('day').toDate(),
    end: moment().startOf('day').toDate(),
  });

  useEffect(() => {
    initFetch();
  }, [type]);

  const initFetch = () => {
    const initFilter = {
      page: 1,
      limit: 10,
    };
    if (selectFields?.length > 0) {
      selectFields.forEach((sField) => {
        if (sField?.value?.value) {
          if (hasVal(sField.value.value)) {
            initFilter[sField.name] = sField.value.value;
          }
        }
      });
    }
    if (enabledDateRange) {
      initFilter.start = formatDateRange(dateRange.start);
      initFilter.end = formatDateRange(dateRange.end);
    }
    fetchData(initFilter);
    setSearchText('');
    setPagination({
      pageIndex: 0,
      pageSize: 10,
    });
  };

  useEffect(() => {
    if (searchFields && searchFields.length) {
      setSelectedField(searchFields[0]);
    }
  }, [searchFields, type]);

  const debouncePagination = useCallback(
    debounce((filterObj) => fetchData(filterObj), 500),
    [selectedField, type],
  );

  const handleChangePagination = (newPagination) => {
    let filterObj = {
      page: newPagination.pageIndex + 1,
      limit: newPagination.pageSize,
    };
    if (sort.length) {
      filterObj = {
        ...filterObj,
        field: sort[0]?.id,
        sort: sort[0]?.desc ? 'desc' : 'asc',
      };
    }
    if (enabledDateRange) {
      filterObj.start = formatDateRange(dateRange.start);
      filterObj.end = formatDateRange(dateRange.end);
    }
    if (selectedField) {
      filterObj[selectedField.value] = searchText;
    }
    if (selectFields?.length > 0) {
      selectFields.forEach((sField) => {
        if (hasVal(sField.value.value)) {
          filterObj[sField.name] = sField.value.value;
        }
      });
    }
    debouncePagination(filterObj);
  };

  const handleChangeSearchField = (field) => {
    setSelectedField(field);
    if (searchText) {
      setPagination({
        pageIndex: 0,
        pageSize: 10,
      });
      let filterObj = {
        page: 1,
        limit: 10,
      };
      if (sort.length) {
        filterObj = {
          ...filterObj,
          field: sort[0]?.id,
          sort: sort[0]?.desc ? 'desc' : 'asc',
        };
      }
      if (selectFields?.length > 0) {
        selectFields.forEach((sField) => {
          if (hasVal(sField.value.value)) {
            filterObj[sField.name] = sField.value.value;
          }
        });
      }
      if (enabledDateRange) {
        filterObj.start = formatDateRange(dateRange.start);
        filterObj.end = formatDateRange(dateRange.end);
      }
      filterObj[field.value] = searchText;
      fetchData(filterObj);
    }
  };

  const handleChangeSelectField = (name, field) => {
    setPagination({
      pageIndex: 0,
      pageSize: 10,
    });
    let filterObj = {
      page: 1,
      limit: 10,
    };
    if (sort.length) {
      filterObj = {
        ...filterObj,
        field: sort[0]?.id,
        sort: sort[0]?.desc ? 'desc' : 'asc',
      };
    }
    if (enabledDateRange) {
      filterObj.start = formatDateRange(dateRange.start);
      filterObj.end = formatDateRange(dateRange.end);
    }
    if (selectedField) {
      filterObj[selectedField.value] = searchText;
    }
    selectFields.forEach((sField) => {
      if (name === sField.name) {
        if (hasVal(field.value)) {
          filterObj[sField.name] = field.value;
        } else {
          delete filterObj[sField.name];
        }
      } else {
        if (hasVal(sField.value.value)) {
          filterObj[sField.name] = sField.value.value;
        }
      }
    });
    fetchData(filterObj);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    setPagination({
      pageIndex: 0,
      pageSize: 10,
    });
    updateDebouncedSearchText(value);
  };

  const handleSort = (newSort) => {
    let filterObj = {
      page: 1,
      limit: 10,
    };
    if (selectedField && searchText) {
      filterObj[selectedField.value] = searchText;
    }
    if (selectFields?.length > 0) {
      selectFields.forEach((sField) => {
        if (hasVal(sField.value.value)) {
          filterObj[sField.name] = sField.value.value;
        }
      });
    }
    if (newSort.length) {
      filterObj = {
        ...filterObj,
        field: newSort[0]?.id,
        sort: newSort[0]?.desc ? 'desc' : 'asc',
      };
    }
    if (enabledDateRange) {
      filterObj.start = formatDateRange(dateRange.start);
      filterObj.end = formatDateRange(dateRange.end);
    }
    fetchData(filterObj);
  };

  const handleDateRange = (sDate, eDate) => {
    if (isDateRangeMoreThanTheLimit(sDate, eDate, 31)) {
      return toast.error('Date range cannot be more than 31 days!');
    }

    setDateRange({
      start: sDate,
      end: eDate,
    });
    setPagination({
      pageIndex: 0,
      pageSize: 10,
    });
    let filterObj = {
      page: 1,
      limit: 10,
    };
    if (selectedField && searchText) {
      filterObj[selectedField.value] = searchText;
    }
    if (selectFields?.length > 0) {
      selectFields.forEach((sField) => {
        if (hasVal(sField.value.value)) {
          filterObj[sField.name] = sField.value.value;
        }
      });
    }
    if (sort.length) {
      filterObj = {
        ...filterObj,
        field: sort[0]?.id,
        sort: sort[0]?.desc ? 'desc' : 'asc',
      };
    }
    filterObj.start = formatDateRange(sDate);
    filterObj.end = formatDateRange(eDate);

    fetchData(filterObj);
  };

  const updateDebouncedSearchText = useCallback(
    debounce((text) => {
      let filterObj = {
        page: 1,
        limit: 10,
      };
      if (sort.length) {
        filterObj = {
          ...filterObj,
          field: sort[0]?.id,
          sort: sort[0]?.desc ? 'desc' : 'asc',
        };
      }
      if (enabledDateRange) {
        filterObj.start = formatDateRange(dateRange.start);
        filterObj.end = formatDateRange(dateRange.end);
      }
      if (selectedField) {
        filterObj[selectedField.value] = text;
      }
      if (selectFields?.length > 0) {
        selectFields.forEach((sField) => {
          if (hasVal(sField.value.value)) {
            filterObj[sField.name] = sField.value.value;
          }
        });
      }
      fetchData(filterObj);
    }, 500),
    [selectedField, sort, selectFields, dateRange],
  );

  return (
    <>
      {/* Filter */}
      {((searchFields && searchFields.length > 0) ||
        (selectFields && selectFields.length > 0)) && (
        <Grid
          container
          spacing={2}
          marginTop='0.5rem'
          columns={{ sm: 12, md: 12 }}
          sx={{ mb: '1rem', mt: 0 }}
          alignItems='flex-end'
        >
          {searchFields && searchFields.length > 0 && (
            <>
              <Grid
                size={{
                  sm: 12,
                  md: 2
                }}>
                <label htmlFor='selectedField'>Field</label>
                <CustomSelect
                  isMulti={false}
                  onChange={handleChangeSearchField}
                  value={selectedField}
                  options={searchFields}
                  name={type || 'select'}
                />
              </Grid>
              <Grid
                size={{
                  sm: 12,
                  md: 4
                }}>
                <label htmlFor='filterValue'>Contains</label>
                <CustomInput
                  type='text'
                  name='filterValue'
                  id='filterValue'
                  value={searchText}
                  onChange={handleChange}
                />
              </Grid>
            </>
          )}
          {selectFields.length > 0 && (
            <>
              {selectFields.map((selectField) => (
                <Grid
                  key={selectField.name}
                  size={{
                    sm: 12,
                    md: 3
                  }}>
                  <label htmlFor={selectField.name}>{selectField.label}</label>
                  <CustomSelect
                    isMulti={false}
                    onChange={(val) => {
                      handleChangeSelectField(selectField.name, val);
                      selectField.onChange(val);
                    }}
                    value={selectField.value}
                    options={selectField.options}
                    name={selectField.name}
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
        </Grid>
      )}
      {/* Table */}
      <MaterialReactTable
        columns={columns}
        data={rows}
        manualPagination
        onPaginationChange={(updater) => {
          const nextState = updater(pagination);
          setPagination(nextState);
          handleChangePagination(nextState);
        }}
        enablePagination={true}
        state={{ pagination, showSkeletons: loading, sorting: sort }}
        rowCount={Number(count)}
        enableColumnActions={false}
        enableColumnFilters={false}
        enableHiding={false}
        manualSorting
        onSortingChange={(updater) => {
          const nextState = updater(sort);
          setSort(nextState);
          handleSort(nextState);
        }}
        enableColumnPinning={true}
        initialState={{
          expanded: expandedInitially,
          columnPinning: {
            left: ['mrt-row-expand', 'id', 'name', 'firstName', 'lastName'],
          },
        }}
        enableTopToolbar={false}
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
        // Props
        muiTableProps={{ sx: { tableLayout: 'fixed' } }}
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
          }),
        }}
        muiTableBodyProps={{
          sx: () => ({
            '& td': {
              border: 'none',
              color: '#16365f',
              boxShadow: 'none !important',
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
      />
    </>
  );
};

export default CustomTable;
