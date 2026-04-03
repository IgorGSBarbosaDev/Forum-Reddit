export class AuthenticationRequiredError extends Error {
  public readonly statusCode = 401;
  public readonly code = "AUTHENTICATION_REQUIRED";

  constructor(message = "Authentication is required.") {
    super(message);
    this.name = "AuthenticationRequiredError";
  }
}
