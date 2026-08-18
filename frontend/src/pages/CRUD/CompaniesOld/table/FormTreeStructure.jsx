/* eslint-disable eqeqeq */
import { Grid2 as Grid, IconButton, Stack, } from '@mui/material';
import _ from 'lodash';
import CustomButton from 'components/Button';
import CustomInput from 'components/CustomInputModal/CustomInput';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

const FormTreeStructure = (props) => {
  const {
    type,
    levels,
    plus,
    roleStructure,
    setRoleStructure,
  } = props;

  const roleOptions = roleStructure?.flatMap((t) =>
    t.flatMap((e) => ({ value: e.name, label: e.name })),
  );

  let currentParentRoles = [];
  return (
    <div style={{ marginTop: '10px' }}>
      {roleStructure.flatMap((t, index) => {
        const flip = (
          <div>
            <label>{`Level ${index}`}</label>
            {t.flatMap((e, index2) => {
              return (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={5.5}>
                    <CustomInput
                      disabled={e.required}
                      value={e.name}
                      onChange={(data) => {
                        let clone = _.cloneDeep(roleStructure);
                        clone[index][index2]['name'] = data.value;
                        setRoleStructure(clone);
                      }}
                    />
                  </Grid>
                  {levels && (
                    <Grid size={5.5}>
                      <CustomSelect
                        isMulti={false}
                        placeholder='Select'
                        value={currentParentRoles.filter(
                          (o) => o.value == e.parent,
                        )}
                        options={currentParentRoles}
                        isDisabled={e.required}
                        onChange={(data) => {
                          let clone = _.cloneDeep(roleStructure);
                          clone[index][index2]['parent'] = data.value;
                          setRoleStructure(clone);
                        }}
                      />
                    </Grid>
                  )}
                  <Grid size={1}>
                    <Stack direction='row'>
                      {plus && (
                        <IconButton
                          onClick={() => {
                            let clone = _.cloneDeep(roleStructure);
                            clone[index].splice(index2 + 1, 0, {
                              name: '',
                              parent: '',
                              color: '',
                            });
                            setRoleStructure(clone);
                          }}
                        >
                            <AddCircleOutlineIcon />
                        </IconButton>
                          
                      )}
                      {!e.required && (
                        <IconButton
                          onClick={() => {
                            let clone = _.cloneDeep(roleStructure);
                            clone[index].splice(index2, 1);
                            clone = clone.filter((c) => c.length > 0);
                            setRoleStructure(clone);
                          }}
                        >
                            <RemoveCircleIcon/>
                        </IconButton>
                         
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              );
            })}
          </div>
        );
        const names = t.map((p) => p.name);
        currentParentRoles = roleOptions.filter((f) => names.includes(f.value));
        return flip;
      })}
      {levels && (
          <Stack alignItems='center'>
            <CustomButton
            onClick={() => {
                let clone = _.cloneDeep(roleStructure);
                clone.push([{ name: '', parent: '', color: '' }]);
                setRoleStructure(clone);
            }}
            >
            Add {type} Level
            </CustomButton>
          </Stack>
      )}
    </div>
  );
};

export default FormTreeStructure;
