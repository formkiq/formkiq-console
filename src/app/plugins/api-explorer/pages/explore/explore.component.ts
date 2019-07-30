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
    hasPagingTokens: true
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
    hasPagingTokens: false
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
    hasPagingTokens: false
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
    hasPagingTokens: false
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
    hasPagingTokens: false
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
    hasPagingTokens: true
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
    hasPagingTokens: false
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
    hasPagingTokens: false
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
    hasPagingTokens: false
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
    hasPagingTokens: false
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
    hasPagingTokens: false
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
    hasPagingTokens: false
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
    allowsLimit: false,
    hasPagingTokens: true
  };


  ngOnInit() {
    this.navigationService.apiTopClicked$.subscribe(
      (clicked: boolean) => {
        if (clicked) {
          setTimeout(() => {
            this.headerElement.nativeElement.scrollIntoView({ behavior: 'auto', block: 'end' });
          }, 10);
        }
    });
    this.navigationService.apiHeaderDocumentsClicked$.subscribe(
      (clicked: boolean) => {
        if (clicked) {
          setTimeout(() => {
            this.headerDocumentsElement.nativeElement.scrollIntoView({ behavior: 'auto', block: 'end' });
          }, 10);
        }
    });
    this.navigationService.apiHeaderSearchClicked$.subscribe(
      (clicked: boolean) => {
        if (clicked) {
          setTimeout(() => {
            this.headerSearchElement.nativeElement.scrollIntoView({ behavior: 'auto', block: 'end' });
          }, 10);
        }
    });
  }

  /*
  tagDocument() {
    this.authenticationService.verifyToken().subscribe((valid: boolean) => {
      if (valid) {
        this.apiService.tagDocument('wflsh10.txt', 'testTag', 'goat').subscribe((data: any) => {
          console.log(data);
        });
      } else {
        console.log('not logged in');
        this.authenticationService.closeSession();
      }
    });
  }
  */

}
