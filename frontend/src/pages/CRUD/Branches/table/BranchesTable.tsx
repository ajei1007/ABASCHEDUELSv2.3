/* eslint-disable react-hooks/exhaustive-deps */
// eslint-disable-next-line
import actions from 'store/actions/branches/branchesListActions';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from 'store/hooks';
import { useNavigate, useLocation } from 'react-router';
import Widget from 'components/Widget/Widget';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import role_permissions from 'helpers/role_permissions';
import ExportSheetButton from 'components/ExportSheetButton/ExportSheetButton';
import ImportSheetsButton from 'components/ImportSheetsButton/ImportSheetsButton';
import ExportTableButton from 'components/ExportTableButton/ExportTableButton';
import axios from 'axios';
import { toast } from 'react-toastify';
import SheetErrorModal from 'components/SheetErrorModal/SheetErrorModal';
import findDuplicates from 'utils/findDuplicates';
import { Stack, Typography } from '@mui/material';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';
import CustomButton from 'components/Button';
import ImportFilePasswordConfirmModal from 'pages/CRUD/components/Modals/ImportFilePasswordConfirmModal';
import DynamicTable from 'components/Table/NewTable/DynamicTable';
import TableDeleteModal from 'components/TableDeleteModal/TableDeleteModal';
import CustomSwitch from 'components/CustomSwitch/CustomSwitch';
import TreeTable from 'components/Table/TreeTable';

const branchesSheetsValidationSchema = {
  tables: {
    branches: {
      columns: [
        {
          name: 'name',
          required: true,
        },
        {
          name: 'branchType',
          required: true,
        },
        {
          name: 'parent',
          required: true,
        },
      ],
    },
  },
};
const branchesSheetsExportSchema = [
  {
    name: 'branches',
    initialValues: [
      {
        name: '',
        branchType: '',
        parent: '',
      },
    ],
  },
];

const inactiveFieldOptions = [
  {
    text: 'None',
    value: '',
  },
  {
    text: 'Show Inactive',
    value: 'true',
  },
  {
    text: "Don't Show Inactive",
    value: 'false',
  },
];

const BranchesTable = () => {
  const currentUser = useTypedSelector((store:any) => store.auth.currentUser);
  const rows = useTypedSelector((store:any) => store.branches.list.rows);
  const count = useTypedSelector((store:any) => store.branches.list.count);
  const loading = useTypedSelector((store:any) => store.branches.list.loading);
  const modalOpen = useTypedSelector((store:any) => store.branches.list.modalOpen);
  const idToDelete = useTypedSelector(
    (store:any) => store.branches.list.idToDelete,
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();


  const [importLoading, setImportLoading] = useState(false);
  const [importSubmittingLoading, setImportSubmittingLoading] = useState(false);
  const [passwordActionModal, setPasswordActionModal] = useState(false);
  const [importFileData, setImportFileData] = useState<any>(null);
  const [localFilters, setLocalFilters] = useState({});
  const [enableTree, setEnableTree] = useState(true);

  // Modal
  const [invalidFileModal, setInvalidFileModal] = useState<boolean>(false);
  const [fileErrors, setFileErrors] = useState<any[]>([]);

  const [isTreeView, setIsTreeView] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('view') === 'normal' ? false : true;
  });

  const handleEnableTreeStructure = (e: any) => {
    setIsTreeView((prev) => {
      const newView = !prev;
      const newViewParam = newView ? 'tree' : 'normal';
      
      // Update the URL query parameter
      navigate(`?view=${newViewParam}`);
      return newView;
    });
  };

  useEffect(() => {
    // Set the initial state based on the URL parameter when the component mounts
    const params = new URLSearchParams(location.search);
    if (params.get('view') === 'normal') {
      setIsTreeView(false);
    } else {
      setIsTreeView(true);
    }
  }, [location.search]);

  const actionFormatter = (cell: string) => {
    return (
      <ActionFormatter
        editPermissionType='editBranch'
        deletePermissionType='deleteBranch'
        editEvent={() => navigate(`/admin/branches/${cell}/edit`)}
        deleteEvent={(event: React.MouseEvent) => openModal(event, cell)}
      />
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: '',
        enableColumnFilter: false,
        Cell: ({ renderedCellValue }: { renderedCellValue: any }) => {
          return actionFormatter(renderedCellValue);
        },
        size: 70,
      },
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorFn: (row: any) => row.branchType?.name,
        id: 'branchType',
        enablePinning: false,
        enableSorting: false,
        enableColumnFilter: false,
        header: 'Branch Type',
        Cell: (row: any) => {
          if (row.row.original?.branchType) {
            return (
              <Link
                to={`/admin/branchtype/${row.row.original.branchType.id}/edit`}
              >
                {row.row.original.branchType.name}
              </Link>
            );
          }
          return;
        },
      },
      {
        accessorFn: (row: any) => row.parent?.name,
        id: 'parent',
        header: 'Parent',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: (row: any) => {
          if (row.row.original?.parent) {
            return (
              <Link to={`/admin/branches/${row.row.original?.parent.id}/edit`}>
                {row.row.original?.parent.name}
              </Link>
            );
          }
          return;
        },
      },
      {
        accessorFn: (row: any) => row.parent?.user?.firstName,
        id: 'user',
        header: 'Location',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: (row: any) => {
          if (row.row.original?.user) {
            return row.row.original?.user?.firstName;
          }
        },
      },
      {
        accessorKey: 'replyToEmail',
        header: 'Reply to Email',
        size: 300,
        enableSorting: false,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'timezone',
        header: 'Timezone',
        size: 300,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'inactive',
        header: 'Inactive',
        size: 300,
        enableSorting: false,
        enableColumnFilter: true,
        filterVariant: 'select',
        filterSelectOptions: inactiveFieldOptions,
        Cell: (row: any) => {
          return row.row.original.inactive ? 'Yes' : 'No';
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

  /* Importing Functionalities */
  const toggleInvalidFileModal = () => setInvalidFileModal((prev) => !prev);

  const setErrorMessage = (prefix: string, data: string[]) => {
    const msg = `${prefix}: ${data.join(', ')}`;
    return setFileErrors((prev) => [...prev, msg]);
  };

  const fetchBranchesSheetData = async () => {
    try {
      const params = { query: '', limit: 100000000 };
      const response = await axios.get(`/branches/sheet-data`, { params });
      return response.data;
    } catch (err: any) {
      const errMsg = err?.response?.data;
      toast.error(errMsg);
      return null;
    }
  };

  const handleExportBranchesSheet = async () => {
    const data = await fetchBranchesSheetData();
    return data;
  };

  const handleExportBranchesTable = async () => {
    let filter: any = localFilters;

    if (filter.limit) delete filter.limit;
    if (filter.page) delete filter.page;

    try {
      const response = await axios.get('/branches', {
        params: filter,
      });
      const formattedData = response.data.rows.map((row: any) => ({
        Name: row.name,
        'Branch Type': row.branchType?.name,
        Parent: row.parent?.name,
      }));
      return formattedData;
    } catch (err: any) {
      const errMsg = err?.response?.data;
      toast.error(errMsg);
      return null;
    }
  };

  const handleImportBranches = async (data: any) => {
    setFileErrors([]);
    setImportLoading(true);
    // Get users sheet data
    const sheetData = await fetchBranchesSheetData();
    let isAllDataValid: boolean = true;

    // Values
    const parents = sheetData.parents;
    const branchTypes = sheetData.branchTypes;
    const uploadedBranches = data.branches;

    // Validate duplicated branch names
    const uploadedBranchNames = uploadedBranches.map(
      (branch: any) => branch.name,
    );
    const duplicatedBranchNames = [
      ...new Set(findDuplicates(uploadedBranchNames)),
    ]; // validate

    // Check if new branch names exists in db
    let existingBranchNames: string[] = []; // validate
    uploadedBranchNames.forEach((name: string) => {
      const branchIndex = parents.findIndex(
        (branch: any) => branch.label === name,
      );
      if (branchIndex !== -1) {
        existingBranchNames.push(name);
      }
    });
    existingBranchNames = [...new Set(existingBranchNames)];

    // Validate branchType
    const uploadedBranchTypes = uploadedBranches.map(
      (branch: any) => branch.branchType,
    );
    let wrongBranchTypes: string[] = [];
    uploadedBranchTypes.forEach((branchType: string) => {
      const branchIndex = branchTypes.findIndex(
        (l: any) => l.label?.toLowerCase() === branchType.toLowerCase(),
      );
      if (branchIndex === -1) {
        wrongBranchTypes.push(branchType);
      }
    });
    wrongBranchTypes = [...new Set(wrongBranchTypes)];

    // Validate branch parents
    const uploadedBranchParents = uploadedBranches.map(
      (branch: any) => branch.parent,
    );
    let wrongBranchParents: string[] = [];
    uploadedBranchParents.forEach((branchType: string) => {
      const branchIndex = parents.findIndex(
        (l: any) => l.label?.toLowerCase() === branchType.toLowerCase(),
      );
      if (branchIndex === -1) {
        wrongBranchParents.push(branchType);
      }
    });
    wrongBranchParents = [...new Set(wrongBranchParents)];

    if (duplicatedBranchNames.length) {
      setErrorMessage('Duplicated Branch Names', duplicatedBranchNames);
      isAllDataValid = false;
    }
    if (existingBranchNames.length) {
      setErrorMessage(
        'These branch names are already in the database',
        existingBranchNames,
      );
      isAllDataValid = false;
    }
    if (wrongBranchTypes.length) {
      setErrorMessage('Invalid Branch Types', wrongBranchTypes);
      isAllDataValid = false;
    }
    if (wrongBranchParents.length) {
      setErrorMessage('Invalid Branch Parents', wrongBranchParents);
      isAllDataValid = false;
    }

    if (isAllDataValid) {
      // Prepare clients object

      let newBranchesData: any[] = uploadedBranches.map((branch: any) => {
        let updatedBranchObj = {
          ...branch,
          branchType: branch.branchType,
          parent: branch.parent,
        };
        updatedBranchObj.branchType = branchTypes.find(
          (val: any) => val.label === updatedBranchObj.branchType,
        ).id;
        updatedBranchObj.parent = parents.find(
          (val: any) => val.label === updatedBranchObj.parent,
        ).id;
        return updatedBranchObj;
      });

      const values = {
        branches: newBranchesData,
      };

      setImportFileData(values);
      setPasswordActionModal(true);
    } else {
      setInvalidFileModal(true);
    }
    setImportLoading(false);
  };

  const handleSubmitImportFileData = async (password: string) => {
    if (password !== import.meta.env.REACT_APP_IMPORT_FILE_PASSWORD) {
      return toast.error('Wrong password!');
    }
    if (importFileData) {
      setImportSubmittingLoading(true);
      try {
        await axios.post('/branches/form-sheet', { data: importFileData });
        dispatch(actions.doFetch({ limit: 1000000, page: 1 }));
      } catch (err: any) {
        const msg = err?.response?.data;
        if (msg) {
          toast.error(msg);
        } else {
          toast.error('Something went wrong. Try again');
        }
      } finally {
        setImportSubmittingLoading(false);
        setPasswordActionModal(false);
      }
    } else {
      toast.error('Something went wrong. Try again');
    }
  };

  return (
    <>
      <Widget className='widget-p-md' title={<h4>Branches</h4>}>
        {/* Header Buttons */}
        <Stack direction='row' justifyContent='space-between' mb={2}>
          <Stack
            direction='row'
            alignItems='center'
            flexWrap='wrap'
            columnGap='1rem'
            rowGap='10px'
          >
            {role_permissions(currentUser, 'createBranch') && (
              <Link to='/admin/branches/new'>
                <CustomButton type='button'>New</CustomButton>
              </Link>
            )}
            <ImportSheetsButton
              handleUpload={handleImportBranches}
              sheetsValidationSchema={branchesSheetsValidationSchema}
              importLoading={importLoading}
            />
            <ExportSheetButton
              name='branches'
              handleExport={handleExportBranchesSheet}
              exportShema={branchesSheetsExportSchema}
            />
          </Stack>
          <Stack
            direction='row'
            alignItems='center'
            flexWrap='wrap'
            columnGap='1rem'
            rowGap='10px'
          >
            <Stack
              component='label'
              direction='row'
              alignItems='center'
              gap='10px'
              sx={{
                cursor: 'pointer',
              }}
            >
              <Typography marginTop='1px' fontSize='0.75rem'>
                Tree Structure
              </Typography>
              <CustomSwitch
                checked={isTreeView}
                onChange={handleEnableTreeStructure}
              />
            </Stack>
            <ExportTableButton
              name='Branches'
              handleExport={handleExportBranchesTable}
            />
          </Stack>
        </Stack>

        {/* Table */}
        {isTreeView ?
          <TreeTable
            columns={columns}
            rows={rows}
            count={count}
            loading={loading}
            fetchData={(filterObj: any) => {
              setLocalFilters(filterObj);
              dispatch(actions.doFetch(filterObj));
            }}
          /> :

          <DynamicTable
            columns={columns}
            rows={rows}
            count={count}
            loading={loading}
            fetchData={(filterObj: any) => {
              setLocalFilters(filterObj);
              dispatch(actions.doFetch(filterObj));
            }}
          />}
      </Widget>

      <TableDeleteModal
        isOpen={modalOpen}
        toggleModal={closeModal}
        handleConfirm={handleDelete}
      />
      <ImportFilePasswordConfirmModal
        name='Branches'
        loading={importSubmittingLoading}
        passwordActionModal={passwordActionModal}
        togglePasswordActionModal={() =>
          setPasswordActionModal((prev) => !prev)
        }
        onSubmit={handleSubmitImportFileData}
      />
      <SheetErrorModal
        isOpen={invalidFileModal}
        toggleModal={toggleInvalidFileModal}
        fileErrors={fileErrors}
      />
    </>
  );
};

export default BranchesTable;
