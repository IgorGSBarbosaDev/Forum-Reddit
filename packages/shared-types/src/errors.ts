export type ValidationIssue = {
  field: string;
  message: string;
};

export type ApiErrorBase = {
  message: string;
  code: string;
};

export type ValidationApiError = ApiErrorBase & {
  errors: ValidationIssue[];
};
