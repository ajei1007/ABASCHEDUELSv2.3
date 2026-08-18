/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Grid2 as Grid, Stack, Typography } from '@mui/material';
//@ts-ignore
import { user_arrays } from 'constants/user_arrays';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ActionEditButton from 'components/ActionButtons/EditButton';

type CustomConstraintsListProps = {
  id: string;
  form: any;
  modal?: any;
  resources: string;
};

const CustomConstraintsList = ({
  id,
  form,
  modal,
  resources,
}: CustomConstraintsListProps) => {
  const [constraints, setConstraints] = useState<any[]>([]);

  useEffect(() => {
    init(id);
  }, [id]);

  const init = async (userId: string) => {
    try {
      await fetchConstraints(userId);
    } catch (error) {
      console.log('error', error);
    }
  };

  const fetchConstraints = async (userId: string) => {
    const response = await axios.get(`/users/constraints/${userId}`);
    const data = response.data;
    setConstraints(data);
  };
  const navigate = useNavigate();
  return (
    <Grid container spacing={2} columns={{ sm: 12, md: 12 }}>
      {Object.keys(user_arrays[resources]).includes('customConstrains') &&
      constraints.length > 0 ? (
        constraints.map((constraint: any, index: any) => (
          <Grid
            key={index}
            size={{
              sm: 12,
              md: 12
            }}>
            <Stack direction='row' justifyContent='space-between'>
              <Typography
                dangerouslySetInnerHTML={{
                  __html: `${index + 1}. ${constraint.description}`,
                }}
              />
              <div>
                <ActionEditButton
                  handleClick={() =>
                    navigate(`/admin/custom/${constraint.id}/edit`)
                  }
                />
              </div>
            </Stack>
          </Grid>
        ))
      ) : (
        <Stack justifyContent='center' width='100%' py={2}>
          <Typography textAlign='center'>
            This user hasn't any custom constraints.
          </Typography>
        </Stack>
      )}
    </Grid>
  );
};

export default CustomConstraintsList;
