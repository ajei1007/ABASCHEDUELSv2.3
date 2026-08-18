import moment from 'moment';
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

function listFormatterFilter(cell: any) {
  const go = cell.map((value: any) => { return (value.firstName)})
  return go.join()
  //return cell.firstName
}

function trackingFormatterFilter(cell: any, row: any) {
  const go = cell.map((value: any) => { return (value.firstName) })
  return go.join()
  }

function listFormatter(cell: any) {  
  if (!cell) return null;
  if (cell.length) {
    return (
      <div>
        {cell &&
          cell.length &&
          cell.slice(0, 5).map((value: any, index: number) => {
            if (cell.length > 4 && index === 4) return <p>More...</p>;
            return (
              <div key={value.id}>
                <a href={`../../users/${value.id}`}>
                  {value.lastName
                    ? `${value.firstName} ${value.lastName}`
                    : value.firstName}
                </a>
              </div>
            );
          })}
      </div>
    );
  }
  return (
    <div key={cell.id}>
      <a href={`../../users/${cell.id}`}>
        {cell.lastName ? `${cell.firstName} ${cell.lastName}` : cell.firstName}
      </a>
    </div>
  );
}


export { booleanFormatter,trackingFormatterFilter,listFormatterFilter, imageFormatter, dateTimeFormatter, listFormatter, filesFormatter };


