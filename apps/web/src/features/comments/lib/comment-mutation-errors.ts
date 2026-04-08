import { AppApiError } from "../../../shared/api/http-client";

const ERROR_CODE_MESSAGES: Record<string, string> = {
  AUTHENTICATION_REQUIRED: "Autenticacao obrigatoria para executar esta acao.",
  FORBIDDEN: "Voce nao tem permissao para executar esta acao.",
  CONFLICT: "Conflito de estado detectado. Atualize os dados e tente novamente.",
  COMMENT_NOT_FOUND: "Comentario nao encontrado.",
  COMMENT_ALREADY_DELETED: "Este comentario ja foi removido.",
  POST_NOT_FOUND: "Post nao encontrado.",
  POST_NOT_COMMENTABLE: "Este post nao aceita novos comentarios.",
  MAX_COMMENT_DEPTH_EXCEEDED: "Limite maximo de profundidade de respostas atingido.",
  VALIDATION_ERROR: "Revise os campos destacados.",
  BUSINESS_RULE_VIOLATION: "Regra de negocio impediu a conclusao da acao.",
};

export function toCommentMutationMessage(error: unknown, fallbackMessage: string): string {
  if (!(error instanceof AppApiError)) {
    return fallbackMessage;
  }

  return ERROR_CODE_MESSAGES[error.code] ?? error.message;
}
