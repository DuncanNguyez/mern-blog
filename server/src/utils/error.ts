export class CustomError extends Error {
  statusCode: number;
  message: string;

  constructor(statusCode: number, message: string) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

export const errorHandler = (statusCode: number, message: string) => {
  const error = new CustomError(statusCode, message);
  return error;
};