import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { ApiItem } from '../../../../services/api.schema';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { ConfigurationService } from '../../../../services/configuration.service';
import { NavigationService } from '../../../../services/navigation.service';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-api-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private authenticationService: AuthenticationService,
    private configurationService: ConfigurationService,
    private navigationService: NavigationService,
    private notificationService: NotificationService
    ) { }

  @ViewChild('header', {static: false}) headerElement: ElementRef;
  @ViewChild('headerDocuments', {static: false}) headerDocumentsElement: ElementRef;
  @ViewChild('headerSearch', {static: false}) headerSearchElement: ElementRef;

  getDocumentsApiItem: ApiItem = {
    apiServiceMethodName: 'getAllDocuments',
    clickedSubscriptionName: 'apiGetDocumentsClicked',
    method: 'GET',
    path: '/documents',
    username: 'Cognito User',
    token: this.authenticationService.loggedInAccessToken,
    host: this.configurationService.apigateway.url,
    requiresAuthentication: true,
    requiresDocumentID: false,
    requiresTagKey: false,
    requiresPostJson: false,
    requiresFileUpload: false,
    allowsDate: true,
    allowsLimit: true,
    hasPagingTokens: true,
    allowsPath: false
  };

  getDocumentApiItem: ApiItem = {
    apiServiceMethodName: 'getDocument',
    clickedSubscriptionName: 'apiGetDocumentClicked',
    method: 'GET',
    path: '/documents/ DOCUMENT_ID ',
    username: 'Cognito User',
    token: this.authenticationService.loggedInAccessToken,
    host: this.configurationService.apigateway.url,
    requiresAuthentication: true,
    requiresDocumentID: true,
    requiresTagKey: false,
    requiresPostJson: false,
    requiresFileUpload: false,
    allowsDate: false,
    allowsLimit: false,
    hasPagingTokens: false,
    allowsPath: false
  };

  postDocumentApiItem: ApiItem = {
    apiServiceMethodName: 'postDocument',
    clickedSubscriptionName: 'apiPostDocumentClicked',
    method: 'POST',
    path: '/documents',
    username: 'Cognito User',
    token: this.authenticationService.loggedInAccessToken,
    host: this.configurationService.apigateway.url,
    requiresAuthentication: true,
    requiresDocumentID: false,
    requiresTagKey: false,
    requiresPostJson: true,
    requiresFileUpload: false,
    allowsDate: false,
    allowsLimit: false,
    hasPagingTokens: false,
    allowsPath: false
  };

  patchDocumentApiItem: ApiItem = {
    apiServiceMethodName: 'patchDocument',
    clickedSubscriptionName: 'apiPatchDocumentClicked',
    method: 'PATCH',
    path: '/documents/ DOCUMENT_ID ',
    username: 'Cognito User',
    token: this.authenticationService.loggedInAccessToken,
    host: this.configurationService.apigateway.url,
    requiresAuthentication: true,
    requiresDocumentID: true,
    requiresTagKey: false,
    requiresPostJson: true,
    requiresFileUpload: false,
    allowsDate: false,
    allowsLimit: false,
    hasPagingTokens: false,
    allowsPath: false
  };

  deleteDocumentApiItem: ApiItem = {
    apiServiceMethodName: 'deleteDocument',
    clickedSubscriptionName: 'apiDeleteDocumentClicked',
    method: 'DELETE',
    path: '/documents/ DOCUMENT_ID ',
    username: 'Cognito User',
    token: this.authenticationService.loggedInAccessToken,
    host: this.configurationService.apigateway.url,
    requiresAuthentication: true,
    requiresDocumentID: true,
    requiresTagKey: false,
    requiresPostJson: false,
    requiresFileUpload: false,
    allowsDate: false,
    allowsLimit: false,
    hasPagingTokens: false,
    allowsPath: false
  };

  getDocumentTagsApiItem: ApiItem = {
    apiServiceMethodName: 'getDocumentTags',
    clickedSubscriptionName: 'apiGetDocumentTagsClicked',
    method: 'GET',
    path: '/documents/ DOCUMENT_ID /tags',
    username: 'Cognito User',
    token: this.authenticationService.loggedInAccessToken,
    host: this.configurationService.apigateway.url,
    requiresAuthentication: true,
    requiresDocumentID: true,
    requiresTagKey: false,
    requiresPostJson: false,
    requiresFileUpload: false,
    allowsDate: false,
    allowsLimit: true,
    hasPagingTokens: true,
    allowsPath: false
  };

  postDocumentTagApiItem: ApiItem = {
    apiServiceMethodName: 'postDocumentTag',
    clickedSubscriptionName: 'apiPostDocumentTagClicked',
    method: 'POST',
    path: '/documents/ DOCUMENT_ID /tags',
    username: 'Cognito User',
    token: this.authenticationService.loggedInAccessToken,
    host: this.configurationService.apigateway.url,
    requiresAuthentication: true,
    requiresDocumentID: true,
    requiresTagKey: false,
    requiresPostJson: true,
    requiresFileUpload: false,
    allowsDate: false,
    allowsLimit: false,
    hasPagingTokens: false,
    allowsPath: false
  };

  getDocumentTagApiItem: ApiItem = {
    apiServiceMethodName: 'getDocumentTag',
    clickedSubscriptionName: 'apiGetDocumentTagClicked',
    method: 'GET',
    path: '/documents/ DOCUMENT_ID /tags/ TAG_KEY',
    username: 'Cognito User',
    token: this.authenticationService.loggedInAccessToken,
    host: this.configurationService.apigateway.url,
    requiresAuthentication: true,
    requiresDocumentID: true,
    requiresTagKey: true,
    requiresPostJson: false,
    requiresFileUpload: false,
    allowsDate: false,
    allowsLimit: false,
    hasPagingTokens: false,
    allowsPath: false
  };

  deleteDocumentTagApiItem: ApiItem = {
    apiServiceMethodName: 'deleteDocumentTag',
    clickedSubscriptionName: 'apiDeleteDocumentTagClicked',
    method: 'DELETE',
    path: '/documents/ DOCUMENT_ID /tags/ TAG_KEY ',
    username: 'Cognito User',
    token: this.authenticationService.loggedInAccessToken,
    host: this.configurationService.apigateway.url,
    requiresAuthentication: true,
    requiresDocumentID: true,
    requiresTagKey: true,
    requiresPostJson: false,
    requiresFileUpload: false,
    allowsDate: false,
    allowsLimit: false,
    hasPagingTokens: false,
    allowsPath: false
  };

  getDocumentUrlApiItem: ApiItem = {
    apiServiceMethodName: 'getDocumentUrl',
    clickedSubscriptionName: 'apiGetDocumentUrlClicked',
    method: 'GET',
    path: '/documents/ DOCUMENT_ID /url',
    username: 'Cognito User',
    token: this.authenticationService.loggedInAccessToken,
    host: this.configurationService.apigateway.url,
    requiresAuthentication: true,
    requiresDocumentID: true,
    requiresTagKey: false,
    requiresPostJson: false,
    requiresFileUpload: false,
    allowsDate: false,
    allowsLimit: false,
    hasPagingTokens: false,
    allowsPath: false
  };

  getDocumentsUploadApiItem: ApiItem = {
    apiServiceMethodName: 'getDocumentsUpload',
    clickedSubscriptionName: 'apiGetDocumentsUploadClicked',
    method: 'GET',
    path: '/documents/upload',
    username: 'Cognito User',
    token: this.authenticationService.loggedInAccessToken,
    host: this.configurationService.apigateway.url,
    requiresAuthentication: true,
    requiresDocumentID: false,
    requiresTagKey: false,
    requiresPostJson: false,
    requiresFileUpload: false,
    allowsDate: false,
    allowsLimit: false,
    hasPagingTokens: false,
    allowsPath: true
  };

  getDocumentUploadApiItem: ApiItem = {
    apiServiceMethodName: 'getDocumentUpload',
    clickedSubscriptionName: 'apiGetDocumentUploadClicked',
    method: 'GET',
    path: '/documents/ DOCUMENT_ID /upload',
    username: 'Cognito User',
    token: this.authenticationService.loggedInAccessToken,
    host: this.configurationService.apigateway.url,
    requiresAuthentication: true,
    requiresDocumentID: true,
    requiresTagKey: false,
    requiresPostJson: false,
    requiresFileUpload: false,
    allowsDate: false,
    allowsLimit: false,
    hasPagingTokens: false,
    allowsPath: true
  };

  postSearchApiItem: ApiItem = {
    apiServiceMethodName: 'postSearch',
    clickedSubscriptionName: 'apiPostSearchClicked',
    method: 'POST',
    path: '/search',
    username: 'Cognito User',
    token: this.authenticationService.loggedInAccessToken,
    host: this.configurationService.apigateway.url,
    requiresAuthentication: true,
    requiresDocumentID: false,
    requiresTagKey: false,
    requiresPostJson: true,
    requiresFileUpload: false,
    allowsDate: false,
    allowsLimit: true,
    hasPagingTokens: true,
    allowsPath: false
  };


  ngOnInit() {
    this.navigationService.navItemClicked$.subscribe(
      (navData: any) => {
        if (navData.source) {
          if (navData.source === 'apiTopClicked') {
            setTimeout(() => {
              this.headerElement.nativeElement.scrollIntoView({ behavior: 'auto', block: 'end' });
            }, 10);
          } else if (navData.source === 'apiHeaderDocumentsClicked') {
            setTimeout(() => {
              this.headerDocumentsElement.nativeElement.scrollIntoView({ behavior: 'auto', block: 'end' });
            }, 10);
          } else if (navData.source === 'apiHeaderSearchClicked') {
            setTimeout(() => {
              this.headerSearchElement.nativeElement.scrollIntoView({ behavior: 'auto', block: 'end' });
            }, 10);
          }
        }
    });
  }

}
