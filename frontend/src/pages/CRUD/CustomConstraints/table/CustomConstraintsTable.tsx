import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { useNavigate } from 'react-router';
import Widget from 'components/Widget/Widget';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import { Stack } from '@mui/material';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';
import DynamicTable from 'components/Table/NewTable/DynamicTable';
import CustomButton from 'components/Button';
import TableDeleteModal from 'components/TableDeleteModal/TableDeleteModal';
import actions from 'store/actions/custom/customListActions';
import useConstraintsTableColumns from '../hooks/useConstraintsTableColumns';
import axios from 'axios';
import Loader from 'components/Loader/Loader';

const CustomConstraintsTable = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loading = useTypedSelector((store) => store.custom.list.loading);
  const rows = useTypedSelector((store) => store.custom.list.rows);
  const count = useTypedSelector((store) => store.custom.list.count);
  const modalOpen = useTypedSelector((store) => store.custom.list.modalOpen);
  const idToDelete = useTypedSelector((store) => store.custom.list.idToDelete);
  const currentUser = useTypedSelector((store) => store.auth.currentUser);

  const settingsValuesSelectedBranches = useAppSelector(
    (state) => state.settings.settingValues.selectedBranches,
  );
  const settingsLoading = useAppSelector(
    (state) => state.settings.settingsLoading,
  );

  /* Table Branches Logics */
  const [branchesOptions, setBranchesOptions] = useState<any[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [localFilters, setLocalFilters] = useState({});

  // Fetch branches for filtering
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get(`/scheduler/branches`);

        const branches = res.data;
        const formattedBranches = branches.map((structure: any) => ({
          id: structure.value,
          options: structure.options.map((option: any) => ({
            label: option.label,
            value: option.value,
          })),
        }));

        const formattedBranchesOptions: any[] = formattedBranches.flatMap(
          (val: any) => val.options,
        );

        setBranchesOptions(formattedBranchesOptions);
      } catch (error) {
        console.log(error);
      } finally {
        setLocalLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const actionFormatter = (cell: string) => {
    return (
      <ActionFormatter
        editEvent={() => navigate(`/admin/custom/${cell}/edit`)}
        deleteEvent={(event: React.MouseEvent) => openModal(event, cell)}
      />
    );
  };

  const columns = useConstraintsTableColumns(
    currentUser?.internalAdmin
      ? [
          {
            accessorKey: 'id',
            header: '',
            Cell: ({ renderedCellValue }: { renderedCellValue: any }) => {
              return actionFormatter(renderedCellValue);
            },
            size: 50,
            enableColumnFilter: false,
            enableSorting: false,
          },
        ]
      : [],
    branchesOptions,
  );
  const handleDelete = async () => {
    const id = idToDelete;
    await dispatch(actions.doDelete(id!));
    dispatch(actions.doFetch(localFilters));
  };

  const openModal = (event: React.MouseEvent, cell: string) => {
    const id = cell;
    event.stopPropagation();
    dispatch(actions.doOpenConfirm(id));
  };

  const closeModal = () => {
    dispatch(actions.doCloseConfirm());
  };

  const defaultSelectedBranchesOption = useMemo(() => {
    const findUsersBranch =
      Array.isArray(settingsValuesSelectedBranches) &&
      settingsValuesSelectedBranches.length > 0
        ? branchesOptions.find(
            (t) => t.value === settingsValuesSelectedBranches[0].id,
          )
        : null;

    const defaultSelectedBranch = findUsersBranch
      ? findUsersBranch
      : branchesOptions[0]
        ? branchesOptions[0]
        : null;

    return defaultSelectedBranch ?? null;
  }, [branchesOptions, settingsValuesSelectedBranches]);

  const defaultColumnFilters = useMemo(
    () =>
      defaultSelectedBranchesOption
        ? [
            {
              id: 'branches',
              value: defaultSelectedBranchesOption.value,
            },
          ]
        : [],
    [defaultSelectedBranchesOption],
  );
  return (
    <>
      <Widget className='widget-p-md' title={<h4>Custom Constraints</h4>}>
        <Stack direction='row' justifyContent='space-between'>
          {currentUser?.internalAdmin && (
            <Stack
              direction='row'
              alignItems='center'
              flexWrap='wrap'
              columnGap='1rem'
              rowGap='10px'
            >
              <Link to='/admin/custom/new'>
                <CustomButton type='button'>New</CustomButton>
              </Link>
            </Stack>
          )}
        </Stack>
        {/* Table */}
        {localLoading || settingsLoading ? (
          <Loader />
        ) : (
          <DynamicTable
            columns={columns}
            rows={rows}
            loading={loading}
            count={count}
            fetchData={(filterObj: any) => {
              setLocalFilters(filterObj);
              dispatch(actions.doFetch(filterObj));
            }}
            defaultColumnFilters={defaultColumnFilters as any}
          />
        )}
      </Widget>

      <TableDeleteModal
        isOpen={modalOpen}
        toggleModal={closeModal}
        handleConfirm={handleDelete}
      />
    </>
  );
};

export default CustomConstraintsTable;
