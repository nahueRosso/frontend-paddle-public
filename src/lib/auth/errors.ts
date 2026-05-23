export class BackendFetchError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "BackendFetchError";
    this.status = status;
    this.payload = payload ?? null;
  }
}

export function isBackendFetchError(error: unknown): error is BackendFetchError {
  return error instanceof BackendFetchError;
}

