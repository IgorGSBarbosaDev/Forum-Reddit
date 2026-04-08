import type { UseFormSetError } from "react-hook-form";

import { AppApiError } from "../../../shared/api/http-client";
import type { PostFormValues } from "./post-form-schema";

const ERROR_CODE_MESSAGES: Record<string, string> = {
  AUTHENTICATION_REQUIRED: "Autenticacao obrigatoria para executar esta acao.",
  FORBIDDEN: "Voce nao tem permissao para executar esta acao.",
  CONFLICT: "Conflito de estado detectado. Atualize os dados e tente novamente.",
  POST_NOT_FOUND: "Post nao encontrado.",
  VALIDATION_ERROR: "Revise os campos destacados.",
  BUSINESS_RULE_VIOLATION: "Regra de negocio impediu a conclusao da acao.",
};

function toFieldName(field: string): keyof PostFormValues | null {
  if (field === "title" || field === "content") {
    return field;
  }

  return null;
}

export function applyPostFieldErrors(error: unknown, setError: UseFormSetError<PostFormValues>): boolean {
  if (!(error instanceof AppApiError) || error.fieldErrors.length === 0) {
    return false;
  }

  let applied = false;

  for (const issue of error.fieldErrors) {
    const fieldName = toFieldName(issue.field);
    if (!fieldName) {
      continue;
    }

    applied = true;
    setError(fieldName, {
      type: "server",
      message: issue.message,
    });
  }

  return applied;
}

export function toPostMutationMessage(error: unknown, fallbackMessage: string): string {
  if (!(error instanceof AppApiError)) {
    return fallbackMessage;
  }

  return ERROR_CODE_MESSAGES[error.code] ?? error.message;
}