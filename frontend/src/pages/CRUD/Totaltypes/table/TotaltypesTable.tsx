/* eslint-disable react-hooks/exhaustive-deps */
// eslint-disable-next-line
import actions from 'store/actions/totaltypes/totaltypesListActions';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from 'store/hooks';
import { useNavigate } from 'react-router';
import Widget from 'components/Widget/Widget';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import { Stack, Typography } from '@mui/material';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';
import DynamicTable from 'components/Table/NewTable/DynamicTable';
import CustomButton from 'components/Button';
import TableDeleteModal from 'components/TableDeleteModal/TableDeleteModal';
import ExportTableButton from 'components/ExportTableButton/ExportTableButton';
import axios from 'axios';
import { toast } from 'react-toastify';

const TotaltypesTable = () => {
  const loading = useTypedSelector((store) => store.totaltypes.list.loading);
  const rows = useTypedSelector((store) => store.totaltypes.list.rows);
  const count = useTypedSelector((store) => store.totaltypes.list.count);
  const modalOpen = useTypedSelector(
    (store) => store.totaltypes.list.modalOpen,
  );
  const idToDelete = useTypedSelector(
    (store) => store.totaltypes.list.idToDelete,
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const actionFormatter = (cell: string) => {
    return (
      <ActionFormatter
        editEvent={() => navigate(`/admin/totaltypes/${cell}/edit`)}
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
        enableColumnFilter: false,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        enableColumnFilter: true,
        filterVariant: 'text', 
      },
      {
        accessorFn: (row: any) => row.activities?.name,
        id: 'activities',
        header: 'Activities',
        enableSorting: false,
        Cell: (row: any) => {
          const data = row.row.original.activities;
          if (data && data.length > 0) {
            return (
              <>
                {data.slice(0, 5).map((x: any, index: number) => {
                  if (data.length > 4 && index === 4)
                    return <Typography key={index}>More...</Typography>;
                  return (
                    <Link
                      to={`/admin/users/resources/Activity/${x.id}/edit`}
                      key={x.id}
                    >
                      <Typography>{x.firstName}</Typography>
                    </Link>
                  );
                })}
              </>
            );
          }
        },
      },
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

  const handleExportTotalTypesTable = async () => {
    try {
      const response = await axios.get(`/totaltypes`);
      const formattedData = response.data.rows.map((row: any) => ({
        Name: row.name,
        Activities: row.activities
          ?.map((activity: any) => activity.firstName)
          .join(', '),
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
      <Widget className='widget-p-md' title={<h4>Total Types</h4>}>
        <Stack direction='row' justifyContent='space-between'>
          <Stack
            direction='row'
            alignItems='center'
            flexWrap='wrap'
            columnGap='1rem'
            rowGap='10px'
          >
            <Link to='/admin/totaltypes/new'>
              <CustomButton type='button'>New</CustomButton>
            </Link>
          </Stack>
          <ExportTableButton
            name='Total Types'
            handleExport={handleExportTotalTypesTable}
          />
        </Stack>
        {/* Table */}
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

export default TotaltypesTable;
