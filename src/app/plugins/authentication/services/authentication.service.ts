import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ConfigurationService } from '../../../services/configuration.service';
import { CognitoAuthenticationService } from '../../authentication-cognito/services/cognito-authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(
    private configurationService: ConfigurationService,
    private cognitoAuthenticationService: CognitoAuthenticationService
    ) {}

  public get authenticationProviderService(): any {
    return this.cognitoAuthenticationService;
  }

  public authenticationPageLoadSource = new Subject<any>();
  public authenticationPageLoad$ = this.authenticationPageLoadSource.asObservable();
  public authenticationChange$ = this.authenticationProviderService.authenticationChangeSource.asObservable();
  public loginResponse$ = this.authenticationProviderService.loginResponseSource.asObservable();
  public logoutResponse$ = this.authenticationProviderService.logoutResponseSource.asObservable();
  public registrationResponse$ = this.authenticationProviderService.registrationResponseSource.asObservable();
  public confirmationResponse$ = this.authenticationProviderService.confirmationResponseSource.asObservable();
  public forgotPasswordResponse$ = this.authenticationProviderService.forgotPasswordResponseSource.asObservable();
  public changePasswordResponse$ = this.authenticationProviderService.changePasswordResponseSource.asObservable();
  public resetPasswordResponse$ = this.authenticationProviderService.resetPasswordResponseSource.asObservable();

  public get loggedInUser(): any {
    return this.authenticationProviderService.currentUserValue;
  }

  public get isAccessTokenExpired(): boolean {
    return this.authenticationProviderService.isAccessTokenExpired;
  }

  public get loggedInAccessToken(): string {
    return this.authenticationProviderService.apiAccessToken;
  }

  public get loggedInAccessTokenTimeLeft(): any {
    return this.authenticationProviderService.apiAccessTokenTimeLeft;
  }

  public get currentUserIsAdmin(): boolean {
    return this.authenticationProviderService.currentUserIsAdminValue;
  }

  public get allowUserSelfRegistration(): boolean {
    let allowUserSelfRegistration = false;
    if (this.configurationService.cognito.allowUserSelfRegistration) {
      allowUserSelfRegistration = this.configurationService.cognito.allowUserSelfRegistration;
    }
    return allowUserSelfRegistration;
  }

  verifyToken(): Observable<boolean> {
    return this.authenticationProviderService.verifyToken();
  }

  closeSession() {
    return this.authenticationProviderService.closeSession();
  }

  login(email: string, password: string) {
    this.authenticationProviderService.login(email, password);
  }

  logout() {
    this.authenticationProviderService.logout();
  }

  register(email, password) {
    this.authenticationProviderService.register(email, password);
  }

  confirmUser(userName: string, confirmationCode: string) {
    this.authenticationProviderService.confirmUser(userName, confirmationCode);
  }

  forgotPassword(email: string) {
    this.authenticationProviderService.forgotPassword(email);
  }

  changePassword(email: string, oldPassword: string, newPassword: string) {
    this.authenticationProviderService.changePassword(email, oldPassword, newPassword);
  }

  confirmPassword(username: string, verificationCode: string, password: string) {
    this.authenticationProviderService.confirmPassword(username, verificationCode, password);
  }

  requestPasswordResetVerificationCodeResend(username: string) {
    this.authenticationProviderService.requestPasswordResetVerificationCodeResend(username);
  }

}
