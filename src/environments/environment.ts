// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
	production: false,

	region: 'us-east-1',
	url: 'https://71upvkak4h.execute-api.us-east-1.amazonaws.com/prod',
	identityPoolId: 'us-east-1:2927fbc1-6ab3-4031-864f-837081982622',
	userPoolId: 'us-east-1_fC9EAO1D0',
	clientId: '79eqaraqip1bh1pfi7hbnk6uc3',
	cognito_idp_endpoint: '',
	cognito_identity_endpoint: '',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.