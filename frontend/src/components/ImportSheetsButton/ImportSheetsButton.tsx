import Button from '@mui/material/Button';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { read, utils } from 'xlsx';
import React, { useRef, useState } from 'react';
import { toast } from 'react-toastify';

interface ImportSheetsButtonProps {
  handleUpload: (data: any) => void;
  sheetsValidationSchema: any;
  importLoading: boolean;
};

const readOptions = {
  cellDates: true,
};

const ImportSheetsButton:React.FC<ImportSheetsButtonProps> = ({ handleUpload, sheetsValidationSchema, importLoading }: ImportSheetsButtonProps) => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<any>(null);

  const validateTables = (tableNames: any, validationSchemaTables: any): string[] => {
    const nonExistingTables: string[] = [];
    for (let name in validationSchemaTables) {
      if (!tableNames.includes(name)) {
        nonExistingTables.push(name);
      }
    }
    return nonExistingTables;
  }

  const validateTableColumns = (table: any, validationSchema: any, tableName: any): string[] => {
    const validationSchemaColumns = validationSchema?.columns;
    const isRequiredTable = (validationSchema?.isRequiredTable ?? true) === false ? (table.length ? Object.values(table[0]).filter(e => e !== '').length : false) : true;
    if (validationSchemaColumns && isRequiredTable) {
      const missingColumns: any = [];
      table.forEach((row: any) => {
        validationSchemaColumns.forEach((c: any) => {
          if (c.required) {
            if (!row[c.name]) {
              if (!missingColumns.includes(c.name)) missingColumns.push(c.name);
            }
          }
        });
      });
      return missingColumns;
    }
    return [];
  };

  const handleImport = async (e: any) => {
    setLoading(true);
    try {
      const file = e.target.files[0];
      if (!file) return;

      // Read file
      const data = await file.arrayBuffer();
      const wb = read(data, readOptions);

      const sheetTablesNames = wb.SheetNames;
      const validationSchemaTables = sheetsValidationSchema.tables;
      let updatedTable: any = {};

      // Validate tables
      const nonExistingTables = validateTables(sheetTablesNames, validationSchemaTables);
      if (nonExistingTables.length) {
        fileInputRef.current.value = '';
        const missingTables = nonExistingTables?.join(', ')
        return toast.error(`Missing tables: ${missingTables}`);
      }

      // Validate column required fields
      const columnErrors: string[] = [];
      for (const name of sheetTablesNames) {
        const tableName = name.toLowerCase();
        const table = utils.sheet_to_json(wb.Sheets[name], { dateNF:'M-D-YYYY' });
        if (table.length) {
            const missingColumns = validateTableColumns(table, sheetsValidationSchema?.tables?.[tableName], tableName);
            if (missingColumns.length) {
              const alertMessage = `Missing "${missingColumns.join(', ',)}" column${missingColumns.length > 1 ? 's' : ''} for \n "${tableName}" table`;
              columnErrors.push(alertMessage);
              continue;
            }
          }
          updatedTable[tableName] = table;
      }
      if (columnErrors.length) return columnErrors.forEach((msg: string) => toast.error(msg));

      return handleUpload(updatedTable);
    } catch (error) {
      console.log(error)
    } finally {
      setTimeout(() => setLoading(false), 100)
      fileInputRef.current.value = '';
    }
  };

  return (
    <Button
      variant='contained'
      component='label'
      loadingPosition='start'
      startIcon={<UploadFileIcon />}
      className='btn btn-primary'
      loading={loading || importLoading}
    >
      {loading || importLoading ? 'Uploading...' : 'Upload Sheet file'}
      <input
        hidden
        type='file'
        accept='.xlsx, .xls, .csv'
        multiple={false}
        ref={fileInputRef}
        onChange={(e: any) => handleImport(e)}
      />
    </Button>
  );
};

export default ImportSheetsButton;
