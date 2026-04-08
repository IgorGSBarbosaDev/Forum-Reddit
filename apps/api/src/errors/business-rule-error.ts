import { DomainError } from "./domain-error";

export class BusinessRuleError extends DomainError {
  constructor(message: string, code = "BUSINESS_RULE_VIOLATION") {
    super(message, code, 422);
    this.name = "BusinessRuleError";
  }
}
