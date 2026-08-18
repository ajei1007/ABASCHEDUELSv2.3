import UsersSelectItem from '../../helpers/UsersSelectItem';
import { FieldArray } from 'formik';
import userGroupingsFields from '../../helpers/userGroupingsFields';
import { Grid2 as Grid } from '@mui/material';

type GroupsFormProps = {
  form: any;
  modal?: any;
  groupings?: any;
  branchParentHierarchyMap: Record<string, Set<string>>;
};

const GroupsForm = ({
  form,
  modal,
  groupings,
  branchParentHierarchyMap,
}: GroupsFormProps) => {
  const { values } = form;
  const selectedBranchIds = (values.branches || [])?.map(
    (branch: any) => branch.id,
  );

  const usersSelectKey = selectedBranchIds.join('|') || '';

  const groupingSubgroups = (groupId: any, val: any = '') => {
    return groupings
      .find((group: any) => group.id === groupId)
      ?.subgroups.filter((subgroup: any) => {
        const branchId = subgroup.branchId;
        const hasBranchInParentHierarchy =
          selectedBranchIds.length > 0
            ? selectedBranchIds.some((selectedBranchId: any) => {
                const isDescendentOrSelf =
                  selectedBranchId === branchId ||
                  branchParentHierarchyMap[branchId]?.has(selectedBranchId);
                return !branchId || isDescendentOrSelf;
              })
            : true;
        return (
          hasBranchInParentHierarchy &&
          subgroup.name.toLowerCase().includes(val.toLowerCase())
        );
      })
      .map((subgroup: any) => ({ ...subgroup, label: subgroup.name }));
  };
  return (
    <FieldArray name='groupings'>
      {() => (
        <Grid container spacing={2} columns={{ sm: 12, md: 12 }}>
          {values.groupings &&
            values.groupings.length > 0 &&
            values.groupings.map((grouping: any, index: any) => (
              <Grid
                key={index}
                size={{
                  sm: 12,
                  md: 6
                }}>
                <UsersSelectItem
                  key={usersSelectKey}
                  mode='multiple'
                  name={`groupings.${index}.subgroup`}
                  schema={userGroupingsFields}
                  showCreate={!modal}
                  form={form}
                  fieldOption={grouping}
                  fieldName='subgroup'
                  fieldLabel={grouping.label}
                  extraFetchFunction={groupingSubgroups}
                  fieldOptionData={grouping.id}
                  required={grouping.required}
                />
              </Grid>
            ))}
        </Grid>
      )}
    </FieldArray>
  );
};

export default GroupsForm;
