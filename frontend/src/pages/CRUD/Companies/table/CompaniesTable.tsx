/* eslint-disable react-hooks/exhaustive-deps */
// eslint-disable-next-line
import actions from 'store/actions/companies/companiesListActions';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from 'store/hooks';
import { useNavigate } from 'react-router';
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
import { Stack } from '@mui/material';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';
import CustomButton from 'components/Button';
import ImportFilePasswordConfirmModal from 'pages/CRUD/components/Modals/ImportFilePasswordConfirmModal';
import CustomTable from 'components/Table/Table';
import CustomSwitch from 'components/CustomSwitch/CustomSwitch';
import { switchCompanyAdmin} from 'store/actions/authActions';

const companiesSheetsValidationSchema = {
  tables: {
    companies: {
      columns: [
        {
          name: 'name',
          required: true,
        },
      ],
    },
  },
};
const companiesSheetsExportSchema = [
  {
    name: 'companies',
    initialValues: [
      {
        name: '',
      },
    ],
  },
];

const CompaniesTable = () => {
  const currentUser = useTypedSelector((store) => store.auth.currentUser);
  const rows = useTypedSelector((store) => store.companies.list.rows);
  const count = useTypedSelector((store) => store.companies.list.count);
  const loading = useTypedSelector((store) => store.companies.list.loading);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [importLoading, setImportLoading] = useState(false);
  const [importSubmittingLoading, setImportSubmittingLoading] = useState(false);
  const [passwordActionModal, setPasswordActionModal] = useState(false);
  const [importFileData, setImportFileData] = useState<any>(null);
  const [localFilters, setLocalFilters] = useState({});
  const [enableTree, setEnableTree] = useState(true);

  // Modal
  const [invalidFileModal, setInvalidFileModal] = useState<boolean>(false);
  const [fileErrors, setFileErrors] = useState<any[]>([]);

  const handleEnableTreeStructure = (e: any) => {
    setEnableTree(e.target.checked);
  };

  const actionFormatter = (id: string) => {
    return (
      <ActionFormatter
        editPermissionType="editBranch"
        switchEvent={
          () => dispatch(switchCompanyAdmin(id))
        }
        editEvent={() => {
          navigate(`/admin/companies/${id}/edit`);
        }}
      />
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'adminId',
        header: 'Actions',
        Cell: ({ row }: { row: any }) => {
          const id = row.original.id; // Access the `id` value from the row
          return actionFormatter(id);
        },
      },
      {
        accessorKey: 'id',
        header: 'id',
      },
      {
        accessorKey: 'name',
        header: 'Company Name',
      },
      {
        accessorKey: 'membership',
        header: 'Membership Level',
      },
      {
        accessorKey: 'disabled',
        header: 'Disabled',
        Cell: ({ renderedCellValue }: { renderedCellValue: boolean }) =>
          renderedCellValue ? 'Yes' : 'No'
      },
    ],
    [dispatch]
  );

  /* Importing Functionalities */
  const toggleInvalidFileModal = () => setInvalidFileModal((prev) => !prev);

  const setErrorMessage = (prefix: string, data: string[]) => {
    const msg = `${prefix}: ${data.join(', ')}`;
    return setFileErrors((prev) => [...prev, msg]);
  };

  const fetchCompaniesSheetData = async () => {
    try {
      const params = { query: '', limit: 100000000 };
      const response = await axios.get(`/companies/sheet-data`, { params });
      return response.data;
    } catch (err: any) {
      const errMsg = err?.response?.data;
      toast.error(errMsg);
      return null;
    }
  };

  const handleExportCompaniesSheet = async () => {
    const data = await fetchCompaniesSheetData();
    return data;
  };

  const handleExportCompaniesTable = async () => {
    let filter: any = localFilters;

    if (filter.limit) delete filter.limit;
    if (filter.page) delete filter.page;

    try {
      const response = await axios.get('/companies', {
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

  const handleImportCompanies = async (data: any) => {
    setFileErrors([]);
    setImportLoading(true);
    // Get users sheet data
    const sheetData = await fetchCompaniesSheetData();
    let isAllDataValid: boolean = true;

    // Values
    const parents = sheetData.parents;
    const branchTypes = sheetData.branchTypes;
    const uploadedCompanies = data.companies;

    // Validate duplicated branch names
    const uploadedBranchNames = uploadedCompanies.map(
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
    const uploadedBranchTypes = uploadedCompanies.map(
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
    const uploadedBranchParents = uploadedCompanies.map(
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

      let newCompaniesData: any[] = uploadedCompanies.map((branch: any) => {
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
        companies: newCompaniesData,
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
        await axios.post('/companies/form-sheet', { data: importFileData });
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
      <Widget className='widget-p-md' title={<h4>Companies</h4>}>
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
              <Link to='/admin/companies/new'>
                <CustomButton type='button'>New</CustomButton>
              </Link>
            )}
            <ImportSheetsButton
              handleUpload={handleImportCompanies}
              sheetsValidationSchema={companiesSheetsValidationSchema}
              importLoading={importLoading}
            />
            <ExportSheetButton
              name='companies'
              handleExport={handleExportCompaniesSheet}
              exportShema={companiesSheetsExportSchema}
            />
          </Stack>
          <Stack
            direction='row'
            alignItems='center'
            flexWrap='wrap'
            columnGap='1rem'
            rowGap='10px'
          >
            <div>
              <label style={{ marginRight: '10px' }}>Tree Structure</label>
              <CustomSwitch
                checked={enableTree}
                onChange={handleEnableTreeStructure}
              />
            </div>
            <ExportTableButton
              name='Companies'
              handleExport={handleExportCompaniesTable}
            />
          </Stack>
        </Stack>

        {/* Table */}
          <CustomTable
            columns={columns.filter((col) => col.accessorKey !== 'id')}
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

      <ImportFilePasswordConfirmModal
        name='Companies'
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

export default CompaniesTable;
