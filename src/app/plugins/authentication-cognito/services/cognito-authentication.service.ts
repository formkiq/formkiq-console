import { Injectable } from '@angular/core';
import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUserSession,
  AuthenticationDetails,
  CognitoUser,
  CognitoIdToken,
  CognitoAccessToken,
  CognitoRefreshToken
} from 'amazon-cognito-identity-js';
import * as Aws from 'aws-sdk/global';
import * as AwsService from 'aws-sdk/lib/service';
import * as CognitoIdentity from 'aws-sdk/clients/cognitoidentity';
import * as CognitoIdentityServiceProvider from 'aws-sdk/clients/cognitoidentityserviceprovider';
import * as Sts from 'aws-sdk/clients/sts';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as ExpiredStorage from 'expired-storage';
import { ConfigurationService } from '../../../services/configuration.service';
import {
  ChangePasswordResponse,
  ConfirmationResponse,
  ForgotPasswordResponse,
  LoginResponse,
  LogoutResponse,
  RegistrationResponse,
  ResetPasswordResponse
} from '../../authentication/services/authentication.schema';

@Injectable({
  providedIn: 'root'
})
export class CognitoAuthenticationService {

  private expiredStorage: ExpiredStorage;

  private currentUserSubject: BehaviorSubject<CognitoUser>;
  public currentUser: Observable<CognitoUser>;
  private idTokenSubject: BehaviorSubject<string>;
  public idToken: Observable<string>;
  private accessTokenSubject: BehaviorSubject<string>;
  public accessToken: Observable<string>;
  private refreshTokenSubject: BehaviorSubject<string>;
  public refreshToken: Observable<string>;
  private currentUserIsAdminSubject: BehaviorSubject<boolean>;
  public currentUserIsAdmin: Observable<boolean>;

  private cognitoLogins: CognitoIdentity.LoginsMap = {};
  private cognitoCreds: Aws.CognitoIdentityCredentials;

  private authenticationChangeSource = new Subject<any>();
  private loginResponseSource = new Subject<any>();
  private logoutResponseSource = new Subject<any>();
  private registrationResponseSource = new Subject<any>();
  private confirmationResponseSource = new Subject<any>();
  private forgotPasswordResponseSource = new Subject<any>();
  private changePasswordResponseSource = new Subject<any>();
  private resetPasswordResponseSource = new Subject<any>();

  constructor(private configurationService: ConfigurationService) {
    this.expiredStorage = new ExpiredStorage();
    this.currentUserSubject = new BehaviorSubject<CognitoUser>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
    this.idTokenSubject = new BehaviorSubject<string>(JSON.parse(this.expiredStorage.getItem('idToken')));
    this.idToken = this.idTokenSubject.asObservable();
    this.accessTokenSubject = new BehaviorSubject<string>(JSON.parse(this.expiredStorage.getItem('accessToken')));
    this.accessToken = this.accessTokenSubject.asObservable();
    this.refreshTokenSubject = new BehaviorSubject<string>(JSON.parse(this.expiredStorage.getItem('refreshToken')));
    this.refreshToken = this.refreshTokenSubject.asObservable();
    this.currentUserIsAdminSubject = new BehaviorSubject<boolean>(JSON.parse(localStorage.getItem('currentUserIsAdmin')));
    this.currentUserIsAdmin = this.currentUserIsAdminSubject.asObservable();
  }

  public get currentUserValue(): CognitoUser {
    return this.currentUserSubject.value;
  }

  public get isAccessTokenExpired(): boolean {
    return this.expiredStorage.isExpired('idToken');
  }

  public get apiAccessToken(): string {
    return this.idTokenValue;
  }
  public get apiAccessTokenTimeLeft(): string {
    return this.idTokenTimeLeftValue;
  }

  public get idTokenValue(): string {
    return this.idTokenSubject.value;
  }

  public get idTokenTimeLeftValue(): any {
    return this.expiredStorage.getTimeLeft('idToken');
  }

  public get accessTokenValue(): string {
    return this.accessTokenSubject.value;
  }

  public get accessTokenTimeLeftValue(): any {
    return this.expiredStorage.getTimeLeft('accessToken');
  }

  public get refreshTokenValue(): string {
    return this.refreshTokenSubject.value;
  }

  public get currentUserIsAdminValue(): boolean {
    return this.currentUserIsAdminSubject.value;
  }

  getUserPool() {
    const poolData = {
      UserPoolId: this.configurationService.cognito.userPoolId,
      ClientId: this.configurationService.cognito.clientId
    };
    return new CognitoUserPool(poolData);
  }

  verifyToken(): Observable<boolean> {
    const IdToken: CognitoIdToken = new CognitoIdToken(
      {
        IdToken: this.idTokenValue
      }
    );
    const AccessToken: CognitoAccessToken = new CognitoAccessToken(
      {
        AccessToken: this.accessTokenValue
      }
    );
    const RefreshToken: CognitoRefreshToken = new CognitoRefreshToken(
      {
        RefreshToken: this.refreshTokenValue
      }
    );
    const sessionData = {
      IdToken,
      AccessToken,
      RefreshToken
    };

    if (this.isAccessTokenExpired) {
      const username = localStorage.getItem('email');
      const cognitoUser: CognitoUser = this.getCognitoUser(username);
      let refreshToken = new CognitoRefreshToken({RefreshToken: this.refreshTokenValue});
      return Observable.create((observer) => {
        cognitoUser.refreshSession(RefreshToken, (err, session) => {
          if (err) {
            observer.next(false);
          } else {
            const idToken = session.getIdToken().getJwtToken();
            const accessToken = session.getAccessToken().getJwtToken();
            refreshToken = session.getRefreshToken().getToken();
            this.setCredentials(idToken, accessToken, refreshToken);
            observer.next(true);
          }
        });
      });
    } else {
      return Observable.create((observer) => {
        observer.next(true);
      });
    }
  }

  login(email: string, password: string) {
    if (this.cognitoCreds) {
      this.cognitoCreds.clearCachedId();
    }
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password
    });
    const cognitoUser = this.getCognitoUser(email);
    const response = new LoginResponse();
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        response.success = true;
        response.message = 'You have signed in successfully.';
        response.email = email;
        response.forcePasswordChange = false;
        localStorage.setItem('email', email);
        localStorage.setItem('currentUser', JSON.stringify(cognitoUser));
        this.currentUserSubject.next(cognitoUser);

        const idToken = result.getIdToken().getJwtToken();
        const accessToken = result.getAccessToken().getJwtToken();
        const refreshToken = result.getRefreshToken().getToken();
        this.setCredentials(idToken, accessToken, refreshToken);

        const url = 'cognito-idp.' + this.configurationService.cognito.region.toLowerCase() + '.amazonaws.com/' +
          this.configurationService.cognito.userPoolId;
        this.cognitoLogins[url] = this.idTokenValue;
        this.loginResponseSource.next(response);
        this.authenticationChangeSource.next();
      },
      onFailure: (err) => {
        response.success = false;
        response.message = err.message;
        // response.email = email;
        if (err.code === 'PasswordResetRequiredException') {
          response.message += '. Instructions to reset your password will be emailed to you.';
          response.forcePasswordChange = false;
          this.currentUserSubject.next(null);
          localStorage.removeItem('currentUser');
          this.idTokenSubject.next(null);
          this.expiredStorage.removeItem('idToken');
          this.accessTokenSubject.next(null);
          this.expiredStorage.removeItem('accessToken');
          this.refreshTokenSubject.next(null);
          this.expiredStorage.removeItem('refreshToken');
          cognitoUser.forgotPassword({
            onSuccess: (result) => {
              response.success = true;
              response.message = 'Your password needs to be reset; instructions will be emailed to you.';
              this.loginResponseSource.next(response);
              this.authenticationChangeSource.next();
              return true;
            },
            onFailure: (forgotErr) => {
              response.success = false;
              response.message = forgotErr.message;
              this.loginResponseSource.next(response);
              this.authenticationChangeSource.next();
              return false;
            },
          });
          return false;
        } else {
          response.forcePasswordChange = false;
          this.currentUserSubject.next(null);
          localStorage.removeItem('currentUser');
          this.idTokenSubject.next(null);
          this.expiredStorage.removeItem('idToken');
          this.accessTokenSubject.next(null);
          this.expiredStorage.removeItem('accessToken');
          this.refreshTokenSubject.next(null);
          this.expiredStorage.removeItem('refreshToken');
          this.loginResponseSource.next(response);
          this.authenticationChangeSource.next();
          return false;
        }
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        response.success = false;
        response.message = 'You must change your password.';
        response.email = email;
        response.forcePasswordChange = true;
        this.currentUserSubject.next(null);
        localStorage.removeItem('currentUser');
        this.idTokenSubject.next(null);
        this.expiredStorage.removeItem('idToken');
        this.accessTokenSubject.next(null);
        this.expiredStorage.removeItem('accessToken');
        this.refreshTokenSubject.next(null);
        this.expiredStorage.removeItem('refreshToken');
        this.loginResponseSource.next(response);
        this.authenticationChangeSource.next();
        return false;
      },
    });
  }

  closeSession() {
    localStorage.removeItem('email');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('idToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.currentUserSubject.next(null);
    this.idTokenSubject.next(null);
    this.accessTokenSubject.next(null);
    this.refreshTokenSubject.next(null);
    Aws.config.update({
      region: this.configurationService.cognito.region,
      credentials: null
    });
    this.authenticationChangeSource.next();
  }

  logout() {
    const response = new LogoutResponse();
    if (this.currentUserValue) {
      response.success = true;
      response.message = 'You have signed out successfully.';
      this.closeSession();
      this.logoutResponseSource.next(response);
      return true;
    } else {
      response.success = false;
      response.message = 'An error has occured while attempting to sign out.';
      this.logoutResponseSource.next(response);
    }
  }

  register(email, password) {
    const userPool = this.getUserPool();
    const emailParam = {
      Name: 'email',
      Value: email
    };
    const attributes = [];
    const emailAttribute = new CognitoUserAttribute(emailParam);
    attributes.push(emailAttribute);
    let cognitoUser;
    userPool.signUp(emailParam.Value, password, attributes, null, (err, result) => {
      const response = new RegistrationResponse();
      if (err) {
        response.success = false;
        response.message = err.message;
        this.registrationResponseSource.next(response);
        return false;
      }
      cognitoUser = result.user;
      // localStorage.setItem('currentUser', JSON.stringify(cognitoUser));
      // this.currentUserSubject.next(cognitoUser);
      // TODO: save email address ?
      response.success = true;
      response.message = 'Your account has been created. Please check your e-mail to verify your account.';
      this.registrationResponseSource.next(response);
      this.authenticationChangeSource.next();
      return true;
    });
  }

  confirmUser(userName: string, confirmationCode: string) {
    const userPool = this.getUserPool();
    const cognitoUser = new CognitoUser({
      Username: userName,
      Pool: userPool
    });
    const response = new ConfirmationResponse();
    cognitoUser.confirmRegistration(confirmationCode, false, (err, result) => {
      if (err) {
        response.success = false;
        response.message = err.message;
        this.confirmationResponseSource.next(response);
        return false;
      }
      response.success = true;
      response.message = 'Your account has been confirmed.';
      this.confirmationResponseSource.next(response);
      this.authenticationChangeSource.next();
      return true;
    });
  }

  forgotPassword(email: string) {
    const userPool = this.getUserPool();
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool
    });
    const response = new ForgotPasswordResponse();
    cognitoUser.forgotPassword({
      onSuccess: (result) => {
        response.success = true;
        response.message = 'A Password Reset link has been emailed to you.';
        this.forgotPasswordResponseSource.next(response);
        return true;
      },
      onFailure: (err) => {
        response.success = false;
        response.message = err.message;
        this.forgotPasswordResponseSource.next(response);
        return false;
      },
    });
  }

  changePassword(email: string, oldPassword: string, newPassword: string) {
    const userPool = this.getUserPool();
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: oldPassword
    });
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool
    });
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        return false;
      },
      onFailure: (err) => {
        const response = new LoginResponse();
        response.success = false;
        response.message = 'Your current password is incorrect.';
        // response.email = email;
        response.forcePasswordChange = false;
        this.currentUserSubject.next(null);
        localStorage.removeItem('currentUser');
        this.idTokenSubject.next(null);
        this.expiredStorage.removeItem('idToken');
        this.accessTokenSubject.next(null);
        this.expiredStorage.removeItem('accessToken');
        this.refreshTokenSubject.next(null);
        this.expiredStorage.removeItem('refreshToken');
        this.changePasswordResponseSource.next(response);
        this.authenticationChangeSource.next();
        return false;
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        const response = new ChangePasswordResponse();
        cognitoUser.completeNewPasswordChallenge(newPassword, {}, {
          onSuccess: (result) => {
            response.success = true;
            response.message = 'Your password has been changed. Please login.';
            this.changePasswordResponseSource.next(response);
            return true;
          },
          onFailure: (err) => {
            response.success = false;
            if (err.code === 'InvalidPasswordException') {
              response.retryChangeForm = true;
            }
            response.message = err.message;
            this.changePasswordResponseSource.next(response);
            return false;
          },
        });
      },
    });
  }

  confirmPassword(username: string, verificationCode: string, password: string) {
    const userPool = this.getUserPool();
    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool
    });
    const response = new ChangePasswordResponse();
    cognitoUser.confirmPassword(verificationCode, password, {
      onSuccess: () => {
        response.success = true;
        response.message = 'Your password has been changed. Please login.';
        this.changePasswordResponseSource.next(response);
        return true;
      },
      onFailure: (err: any) => {
        response.success = false;
        if (err.code === 'ExpiredCodeException') {
          response.message = 'Your code has expired. Please request a new code to be emailed to you.';
          response.requestNewVerificationCode = true;
        } else if (err.code === 'InvalidPasswordException') {
          response.message = err.message;
          response.retryChangeForm = true;
        } else {
          response.message = err.message;
        }
        this.changePasswordResponseSource.next(response);
        return false;
      }
    });
  }

  requestPasswordResetVerificationCodeResend(username: string) {
    const userPool = this.getUserPool();
    const cognitoUser = this.getCognitoUser(username);
    const response = new ForgotPasswordResponse();
    cognitoUser.forgotPassword({
      onSuccess: (data: any) => {
        response.success = true;
        response.message = 'A new verification code has been sent to you.';
        this.changePasswordResponseSource.next(response);
        return true;
      },
      onFailure: (err: Error) => {
        response.success = false;
        response.message = err.message;
        this.changePasswordResponseSource.next(response);
        return false;
      }
    });
  }

  getCognitoUser(username: string) {
    const userData = {
      Username : username,
      Pool : this.getUserPool()
    };
    return new CognitoUser(userData);
  }

  setCredentials(idToken, accessToken, refreshToken) {
    this.expiredStorage.setJson('idToken', idToken, 3500);
    this.idTokenSubject.next(idToken);
    this.expiredStorage.setJson('accessToken', accessToken, 3500);
    this.accessTokenSubject.next(accessToken);
    this.expiredStorage.setJson('refreshToken', refreshToken, 2590000);
    this.refreshTokenSubject.next(refreshToken);
  }
}
