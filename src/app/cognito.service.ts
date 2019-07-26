import {
	Injectable
} from '@angular/core';
import {
	environment
} from "../environments/environment";

import {
	AuthenticationDetails,
	CognitoUserPool,
	CognitoUser,
	CognitoUserAttribute,
	CognitoUserSession
} from "amazon-cognito-identity-js";
import * as AWS from "aws-sdk/global";
import * as awsservice from "aws-sdk/lib/service";
import * as CognitoIdentity from "aws-sdk/clients/cognitoidentity";

import {
	AuthorizedCallback,
	AuthLoginCallback
} from './auth.service';

import {
	User
} from './user';
// import {
// 	UserPassword
// } from './userpassword';
// import {
// 	UserRegister
// } from './userregister';
import * as CloudWatch from "aws-sdk/clients/cloudwatch";

@Injectable({
	providedIn: 'root'
})
export class CognitoService {

	private static _POOL_DATA: any = {
		UserPoolId: environment.userPoolId,
		ClientId: environment.clientId
	};

	public cognitoCreds: AWS.CognitoIdentityCredentials;

	constructor() {}

	private getUserPool(): CognitoUserPool {
		return new CognitoUserPool(CognitoService._POOL_DATA)
	}

	private getCurrentUser() {
		return this.getUserPool().getCurrentUser();
	}

	public getAccessToken(): string {
		return localStorage.getItem('ACCESS_TOKEN');
	}

	public isLoggedIn(): boolean {
		return localStorage.getItem('ACCESS_TOKEN') !== null;
	}

	public logout() {
		localStorage.removeItem('ACCESS_TOKEN');
	}

	public authenticate(userInfo: User, callback: AuthorizedCallback) {

		console.log("UserLoginService: starting the authentication");

		let authenticationData = {
			Username: userInfo.email,
			Password: userInfo.password,
		};

		var authenticationDetails = new AuthenticationDetails(authenticationData);

		let userData = {
			Username: userInfo.email,
			Pool: this.getUserPool()
		};

		console.log("UserLoginService: Params set...Authenticating the user");
		let cognitoUser = new CognitoUser(userData);
		console.log("UserLoginService: config is " + AWS.config);

		cognitoUser.authenticateUser(authenticationDetails, {
			newPasswordRequired: (userAttributes, requiredAttributes) => callback.notauthorized(`User needs to set password.`, userInfo),
			onSuccess: result => this.onLoginSuccess(callback, result),
			onFailure: err => this.onLoginError(callback, err)
		});
	}

	private onLoginSuccess = (callback: AuthorizedCallback, session: CognitoUserSession) => {
		console.log("In authenticateUser onSuccess callback:");
		console.log(session.getIdToken().getJwtToken());

		localStorage.setItem('ACCESS_TOKEN', session.getIdToken().getJwtToken());
		this.authorize(callback);
	}

	static updateAwsConfig(): void {
		let token = localStorage.getItem('ACCESS_TOKEN');
		console.log(token);
		AWS.config.update({
			region: environment.region,
			credentials: CognitoService.buildCognitoCreds(token)
		});
	}

	public authorize(callback: AuthorizedCallback) {

		CognitoService.updateAwsConfig();

		this.getCurrentUser().getSession(function(err, session) {
			if (err) {
				callback.notauthorized(err.message, err);
			} else {
				if (session.isValid()) {
					console.log("CognitoUtil: refreshed successfully");
					console.log(session.getIdToken().getJwtToken());
					localStorage.setItem('ACCESS_TOKEN', session.getIdToken().getJwtToken());
					CognitoService.updateAwsConfig();
					callback.authorized(null);

				} else {
					callback.notauthorized("Unable to refresh session", null);
				}
			}
		});
	}

	// private refreshToken(): void {
	//   this.getCurrentUser().getSession(function(err, session) {
	//     if (err) {
	//       console.log("CognitoUtil: Can't set the credentials:" + err);
	//     } else {
	//       if (session.isValid()) {
	//         console.log("CognitoUtil: refreshed successfully");
	//         console.log(session.getIdToken().getJwtToken());
	//         localStorage.setItem('ACCESS_TOKEN', session.getIdToken().getJwtToken());
	//         CognitoService.updateAwsConfig();

	//       } else {
	//         console.log("CognitoUtil: refreshed but session is still not valid");
	//       }
	//     }
	//   });
	// }

	// This method takes in a raw jwtToken and uses the global AWS config options to build a
	// CognitoIdentityCredentials object and store it for us. It also returns the object to the caller
	// to avoid unnecessary calls to setCognitoCreds.
	static buildCognitoCreds(idTokenJwt: string) {

		let url = 'cognito-idp.' + environment.region.toLowerCase() + '.amazonaws.com/' + environment.userPoolId;
		if (environment.cognito_idp_endpoint) {
			url = environment.cognito_idp_endpoint + '/' + environment.userPoolId;
		}

		let logins: CognitoIdentity.LoginsMap = {};
		logins[url] = idTokenJwt;
		let params = {
			IdentityPoolId: environment.identityPoolId,
			Logins: logins
		};

		let serviceConfigs = < awsservice.ServiceConfigurationOptions > {};
		if (environment.cognito_identity_endpoint) {
			serviceConfigs.endpoint = environment.cognito_identity_endpoint;
		}

		let creds = new AWS.CognitoIdentityCredentials(params, serviceConfigs);
		//this.setCognitoCreds(creds);
		return creds;
	}

	// registerUser(userregister: UserRegister, callback: AuthorizedCallback): void {
	// 	console.log(userregister);

	// 	let attributeList = [];

	// 	let dataEmail = {
	// 		Name: 'email',
	// 		Value: userregister.email
	// 	};

	// 	attributeList.push(new CognitoUserAttribute(dataEmail));
	// 	attributeList.push(new CognitoUserAttribute({
	// 		Name: 'nickname',
	// 		Value: userregister.email
	// 	}));

	// 	this.getUserPool().signUp(userregister.email, userregister.password, attributeList, null, function(err, result) {
	// 		if (err) {
	// 			callback.notauthorized(err.message, err);
	// 		} else {
	// 			console.log("UserRegistrationService: registered user is " + result);
	// 			callback.authorized(null);
	// 		}
	// 	});

	// }

	confirmUser(email: string, confirmationCode: string, callback: AuthorizedCallback): void {

		let userData = {
			Username: email,
			Pool: this.getUserPool()
		};

		let cognitoUser = new CognitoUser(userData);

		cognitoUser.confirmRegistration(confirmationCode, true, function(err, result) {
			if (err) {
				callback.notauthorized(err.message, err);
			} else {
				callback.authorized(null);
			}
		});
	}

	resendCode(email: string, callback: AuthorizedCallback): void {
		let userData = {
			Username: email,
			Pool: this.getUserPool()
		};

		let cognitoUser = new CognitoUser(userData);

		cognitoUser.resendConfirmationCode(function(err, result) {
			if (err) {
				callback.notauthorized(err.message, err);
			} else {
				callback.authorized(null);
			}
		});
	}

	// newPassword(newPasswordUser: UserPassword, callback: AuthorizedCallback): void {
	// 	console.log(newPasswordUser);
	// 	// Get these details and call
	// 	//cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, this);
	// 	let authenticationData = {
	// 		Username: newPasswordUser.email,
	// 		Password: newPasswordUser.existingpassword,
	// 	};
	// 	let authenticationDetails = new AuthenticationDetails(authenticationData);

	// 	let userData = {
	// 		Username: newPasswordUser.email,
	// 		Pool: this.getUserPool()
	// 	};

	// 	console.log("UserLoginService: Params set...Authenticating the user");
	// 	let cognitoUser = new CognitoUser(userData);
	// 	console.log("UserLoginService: config is " + AWS.config);
	// 	cognitoUser.authenticateUser(authenticationDetails, {
	// 		newPasswordRequired: function(userAttributes, requiredAttributes) {
	// 			// User was signed up by an admin and must provide new
	// 			// password and required attributes, if any, to complete
	// 			// authentication.

	// 			// the api doesn't accept this field back
	// 			delete userAttributes.email_verified;
	// 			cognitoUser.completeNewPasswordChallenge(newPasswordUser.password, requiredAttributes, {
	// 				onSuccess: function(result) {
	// 					callback.authorized(userAttributes);
	// 				},
	// 				onFailure: function(err) {
	// 					callback.notauthorized(err['message'], err);
	// 				}
	// 			});
	// 		},
	// 		onSuccess: function(result) {
	// 			console.log("ON SUCCESS! " + result);
	// 			callback.authorized(null);
	// 		},
	// 		onFailure: function(err) {
	// 			console.log("ON FAILRUE: " + err);
	// 			callback.notauthorized(err, err);
	// 		}
	// 	});
	// }

	private onLoginError = (callback: AuthorizedCallback, err) => {
		console.log("onLoginError");
		callback.notauthorized(err.message, err);
	}
}