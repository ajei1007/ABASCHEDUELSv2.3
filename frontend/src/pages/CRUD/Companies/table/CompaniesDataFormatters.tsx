import moment from 'moment';
import React from 'react';
import { truncate } from 'lodash';

function imageFormatter(cell: Array<any>) {
  const imageUrl =
    cell && cell.length
      ? cell[0].publicUrl
      : undefined;
  return (
    <span>{imageUrl ? <img width="60" height="60" className="rounded-circle" src={imageUrl} alt="avatar" /> : null}</span>
  );
};

function booleanFormatter(cell: boolean) {
  return cell
    ? 'Yes'
    : 'No';
};

function dateTimeFormatter(cell: string) {
  return cell
    ? moment(cell).format('YYYY-MM-DD HH:mm')
    : null;
};

function filesFormatter(cell: Array<any>) {
  return (
    <div>
      { cell && cell.map((value) => {
        return (
          <div key={value.id}>
            <i className="la la-link text-muted mr-2"></i>
            <a
              href={value.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              {truncate(value.name)}
            </a>
          </div>
        );
      })}
    </div>
  )
};

function listFormatter(cell: any, row: any) {
  if (!cell) return null;
  return (
    <>
      {cell && cell.length && cell.slice(0, 5).map((value: any, index: any) => {
        if (cell.length > 4 && index === 4) return <p key={value.id}>More...</p>;
        return (
          <div key={value.id}>
            <a
              href={`../../companies/${value.id}`}
            >
              {value.name}
            </a>
          </div>
        );
      })}
    </>
  );
};

function objFormatter(cell: any) {
  if (!cell) return null;
  return (
    <div>
          <div key={cell.id}>
            <a
              href={`../../companies/${cell.id}`}
            >
              {cell.name}
            </a>
          </div>
        
      
    </div>)
};

export { booleanFormatter, imageFormatter, dateTimeFormatter, listFormatter,objFormatter, filesFormatter };
