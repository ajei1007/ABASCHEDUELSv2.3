import { CONSTRAINT_TYPES } from 'pages/CRUD/CustomConstraints/helpers/customTypes';

export const CONSTRAINT_TYPE_LABEL_MAP: { [key: string]: string } =
  CONSTRAINT_TYPES.reduce(
    (map, item) => {
      map[item.value] = item.label;
      return map;
    },
    {} as { [key: string]: string }, // Type assertion!
  );

export function constraintMessage(constraint: any) {
  if (!constraint.broken || !constraint.brokenSessions?.length) return null;

  const type = constraint.constraintType; // No need toLowerCase if enum values are used
  const min = constraint.min;
  const max = constraint.max;
  const unit = constraint.unit || '';
  let message = '';

  switch (type) {
    case 'sessionlength':
      if (min === max) {
        message = `Session must be ${min} ${unit}`;
      } else {
        message = `Session must be between ${min} and ${max} ${unit}`;
      }
      break;

    case 'drive':
      message = 'Drive time exceeds allowed limit';
      break;

    case 'time':
      if (min !== undefined && max !== undefined)
        message = `Total time must be between ${min} and ${max} ${unit}`;
      else message = 'Time constraint violated';
      break;

    case 'authorization':
      message = 'Session not authorized';
      break;

    case 'grouping':
      message = 'Employee and client must share a team';
      break;

    case 'backToBack': // match the enum: 'backToBack'
      message = 'Back-to-back session rule violated';
      break;

    case 'gaps':
      message = 'Gap rule violated';
      break;

    case 'distance':
      message = 'Distance exceeds allowed limit';
      break;

    case 'priority':
      message = 'Priority constraint violated';
      break;

    case 'breakQuantity': // match the enum: 'breakQuantity'
      message = 'Break quantity rule violated';
      break;

    case 'supervisionrate': // match the enum: 'supervisionrate'
      message = 'Supervision constraint violated';
      break;

    case 'siblingbranch':
      message = 'Sibling branch constraint violated';
      break;

    // Add more types and messages as needed
    default:
      message = `${CONSTRAINT_TYPE_LABEL_MAP[type] || type} constraint violated`;
      break;
  }

  return message;
}
