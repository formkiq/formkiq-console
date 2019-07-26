import {
  Injectable
} from '@angular/core';
import {
  Router
} from "@angular/router";

import {
  User
} from './user';
import {
  CognitoService
} from './cognito.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router, private cognitoService: CognitoService) {}

  public login(userInfo: User, callback: AuthorizedCallback) {
    this.cognitoService.authenticate(userInfo, callback);
  }

  public isLoggedIn(): boolean {
    return this.cognitoService.isLoggedIn();
  }

  public logout() {
    this.cognitoService.logout();
  }

  public getAccessToken(): string {
    return this.cognitoService.getAccessToken();
  }

  public authorize(callback: AuthorizedCallback) {
    this.cognitoService.authorize(callback);
  }
}

export interface AuthLoginCallback {
  loginCallback(message: string, result: any): void;
}

export interface AuthorizedCallback {
  authorized(result: any): void;
  notauthorized(message: string, result: any): void;
}