import moment from 'moment';
import { truncate } from 'lodash';
import { Chip } from '@mui/material';

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
    <div className='grid-badge'>
      {cell && (
        <>
          {cell.length ? (
            cell.map((value: any, index: number) => {
              return (
                <Chip
                  key={value.id}
                  label={value.name}
                  component='a'
                  href={
                    window.location.href.split('/').length > 5
                      ? `../../roles/${value.id}`
                      : `roles/${value.id}`
                  }
                  variant='outlined'
                  clickable
                />
              );
            })
          ) : (
            <Chip
              key={cell.id}
              label={cell.name}
              component='a'
              href={
                window.location.href.split('/').length > 5
                  ? `../../roles/${cell.id}`
                  : `roles/${cell.id}`
              }
              variant='outlined'
              clickable
            />
          )}
        </>
      )}
    </div>
  );
};
function objFormatter(cell: any) {
  if (!cell) return null;
  return (
    <div className='grid-badge'>
      
              <Chip
                key={cell.id}
                label={cell.name}
                component='a'
                href={
                  window.location.href.split('/').length > 5
                    ? `../../roles/${cell.id}`
                    : `roles/${cell.id}`
                }
                variant='outlined'
                clickable
              />
         
    </div>
  );
};

export { booleanFormatter, imageFormatter, dateTimeFormatter, listFormatter,objFormatter, filesFormatter };
