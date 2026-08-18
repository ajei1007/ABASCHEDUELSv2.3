import actions from 'store/actions/companies/companiesListActions';
import React, { useMemo, useState } from 'react';
import { useAppDispatch } from 'store/hooks';
import { useNavigate } from 'react-router';
import Widget from 'components/Widget/Widget';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";
import CustomTable from 'components/Table/Table';
import TableDeleteModal from 'components/TableDeleteModal/TableDeleteModal';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';

const CompaniesTable = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [localFilters, setLocalFilters] = useState({});
  const loading = useTypedSelector((store) => store.companies.list.loading);
  const rows = useTypedSelector((store) => store.companies.list.rows);
  const count = useTypedSelector((store) => store.companies.list.count);
  const modalOpen = useTypedSelector((store) => store.companies.list.modalOpen);
  const idToDelete = useTypedSelector((store) => store.companies.list.idToDelete);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const actionFormatter = (cell: string) => {
    return (
      <ActionFormatter
        editPermissionType='editBranch'
        deletePermissionType='deleteBranch'
        editEvent={() => navigate(`/admin/companies/${cell}/edit`)}
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
      },
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        id: 'membership',
        header: 'Membership',
        enableSorting: false,
        Cell: (row:any) => {
          if(row.row.original?.membership){
            return (
              row.row.original?.membership ? 'Yes' : 'No'
            )
          }
        }
      },
      {
        id: 'industry',
        header: 'Industry',
        enableSorting: false,
        Cell: (row:any) => {
            return row.row.original?.industry
        }
      },
      {
        id: 'disabled',
        header: 'Inactive',
        Cell: (row:any) => {
          if(row.row.original?.disabled){
            return (
              row.row.original?.disabled ? 'Yes' : 'No'
            )
          }
        }
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleDelete = () => {
    const id = idToDelete;
    dispatch(actions.doDelete(id!));
  }

  const openModal = (event: React.MouseEvent, cell: string) => {
    const id = cell;
    event.stopPropagation();
    dispatch(actions.doOpenConfirm(id));
  }

  const closeModal = () => {
    dispatch(actions.doCloseConfirm());
  }

  return (
    <div>
      <Widget className="widget-p-md" title={<h4>Companies</h4>} >
        {/* <Link to="/admin/companies/new">
          <button
            className="btn btn-primary"
            type="button"
          >
            New
          </button>
        </Link>
        <CustomButton type='button' onClick={addFilter}>
          Add Filter
        </CustomButton> */}
        {/* Table */}
        <CustomTable
          columns={columns}
          rows={rows}
          count={count}
          loading={loading}
          fetchData={(filterObj: any) => {
            setLocalFilters(filterObj);
            dispatch(actions.doFetch(filterObj));
          }}
          searchFields={[{ value: 'name', label: 'Name' }]}
          selectFields={[]}
        />

      </Widget>
      <TableDeleteModal
        isOpen={modalOpen}
        toggleModal={closeModal}
        handleConfirm={handleDelete}
      />
    </div>
  )
}

export default CompaniesTable;
