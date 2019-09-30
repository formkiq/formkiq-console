import { Injectable } from '@angular/core';
import ApplicationConfigJson from '../../assets/config.json';
import AuthenticationConfigJson from '../plugins/authentication/config.json';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  constructor() { }

  apigateway = ApplicationConfigJson.apigateway;
  authentication = AuthenticationConfigJson;
  cognito = ApplicationConfigJson.cognito;
}
