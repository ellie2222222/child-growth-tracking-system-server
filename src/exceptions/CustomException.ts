class CustomException extends Error {
  public code: number;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomException;
