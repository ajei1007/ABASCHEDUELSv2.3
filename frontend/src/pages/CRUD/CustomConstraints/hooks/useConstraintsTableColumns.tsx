/* eslint-disable react-hooks/exhaustive-deps */
import { Typography } from '@mui/material';
import { CONSTRAINT_TYPES } from '../helpers/customTypes';
import { Link } from 'react-router-dom';
import CustomSelect from 'components/CustomSelect/CustomSelect';

const constraintsTypes = [
  ...CONSTRAINT_TYPES,
];

const constraintsTypesArray = constraintsTypes.map((type) => ({
  label: type.label,  // Assign the 'label' to 'text'
  value: type.value, // Keep 'value' as is
}));

const softFieldOptions = [
  {
    label: 'None',
    value: '',
  },
  {
    label: 'Show Soft',
    value: 1,
  },
  {
    label: "Don't Show Soft",
    value: 0,
  },
];

const disabledFieldOptions = [
  {
    label: 'None',
    value: '',
  },
  {
    label: 'Show Disabled',
    value: 'true',
  },
  {
    label: "Don't Show Disabled",
    value: 'false',
  },
];

console.log('constraintsTypes', constraintsTypes);

const useConstraintsTableColumns = (extraColumns: Array<any>, branchesOptions:any) => {
  const columns = [
    ...extraColumns,
    {
      accessorKey: 'branches',
      id: 'branches',
      header: 'Branches',
      enableColumnFilter: true,
      filterVariant: 'select',
      filterSelectOptions: branchesOptions,
      Cell: (row: any) => {
        const data: Array<any> = row.row.original?.branches;
        if (data && data.length) {
          return (
            <>
              {data.slice(0, 5).map((val: any, index: number) => {
                if (data.length > 4 && index === 4)
                  return <p key={index}>More...</p>;
                return (
                  <Link to={`/admin/branches/${val.id}`} key={val.id}>
                    <Typography>{val.name}</Typography>
                  </Link>
                );
              })}
            </>
          );
        }
        return;
      },
      size: 120,
    },
    {
      accessorKey: 'constraintType',
      header: 'Constraint Type',
      enableColumnFilter: true,
      filterVariant: 'select',
      filterSelectOptions: constraintsTypesArray,
      Cell: (row: any) => {
        const constraintType = row?.row.original?.constraintType;
        const constraintTypeObj = CONSTRAINT_TYPES.find(
          (type: any) => type.value === constraintType,
        );
        return constraintTypeObj?.label || '';
      },
      size: 120,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      enableSorting: false,
      enableColumnFilter: true,
      filterVariant: 'text',
      Cell: (row: any) => {
        const description = row?.row.original?.description;
        return <div dangerouslySetInnerHTML={{ __html: description }} />;
      },
      size: 240,
    },
    {
      accessorKey: 'soft',
      header: 'Soft',
      enableColumnFilter: true,
      filterVariant: 'select',
      filterSelectOptions: softFieldOptions,
      Cell: (row: any) => {
        const data = row.row.original.soft;
        return <Typography sx={{textAlign: 'center'}}>{data ? 'Yes' : 'No'}</Typography>;
      },
      size: 50,
    },
    {
      accessorKey: 'disabled',
      header: 'Inactive',
      enableColumnFilter: true,
      filterVariant: 'select',
      filterSelectOptions: disabledFieldOptions,
      Cell: (row: any) => {
        const data = row.row.original.disabled;
        return <Typography sx={{textAlign: 'center'}}>{data ? 'Yes' : 'No'}</Typography>;
      },
      size: 50,
    },
    // {
    //   accessorKey: 'grouping',
    //   header: 'Grouping',
    //   Cell: (row: any) => {
    //     const grouping = row?.row.original?.grouping;
    //     return grouping?.label || '';
    //   },
    // },
    // // antecedentType
    // {
    //   accessorKey: 'antecedentType',
    //   header: 'Antecedent Type',
    //   Cell: (row: any) => {
    //     const antecedentType = row?.row.original?.antecedentType;
    //     const antecedentTypeObj = ANTECEDENT_AND_CONSEQUENCE_TYPES.find(
    //       (type: any) => type.value === antecedentType,
    //     );
    //     return antecedentTypeObj?.label || '';
    //   },
    // },
    // {
    //   accessorKey: 'antecedentTypeUsers',
    //   header: 'Antecedent Users',
    //   Cell: (row: any) => {
    //     const antecedentTypeUsers = row?.row.original?.antecedentTypeUsers;
    //     if (antecedentTypeUsers && antecedentTypeUsers.length) {
    //       return antecedentTypeUsers.map((val: any) => (
    //         <Fragment key={val.id}>
    //           {val.users.map((user: any) => (
    //             <p key={user.id}>{user.firstName}</p>
    //           ))}
    //         </Fragment>
    //       ));
    //     }
    //     return '';
    //   },
    // },
    // // consequenceType
    // {
    //   accessorKey: 'consequenceType',
    //   header: 'Consequence Type',
    //   Cell: (row: any) => {
    //     const consequenceType = row?.row.original?.consequenceType;
    //     const consequenceTypeObj = ANTECEDENT_AND_CONSEQUENCE_TYPES.find(
    //       (type: any) => type.value === consequenceType,
    //     );
    //     return consequenceTypeObj?.label || '';
    //   },
    // },
  ];
  return columns;
};

export default useConstraintsTableColumns;
