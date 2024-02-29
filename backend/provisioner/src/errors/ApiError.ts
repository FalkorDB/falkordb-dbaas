import { FastifyInstance } from 'fastify';

export class ApiError {
  private constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly errorCode: string,
  ) {}

  static badRequest(message: string, errorCode: string) {
    return new ApiError(message, 400, errorCode);
  }

  static unauthorized(message: string, errorCode: string) {
    return new ApiError(message, 401, errorCode);
  }

  static forbidden(message: string, errorCode: string) {
    return new ApiError(message, 403, errorCode);
  }

  static notFound(message: string, errorCode: string) {
    return new ApiError(message, 404, errorCode);
  }

  static conflict(message: string, errorCode: string) {
    return new ApiError(message, 409, errorCode);
  }

  static unprocessableEntity(message: string, errorCode: string) {
    return new ApiError(message, 422, errorCode);
  }

  static internalServerError(message: string, errorCode: string) {
    return new ApiError(message, 500, errorCode);
  }

  toFastify(fastify: FastifyInstance) {
    return fastify.httpErrors.createError(this.statusCode, this.message, {
      errorCode: this.errorCode,
    });
  }
}
