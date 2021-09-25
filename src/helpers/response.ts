import { ERROR_CODES } from 'src/error_code';

export function response(data: any, status = true) {
  return {
    status,
    data,
  };
}
export function notFound() {
  return {
    status: false,
    error_code: ERROR_CODES.DATA_NOT_FOUND,
  };
}
