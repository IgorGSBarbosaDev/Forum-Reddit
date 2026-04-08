import { AppApiError } from "../../../shared/api/http-client";

const ERROR_CODE_MESSAGES: Record<string, string> = {
  AUTHENTICATION_REQUIRED: "Autenticacao obrigatoria para executar esta acao.",
  FORBIDDEN: "Voce nao tem permissao para executar esta acao.",
  USER_NOT_FOUND: "Usuario nao encontrado.",
  CONFLICT: "Este relacionamento ja esta nesse estado.",
  SELF_FOLLOW_FORBIDDEN: "Nao e possivel seguir a si mesmo.",
  SELF_UNFOLLOW_FORBIDDEN: "Nao e possivel deixar de seguir a si mesmo.",
  BUSINESS_RULE_VIOLATION: "Regra de negocio impediu a conclusao da acao.",
};

export function toUserMutationMessage(error: unknown, fallbackMessage: string): string {
  if (!(error instanceof AppApiError)) {
    return fallbackMessage;
  }

  return ERROR_CODE_MESSAGES[error.code] ?? error.message;
}
