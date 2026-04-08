import { DomainError } from "./domain-error";

export class ConflictError extends DomainError {
  constructor(message = "The requested resource is in conflict with the current state.") {
    super(message, "CONFLICT", 409);
    this.name = "ConflictError";
  }
}
