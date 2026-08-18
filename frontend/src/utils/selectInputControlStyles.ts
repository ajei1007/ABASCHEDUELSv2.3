import React from 'react';
import type { StylesConfig } from 'react-select';

export const selectInputControlStyles = (
  isInvalid = false,
  required2 = false,
  hasPopulateButton = false,
) =>
  ({
    menuPortal: (base: React.CSSProperties) => ({ ...base, zIndex: 99999 }),
    control: (provided: React.CSSProperties) => ({
      ...provided,
      minHeight: 40,
      border: '1px solid #dee2e6',
      boxShadow: 'none',
      borderRadius: '8px',
      fontSize: '0.75rem',
      ...((isInvalid || required2) && { borderColor: 'red !important' }),
      '&:hover, &:focus': {
        borderColor: `${isInvalid || required2 ? 'red' : '#252cd5'}`,
        boxShadow: 'none',
      },
      paddingLeft: hasPopulateButton ? '0.5rem' : '',
    }),
    option: (provided: any, { data }: any) => {
      const highlight = data?.highlight ? true : false;
      const styles = {
        ...provided,
      };
      if (highlight) {
        styles.fontWeight = '600';
        styles.color = '#16365f';
      }

      return styles;
    },
  }) as StylesConfig;
