export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
