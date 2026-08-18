import { Formik } from 'formik';
import Loader from 'components/Loader/Loader';
import founderServiceLinesFields from 'pages/CRUD/FounderServiceLines/helpers/founderServiceLinesFields';
import IniValues from 'components/FormItems/iniValues';
import PreparedValues from 'components/FormItems/preparedValues';
import Widget from 'components/Widget/Widget';
import FormActions from 'pages/CRUD/components/FormActions';
import founderServiceLinesFormValidationSchema from '../helpers/founderServiceLinesFormValidationSchema';
import type { FormEvent } from 'react';
import { ScrollToFieldError } from 'pages/CRUD/Users/form/ScrollToFieldError';

type FounderServiceLinesFormProps = {
  isEditing: boolean;
  isProfile: boolean;
  findLoading: boolean;
  saveLoading: boolean;
  record: {
    [rest: string]: any
  };
  onSubmit: Function;
  onCancel: Function;
  modal?: any;
  currentUser?: any;
}

const FounderServiceLinesForm = ({
    isEditing,
    isProfile,
    findLoading,
    saveLoading,
    record,
    onSubmit,
    onCancel,
    modal
  }: FounderServiceLinesFormProps) => {
    const iniValues = () => {
      return IniValues(founderServiceLinesFields, record || {});
  }

  const handleSubmit = (values: {[rest: string]: any}) => {
    // @ts-ignore
    const { id, ...data } = PreparedValues(founderServiceLinesFields, values || {});
    onSubmit(id, data);
  };

  const title = () => {
    if(isProfile) {
      return 'Edit My Profile';
    }
    return isEditing ? 'Edit Founder ServiceLines' : 'Add Founder ServiceLines';
  };
  if (findLoading) return <Loader />;
  if (isEditing && !record) return <Loader />;
  return (
    <Widget className='widget-p-md' title={<h4>{title()}</h4>}>
      <Formik
        onSubmit={handleSubmit}
        initialValues={iniValues()}
        validationSchema={founderServiceLinesFormValidationSchema}
      >
        {(form) => (
          <form onSubmit={form.handleSubmit}>
            <ScrollToFieldError />
 
            <FormActions
              onSubmit={(e: FormEvent<HTMLFormElement>) => form.handleSubmit(e)}
              onReset={form.handleReset}
              onCancel={() => onCancel()}
              saveLoading={saveLoading}
            />
          </form>
        )}
      </Formik>
    </Widget>
  );
}

export default FounderServiceLinesForm;