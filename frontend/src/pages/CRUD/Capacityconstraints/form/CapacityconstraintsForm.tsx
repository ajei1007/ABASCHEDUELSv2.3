import React, { useState } from 'react';
import { Formik } from 'formik';
import { Box } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Loader from 'components/Loader/Loader';
import capacityconstraintsFields from 'pages/CRUD/Capacityconstraints/helpers/capacityconstraintsFields';
import IniValues from 'components/FormItems/iniValues';
import PreparedValues from 'components/FormItems/preparedValues';
import Widget from 'components/Widget/Widget';
import capacityconstraintsFormValidationSchema from '../helpers/capacityconstraintsFormValidationSchema';
import CapacityConstraintsHelpModal from '../helpers/CapacityConstraintsHelpModal';
import CustomButton from 'components/Button';
import CapacityConstraintsFormFields from './CapacityConstraintsFormFields';

const countConstraintsInRecord = (rec: any): number => {
  if (!rec) return 1;

  let n = 0;
  while (
    rec[`role${n + 1}`] != null ||
    rec[`min${n + 1}`] != null ||
    rec[`max${n + 1}`] != null ||
    rec[`enableMinMax${n + 1}`] != null ||
    rec[`enableTags${n + 1}`] != null ||
    rec[`subgroup${n + 1}`] != null
  ) {
    n += 1;
  }
  return Math.max(n, 1);
};

interface CapacityConstraintsStepperFormProps {
  isEditing: boolean;
  findLoading: boolean;
  saveLoading: boolean;
  record: any;
  onSubmit: (id: string, data: any) => void;
  onCancel: () => void;
  modal: boolean;
}

const CapacityConstraintsStepperForm: React.FC<
  CapacityConstraintsStepperFormProps
> = ({
  isEditing,
  findLoading,
  saveLoading,
  record,
  onSubmit,
  onCancel,
  modal,
}) => {
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const iniValues = React.useMemo(() => {
    const initialValues: { [key: string]: any } = IniValues(
      capacityconstraintsFields,
      record || {},
    );
    const rec = record ?? {};
    let constraintCount = record ? countConstraintsInRecord(record) : 1;

    for (let i = 0; i < constraintCount; i++) {
      const idx = i + 1;
      const tagKey = `subgroup${idx}`;
      const minKey = `min${idx}`;
      const maxKey = `max${idx}`;
      const enableTagKey = `enableTags${idx}`;
      const enableMMKey = `enableMinMax${idx}`;

      /* Tag radio */
      if (initialValues[tagKey]) {
        initialValues[enableTagKey] = true;
      }

      /* ---------- Min/Max toggle ------ */
      if (enableMMKey in rec) {
        initialValues[enableMMKey] = Boolean(rec[enableMMKey]);
      } else {
        const valuePresent =
          initialValues[minKey] != null || initialValues[maxKey] != null;

        const minValue = initialValues[minKey]
          ? parseFloat(initialValues[minKey])
          : null;
        const maxValue = initialValues[maxKey]
          ? parseFloat(initialValues[maxKey])
          : null;

        const valueDefault = minValue === 1 && maxValue === 1;

        initialValues[enableMMKey] = valuePresent && !valueDefault;
      }

      if (!initialValues[enableMMKey]) {
        initialValues[minKey] = 1;
        initialValues[maxKey] = 1;
      }
    }

    return {
      id: record?.id || '',
      constraintCount,
      ...initialValues,
    };
  }, [record]);

  if (findLoading) return <Loader />;
  if (isEditing && !record) return <Loader />;

  return (
    <>
      <Widget
        className='widget-p-md'
        title={
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
          >
            <h4>
              {isEditing
                ? 'Edit Capacity Constraints'
                : 'Add Capacity Constraints'}
            </h4>
            <CustomButton
              variant='outlined'
              startIcon={<HelpOutlineIcon />}
              onClick={() => setHelpModalOpen(true)}
            >
              Need Help?
            </CustomButton>
          </Box>
        }
      >
        <Formik
          enableReinitialize
          initialValues={iniValues}
          validationSchema={capacityconstraintsFormValidationSchema}
          onSubmit={(values) => {
            const preparedValues = {
              id: values.id,
              ...PreparedValues(capacityconstraintsFields, values || {}),
            };
            const { id, ...data } = preparedValues;
            onSubmit(id, data);
          }}
        >
          <CapacityConstraintsFormFields
            onCancel={onCancel}
            saveLoading={saveLoading}
            modal={modal}
          />
        </Formik>
      </Widget>
      {/* Help Modal */}
      {helpModalOpen && (
        <CapacityConstraintsHelpModal
          open={helpModalOpen}
          onClose={() => setHelpModalOpen(false)}
        />
      )}
    </>
  );
};

export default CapacityConstraintsStepperForm;
