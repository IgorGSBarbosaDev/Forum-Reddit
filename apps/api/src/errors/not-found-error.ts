import { DomainError } from "./domain-error";

export class NotFoundError extends DomainError {
  constructor(message = "Resource not found.", code = "RESOURCE_NOT_FOUND") {
    super(message, code, 404);
    this.name = "NotFoundError";
  }
}
