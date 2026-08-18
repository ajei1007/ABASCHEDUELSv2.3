import { toast } from 'react-toastify';
import { router } from 'router';

const DEFAULT_ERROR_MESSAGE = 'Error';

function serializeError(error: Record<string, any>) {
  try {
    return JSON.stringify(error);
  } catch (e) {
    return '';
  }
}

export function selectErrorMessage(error: {[rest: string]: any}) {
  if (error && error.response && error.response.data) {
    const data = error.response.data;

    if (typeof data === 'object') {
      if (typeof data.error === 'object') {
        if (data.error.message) {
          return data.error.message;
        }

        const serializedError = serializeError(data.error);
        return serializedError
          ? `${DEFAULT_ERROR_MESSAGE}: ${serializedError}`
          : DEFAULT_ERROR_MESSAGE;
      }

      if (typeof data.error === 'string') {
        return data.error;
      }

      return data.message || data.error || DEFAULT_ERROR_MESSAGE;
    }

    return String(data);
  }

  if (typeof error === 'string') {
    return error;
  }

  return error.message || DEFAULT_ERROR_MESSAGE;
}

export function selectErrorCode(error: {[rest: string]: any}) {
  if (error && error.response && error.response.status) {
    return error.response.status;
  }

  return 500;
}

export default class Errors {
  static handle(error: string) {
    if (import.meta.env.MODE !== 'test') {
      // @ts-ignore
      console.error(selectErrorMessage(error));
      console.error(error);
    }

    // @ts-ignore
    if (selectErrorCode(error) === 403) {
      router.navigate('/403');
      return;
    }

    // @ts-ignore
    if (selectErrorCode(error) === 400) {
      // @ts-ignore
      toast.error(selectErrorMessage(error));
      return;
    }

    // @ts-ignore
    if (selectErrorCode(error) === 404) {
      // @ts-ignore
      toast.error(selectErrorMessage(error));
      return;
    }
    router.navigate('/500');
  }

  static errorCode(error: string) {
    // @ts-ignore
    return selectErrorCode(error);
  }

  static selectMessage(error: string) {
    // @ts-ignore
    return selectErrorMessage(error);
  }

  static showMessage(error: string) {
    // @ts-ignore
    toast.error(selectErrorMessage(error));
  }
}
