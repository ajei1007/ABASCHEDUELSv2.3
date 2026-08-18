/* eslint-disable react-hooks/exhaustive-deps */
import actions from 'store/actions/groupings/groupingsListActions';
import React, { useMemo } from 'react';
import { useAppDispatch } from 'store/hooks';
import { useNavigate } from 'react-router';
import Widget from 'components/Widget/Widget';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';
import { Chip, Stack, Tooltip, IconButton } from '@mui/material';
import role_permissions from 'helpers/role_permissions';
import CustomButton from 'components/Button';
import { Link } from 'react-router-dom';
import TableDeleteModal from 'components/TableDeleteModal/TableDeleteModal';
import ExportTableButton from 'components/ExportTableButton/ExportTableButton';
import axios from 'axios';
import { toast } from 'react-toastify';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DynamicTable from 'components/Table/NewTable/DynamicTable';

const GroupingsTable = () => {
  const currentUser = useTypedSelector((store) => store.auth.currentUser);
  const loading = useTypedSelector((store) => store.groupings.list.loading);
  const rows = useTypedSelector((store) => store.groupings.list.rows);
  const count = useTypedSelector((store) => store.groupings.list.count);
  const modalOpen = useTypedSelector((store) => store.groupings.list.modalOpen);
  const idToDelete = useTypedSelector(
    (store) => store.groupings.list.idToDelete,
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const actionFormatter = (cell: string) => {
    return (
      <ActionFormatter
        editPermissionType='editConstraint'
        deletePermissionType='deleteConstraint'
        editEvent={() => navigate(`/admin/groupings/${cell}/edit`)}
        deleteEvent={(event: React.MouseEvent) => openModal(event, cell)}
      />
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: '',
        Cell: ({ renderedCellValue }: { renderedCellValue: any }) => {
          return actionFormatter(renderedCellValue);
        },
        size: 80,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        enableColumnFilter: true,
      },
      // {
      //   accessorFn: (row: any) => row.group,
      //   header: 'Required',
      //   enableSorting: false,
      //   Cell: (row:any) => {
      //     return <CustomSwitch name='check' checked={false} onChange={() => console.log('checked')} />
      //   }
      // },
      // {
      //   accessorKey: 'min',
      //   header: 'Min',
      //   size: 80,
      // },
      // {
      //   accessorKey: 'max',
      //   header: 'Max',
      //   size: 80,
      // },
      {
        accessorFn: (row: any) => row.roles1?.name,
        id: 'roles1',
        header: 'Roles',
        Header: ({ column }: any) => {
          return (
            <div style={{display: 'flex', alignItems: 'center'}}>
              <span
                style={{
                  whiteSpace: 'nowrap',
                }}
              >
                {column.columnDef.header}
              </span>
              <Tooltip
                title='Add the roles that this group will apply to. Ex: Teams would be Clients, RBTs, BTs, and BCBAs. Employee Certifications would just be employees'
                arrow
                placement='top-start'
              >
                <IconButton>
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
        Cell: (row: any) => {
          const data = row.row.original?.roles1;
          if (data && data?.length > 0) {
            return (
              <>
                {data.map((x: any) => (
                  <Chip
                    label={x.name}
                    key={x.id}
                    component='a'
                    variant='outlined'
                    href={`/admin/roles/${x.id}`}
                    clickable
                  />
                ))}
              </>
            );
          }
        },
      },
      // {
      //   accessorFn: (row: any) => row.roles2?.name,
      //   id: 'roles2',
      //   header: 'Roles 2',
      //   Cell: (row: any) => {
      //     const data = row.row.original?.roles2;
      //     if (data && data?.length > 0) {
      //       return (
      //         <>
      //           {data.map((x: any) => (
      //             <Chip
      //               label={x.name}
      //               key={x.id}
      //               component='a'
      //               variant='outlined'
      //               href={`/admin/roles/${x.id}`}
      //               clickable
      //             />
      //           ))}
      //         </>
      //       );
      //     }
      //   },
      // },
    ],
    [],
  );

  const handleDelete = () => {
    const id = idToDelete;
    dispatch(actions.doDelete(id!));
  };

  const openModal = (event: React.MouseEvent, cell: string) => {
    const id = cell;
    event.stopPropagation();
    dispatch(actions.doOpenConfirm(id));
  };

  const closeModal = () => {
    dispatch(actions.doCloseConfirm());
  };

  const handleExportGroupingTable = async () => {
    try {
      const response = await axios.get(`/groupings`);
      const formattedData = response.data.rows.map((row: any) => ({
        Name: row.name,
        Min: row.min,
        Max: row.max,
        'Roles 1': row.roles1?.map((role: any) => role.name).join(', '),
        'Roles 2': row.roles2?.map((role: any) => role.name).join(', '),
      }));
      return formattedData;
    } catch (err: any) {
      const errMsg = err?.response?.data;
      toast.error(errMsg);
      return null;
    }
  };

  return (
    <>
      <Widget className='widget-p-md' title={<h4>Groupings</h4>}>
        <Stack direction='row' justifyContent='space-between'>
          <Stack
            direction='row'
            alignItems='center'
            flexWrap='wrap'
            columnGap='1rem'
            rowGap='10px'
          >
            {role_permissions(currentUser, 'createConstraint') && (
              <Link to='/admin/groupings/new'>
                <CustomButton type='button'>New</CustomButton>
              </Link>
            )}
          </Stack>

          <ExportTableButton
            name='Groupings'
            handleExport={handleExportGroupingTable}
          />
        </Stack>
        <DynamicTable
          columns={columns}
          rows={rows}
          loading={loading}
          count={count}
          fetchData={(filterObj: any) => dispatch(actions.doFetch(filterObj))}
        />
      </Widget>

      <TableDeleteModal
        isOpen={modalOpen}
        toggleModal={closeModal}
        handleConfirm={handleDelete}
      />
    </>
  );
};

export default GroupingsTable;
