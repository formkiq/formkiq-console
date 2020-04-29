import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subscription, Subject } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { NavigationService } from '../../../../services/navigation.service';
import { NavItemClickData } from '../../../../services/navigation.schema';
import { NotificationService } from '../../../../services/notification.service';
import { NotificationInfoType } from '../../../../services/notification.schema';
import { HttpErrorCallback } from '../../../../services/api.service';

@Component({
  selector: 'app-api-item',
  templateUrl: './api-item.component.html',
  styleUrls: ['./api-item.component.scss']
})
export class ApiItemComponent implements OnInit, HttpErrorCallback {

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private authenticationService: AuthenticationService,
    public navigationService: NavigationService,
    private notificationService: NotificationService
  ) { }

  @Input() apiItem;
  @Input() isCollapsed = true;
  @Input() allowsDate = false;
  @Input() allowsLimit = false;
  @Input() hasPagingTokens = false;
  @Input() allowsPath = false;
  @ViewChild('header') headerElement: ElementRef;

  public form: FormGroup;
  formSubmitted = false;
  get f() { return this.form.controls; }

  private httpRequest: string;
  private curlRequest: string;
  currentRequestTab = 'http';
  private queryString = '';
  responseData: any;
  loading$ = new Subject<boolean>();
  isErrorResponse = true;

  apiGetDocumentClickedSubscription: Subscription;

  ngOnInit() {
    const fieldsForFormBuilder: any = {};
    if (this.apiItem.requiresDocumentID) {
      fieldsForFormBuilder.documentID = ['', [Validators.required, Validators.minLength(1)]];
    }
    if (this.apiItem.requiresTagKey) {
      fieldsForFormBuilder.tagKey = ['', [Validators.required, Validators.minLength(1)]];
    }
    if (this.apiItem.requiresPostJson) {
      fieldsForFormBuilder.postJson = ['', [
        Validators.required,
        Validators.minLength(2),
        this.checkJson
      ]];
    }
    if (this.apiItem.requiresFileUpload) {
      fieldsForFormBuilder.fileUpload = ['', [Validators.required]];
    }
    if (this.apiItem.allowsDate) {
      fieldsForFormBuilder.date = ['', [Validators.pattern('\\d{4}-\\d{2}-\\d{2}')]];
      fieldsForFormBuilder.tz = ['', [Validators.pattern('(([+-]?)(\\d{2}):?(\\d{0,2}))')]];
    }
    if (this.apiItem.allowsLimit) {
      fieldsForFormBuilder.limit = ['', [Validators.pattern('^[1-9][0-9]*$')]];
    }
    if (this.apiItem.hasPagingTokens) {
      fieldsForFormBuilder.previous = ['', [Validators.minLength(6)]];
      fieldsForFormBuilder.next = ['', [Validators.minLength(6)]];
    }
    if (this.apiItem.allowsPath) {
      fieldsForFormBuilder.path = ['', [Validators.pattern('^[A-Za-z0-9._%!~*()\'-]*$')]];
    }
    this.form = this.formBuilder.group(fieldsForFormBuilder);
    this.updateRequestsFromForm();
    this.form.valueChanges.subscribe(val => {
      this.updateRequestsFromForm();
    });
    this.navigationService.navItemClicked$.subscribe(
      (navData: NavItemClickData) => {
        if (navData.source) {
          let collapseItem = null;
          if (navData.collapseItem !== null) {
            collapseItem = navData.collapseItem;
          }
          this.checkClickedSubscription(navData.source, collapseItem);
        }
      }
    );
  }

  checkJson(control: FormControl) {
    let valid = true;
    try {
      JSON.parse(control.value);
    } catch (e) {
      valid = false;
    }
    return valid ? null : {
      pattern: true
    };

  }

  checkClickedSubscription(clickedSubscriptionName, collapseItem) {
    if (this.apiItem.clickedSubscriptionName === clickedSubscriptionName) {
      if (collapseItem === null) {
        this.isCollapsed = false;
      } else {
        this.isCollapsed = collapseItem;
      }
      if (window.innerWidth > 480) {
        setTimeout(() => {
          this.headerElement.nativeElement.scrollIntoView({ behavior: 'auto', block: 'end' });
        }, 10);
      }
    }
  }

  updateRequestsFromForm() {
    this.queryString = '';
    let host = this.apiItem.host;
    if (host.substring(host.length - 1) === '/') {
      host = host.substring(0, host.length - 1);
    }
    let path = this.apiItem.path;
    let postJson = '';
    if (this.apiItem.requiresDocumentID) {
      if (this.f.documentID && this.f.documentID.status === 'VALID') {
        path = path.replace(' DOCUMENT_ID ', this.f.documentID.value);
      }
    }
    if (this.apiItem.requiresTagKey) {
      if (this.f.tagKey && this.f.tagKey.status === 'VALID') {
        path = path.replace(' TAG_KEY ', this.f.tagKey.value);
      }
    }
    this.httpRequest = this.apiItem.method + ' ' + path;
    if (this.apiItem.method === 'POST') {
      this.curlRequest = 'curl -X POST "' + host + path;
    } else {
      this.curlRequest = 'curl "' + host + path;
    }
    if (this.apiItem.method === 'GET') {
      const params: Map<string, string> = new Map<string, string>();
      if (this.f.date && this.f.date.status === 'VALID' && this.f.date.value.length > 0) {
        params.set('date', this.f.date.value);
        if (this.f.tz && this.f.tz.status === 'VALID' && this.f.tz.value.length > 0) {
          params.set('tz', this.f.tz.value);
        }
      }
      if (this.f.limit && this.f.limit.status === 'VALID' && this.f.limit.value.length > 0) {
        params.set('limit', this.f.limit.value);
      }
      if (this.f.previous && this.f.previous.status === 'VALID' && this.f.previous.value.length > 0) {
        params.set('prev', this.f.previous.value);
      }
      if (this.f.next && this.f.next.status === 'VALID' && this.f.next.value.length > 0) {
        params.set('next', this.f.next.value);
      }
      if (this.f.path && this.f.path.status === 'VALID' && this.f.path.value.length > 0) {
        params.set('path', this.f.path.value);
      }
      if (params.size > 0) {
        let queryString = '';
        params.forEach((value: string, key: string) => {
          if (queryString.length === 0) {
            queryString += '?';
          } else {
            queryString += '&';
          }
          queryString += key + '=' + value;
        });
        this.httpRequest += queryString;
        this.queryString = queryString;
        this.curlRequest += queryString;
      }
    } else if (this.apiItem.method === 'POST') {
      if (this.f.postJson && this.f.postJson.status === 'VALID') {
        postJson = this.f.postJson.value;
      }
    }
    this.curlRequest += '" ';
    this.httpRequest += ' HTTP/1.1\nHost: ' + host.replace(/(^\w+:|^)\/\//, '');
    this.curlRequest += '-H ';
    if (this.apiItem.requiresAuthentication) {
      this.httpRequest += '\nAuthorization: ' + this.apiItem.token;
      this.curlRequest += '"Authorization: ' + this.apiItem.token + '" ';
    }
    if (postJson.length > 0) {
      this.httpRequest += '\n\n';
      this.httpRequest += postJson;
      this.curlRequest += ' -d "' + postJson.replace(/"/g, '\\"') + '"';
    }
  }

  setCurrentRequestTab(tab: string) {
    this.currentRequestTab = tab;
  }

  getHttpRequest(): string {
    return this.httpRequest;
  }

  getCurlRequest(): string {
    return this.curlRequest;
  }

  fetch() {
    this.loading$.next(true);
    if (this.apiItem.requiresAuthentication) {
      this.authenticationService.verifyToken().subscribe((valid: boolean) => {
        if (valid) {
          this.executeApiMethod();
        } else {
          this.notificationService.createNotification(
            NotificationInfoType.Warning,
            'Your session has expired. Please sign in again.',
            2000,
            false
          );
          this.authenticationService.closeSession();
        }
      });
    } else {
      this.executeApiMethod();
    }
  }

  executeApiMethod() {
    this.isErrorResponse = false;
    switch (this.apiItem.apiServiceMethodName) {
      case 'getAllDocuments':
        this.apiService.getAllDocuments(this.queryString, this).subscribe((data: Array<object>) => {
          if (data.hasOwnProperty('status')) {
            this.isErrorResponse = true;
          }
          this.responseData = data;
          this.loading$.next(false);
        });
        break;
      case 'getDocument':
        this.apiService.getDocument(this.f.documentID.value, this).subscribe((data: object) => {
          if (data.hasOwnProperty('status')) {
            this.isErrorResponse = true;
          }
          this.responseData = data;
          this.loading$.next(false);
        });
        break;
      case 'postDocuments':
        this.apiService.postDocument(this.f.postJson.value, this).subscribe((data: object) => {
          if (data.hasOwnProperty('status')) {
            this.isErrorResponse = true;
          }
          this.responseData = data;
          this.loading$.next(false);
        });
        break;
      case 'patchDocument':
        this.apiService.patchDocument(this.f.documentID.value, this.f.postJson.value, this).subscribe((data: object) => {
          if (data.hasOwnProperty('status')) {
            this.isErrorResponse = true;
          }
          this.responseData = data;
          this.loading$.next(false);
        });
        break;
      case 'deleteDocument':
        this.apiService.deleteDocument(this.f.documentID.value, this).subscribe((data: object) => {
          if (data.hasOwnProperty('status')) {
            this.isErrorResponse = true;
          }
          this.responseData = data;
          this.loading$.next(false);
        });
        break;
      case 'getDocumentTags':
        this.apiService.getDocumentTags(this.f.documentID.value, this.queryString, this).subscribe((data: object) => {
          if (data.hasOwnProperty('status')) {
            this.isErrorResponse = true;
          }
          this.responseData = data;
          this.loading$.next(false);
        });
        break;
      case 'postDocumentTags':
        this.apiService.postDocumentTag(this.f.documentID.value, this.f.postJson.value, this).subscribe((data: object) => {
          if (data.hasOwnProperty('status')) {
            this.isErrorResponse = true;
          }
          this.responseData = data;
          this.loading$.next(false);
        });
        break;
      case 'getDocumentTag':
        this.apiService.getDocumentTag(this.f.documentID.value, this.f.tagKey.value, this).subscribe((data: object) => {
          if (data.hasOwnProperty('status')) {
            this.isErrorResponse = true;
          }
          this.responseData = data;
          this.loading$.next(false);
        });
        break;
      case 'deleteDocumentTag':
        this.apiService.deleteDocumentTag(this.f.documentID.value, this.f.tagKey.value, this).subscribe((data: object) => {
          if (data.hasOwnProperty('status')) {
            this.isErrorResponse = true;
          }
          this.responseData = data;
          this.loading$.next(false);
        });
        break;
      case 'getDocumentUrl':
        this.apiService.getDocumentUrl(this.f.documentID.value, this).subscribe((data: string) => {
          if (data.hasOwnProperty('status')) {
            this.isErrorResponse = true;
          }
          this.responseData = data;
          this.loading$.next(false);
        });
        break;
      case 'getDocumentsUpload':
        this.apiService.getDocumentsUpload(this.queryString, this).subscribe((data: string) => {
          if (data.hasOwnProperty('status')) {
            this.isErrorResponse = true;
          }
          this.responseData = data;
          this.loading$.next(false);
        });
        break;
      case 'getDocumentUpload':
        this.apiService.getDocumentUpload(this.f.documentID.value, this.queryString, this).subscribe((data: string) => {
          if (data.hasOwnProperty('status')) {
            this.isErrorResponse = true;
          }
          this.responseData = data;
          this.loading$.next(false);
        });
        break;
      case 'postSearch':
        this.apiService.postSearch(this.f.postJson.value, this.queryString, this).subscribe((data: Array<object>) => {
          if (data.hasOwnProperty('status')) {
            this.isErrorResponse = true;
          }
          this.responseData = data;
          this.loading$.next(false);
        });
        break;
      default:
        this.loading$.next(false);
        break;
    }
  }

  handleApiError(errorResponse: HttpErrorResponse) {
    return Observable.create((observer) => {
      observer.next(errorResponse);
    });
  }

}
