import Button from '@mui/material/Button';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { utils, writeFile } from 'xlsx';
import React, { useState } from 'react';

interface ImportSheetsButtonProps {
  name: string;
  exportShema: {
    name: string;
    initialValues: any[];
  }[];
  handleExport: () => any;
}

const ExportSheetButton: React.FC<ImportSheetsButtonProps> = ({
  name,
  exportShema,
  handleExport,
}: ImportSheetsButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleClickExport = async () => {
    setLoading(true);
    const data = await handleExport();

    if (data) {
      const wb = utils.book_new();

      // Schema Tables
      for (const schema of exportShema) {
        const tableName = schema.name;
        const tableRows = schema.initialValues;
        const ws = utils.json_to_sheet(tableRows);

        ws['!cols'] = Object.keys(tableRows[0]).map(() => ({ wch: 20 }));
        utils.book_append_sheet(wb, ws, tableName);
      }

      // DB Data Tables
      for (const table in data) {
        const tableName = table;
        const tableRows = data[table];
        const ws = utils.json_to_sheet(tableRows);
        ws['!cols'] = tableRows.map((_: any, index: number) => {
          if (index === 0) {
            return { hidden: true };
          }
          return { wch: 20 };
        });

        utils.book_append_sheet(wb, ws, tableName);
      }
      // Write (Download) Sheets
      writeFile(wb, `${name.toUpperCase()} Sheet Template.xlsx`);
    }

    setLoading(false);
  };

  return (
    <Button
      variant='contained'
      component='label'
      loadingPosition='start'
      startIcon={<DownloadOutlinedIcon />}
      className='btn btn-primary'
      loading={loading}
      onClick={handleClickExport}
    >
      {loading ? 'Downloading...' : `Download Sheet Template file`}
    </Button>
  );
};

export default ExportSheetButton;
