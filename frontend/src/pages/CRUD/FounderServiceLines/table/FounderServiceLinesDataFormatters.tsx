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

function listFormatter(cell: any) {
  if (!cell) return null;

  return (
    <div>
      { cell && cell.length && cell.map((value: any) => {
        return (
          <div key={value.id}>
            <a
              href={value.id}
            >
              {value.user1}
            </a>
          </div>
        );
      })}
      { cell &&
        <div key={cell.id}>
          <a href={cell.id}>{cell.user1}</a>
        </div>
      }
    </div>
  );
};

export { booleanFormatter, imageFormatter, dateTimeFormatter, listFormatter, filesFormatter };
