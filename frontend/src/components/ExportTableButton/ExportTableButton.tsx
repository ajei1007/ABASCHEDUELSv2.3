import Button from '@mui/material/Button';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { utils, writeFile } from 'xlsx';
import React, { useState } from 'react';

interface ImportSheetsButtonProps {
  name: string;
  handleExport: () => any;
}

const ExportTableButton: React.FC<ImportSheetsButtonProps> = ({
  name,
  handleExport,
  ...props
}: ImportSheetsButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleClickExport = async () => {
    setLoading(true);
    const data = await handleExport();

    if (data) {
      const wb = utils.book_new();

      // DB Data Tables
      const tableName = name;
      const tableRows = data;
      const ws = utils.json_to_sheet(tableRows);
      ws['!cols'] = Object.keys(tableRows[0]).map(() => ({ wch: 15 }));

      utils.book_append_sheet(wb, ws, tableName);
      // Write (Download) Sheets
      writeFile(wb, `${name.toUpperCase()} Table.xlsx`);
    }

    setLoading(false);
  };

  return (
    <Button
      variant='contained'
      component='label'
      loadingPosition='start'
      startIcon={<DownloadOutlinedIcon />}
      loading={loading}
      onClick={handleClickExport}
      {...props}
    >
      {loading ? 'Downloading...' : `Export Table`}
    </Button>
  );
};

export default ExportTableButton;
