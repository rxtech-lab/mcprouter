import { CredentialsSignin } from "@auth/core/errors";

export class EmailNotVerifiedError extends CredentialsSignin {
  code = "EmailNotVerified1";
  constructor(address: string) {
    super(`EmailNotVerified:${address}`);
  }
}

export class AuthenticatorNotFoundError extends CredentialsSignin {
  constructor() {
    super("Authenticator not found");
    this.code = "AuthenticatorNotFound";
  }
}
