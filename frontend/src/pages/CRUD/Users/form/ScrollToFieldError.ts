// ScrollToFieldError.tsx
import React, { useEffect } from 'react';
import { useFormikContext, type FormikErrors } from 'formik';

interface ScrollToFieldErrorProps {
  scrollBehavior?: ScrollIntoViewOptions;
  // Callback that receives the error field name so you can open the correct accordion panel
  openAccordionForField?: (fieldName: any) => void;
}

/**
 * Converts Formik errors into an array of field names using dot notation.
 * For example, an error on { userInfo: { firstName: 'required' } }
 * will result in ['userInfo.firstName']
 */
export const getFieldErrorNames = (formikErrors: FormikErrors<any>): string[] => {
  const transformObjectToDotNotation = (
    obj: any,
    prefix: string = '',
    result: string[] = []
  ): string[] => {
    Object.keys(obj).forEach((key: string) => {
      const value = obj[key];
      if (!value) return;

      const nextKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        transformObjectToDotNotation(value, nextKey, result);
      } else {
        result.push(nextKey);
      }
    });
    return result;
  };

  return transformObjectToDotNotation(formikErrors);
};

export const ScrollToFieldError: React.FC<ScrollToFieldErrorProps> = ({
  scrollBehavior = { behavior: 'smooth', block: 'center' },
  openAccordionForField,
}) => {
  const { submitCount, isValid, errors } = useFormikContext<any>();

  useEffect(() => {
    // Only run if the form is invalid
    if (isValid) return;

    const fieldErrorNames = getFieldErrorNames(errors);
    if (fieldErrorNames.length === 0) return;

    const errorFieldName = fieldErrorNames[0];

    // Use the callback to open the corresponding accordion panel if provided
    if (openAccordionForField) {
      openAccordionForField(fieldErrorNames);
    }

    // Allow a brief delay for the accordion to expand before scrolling
    setTimeout(() => {
      // Your elements should have an id constructed like:
      // `${errorFieldName.replaceAll('.', '-')}-user-form`
      // For example, 'userInfo.firstName' becomes 'userInfo-firstName-user-form'
      const element = document.querySelector(
        `#${errorFieldName.replaceAll('.', '-')}-user-form`
      ) as HTMLElement | null;
      if (!element) return;
      element.scrollIntoView(scrollBehavior);
      element.focus && element.focus();
    }, 100);
  }, [submitCount]);

  return null;
};