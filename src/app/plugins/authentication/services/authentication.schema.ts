export interface AuthenticationResponse {
  success: boolean;
  message: string;
}

export class ConfirmationResponse implements AuthenticationResponse {
  success: boolean;
  message: string;
  user: any;

  constructor() {}

}

export class ForgotPasswordResponse implements AuthenticationResponse {
  success: boolean;
  message: string;
  user: any;

  constructor() {}

}

export class LoginResponse implements AuthenticationResponse {
  success: boolean;
  message: string;
  user: any;

  constructor() {}

}

export class LogoutResponse implements AuthenticationResponse {
  success: boolean;
  message: string;
  user: any;

  constructor() {}

}

export class RegistrationResponse implements AuthenticationResponse {
  success: boolean;
  message: string;
  user: any;

  constructor() {}

}
