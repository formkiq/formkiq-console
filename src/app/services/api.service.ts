import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, map } from 'rxjs/operators';
import { AuthenticationService } from '../plugins/authentication/services/authentication.service';
import { ConfigurationService } from '../services/configuration.service';
import { Document, Tag } from '../services/api.schema';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
      private httpClient: HttpClient,
      private authenticationService: AuthenticationService,
      private configurationService: ConfigurationService
    ) { }

  allDocumentsResult$: Observable<Document[]>;

  getHttpOptions() {
    return {
      headers: new HttpHeaders({
        Authorization: this.authenticationService.loggedInAccessToken
      })
    };
  }

  getAllDocuments(queryString: string, callback: HttpErrorCallback): Observable<{} | Document[]> {
    return this.httpClient
      .get<Document[]>(this.configurationService.apigateway.url + 'documents' + queryString, this.getHttpOptions())
      .pipe(shareReplay(1),
      catchError(callback.handleApiError));
  }

  getDocument(documentID: string, callback: HttpErrorCallback): Observable<{} | Document> {
    return this.httpClient
      .get<Document>(this.configurationService.apigateway.url + 'documents/' + documentID, this.getHttpOptions())
      .pipe(shareReplay(1),
      catchError(callback.handleApiError));
  }

  postDocument(json: string, callback: HttpErrorCallback): any {
    const body = JSON.parse(json);
    return this.httpClient
      .post<Document>(this.configurationService.apigateway.url + 'documents', body, this.getHttpOptions())
      .pipe(shareReplay(1),
      catchError(callback.handleApiError));
  }

  patchDocument(documentID: string, json: string, callback: HttpErrorCallback): any {
    const body = JSON.parse(json);
    return this.httpClient
      .patch<Document>(this.configurationService.apigateway.url + 'documents/' + documentID, body, this.getHttpOptions())
      .pipe(shareReplay(1),
      catchError(callback.handleApiError));
  }

  deleteDocument(documentID: string, callback: HttpErrorCallback): Observable<{} | Document> {
    return this.httpClient
      .delete<Document>(this.configurationService.apigateway.url + 'documents/' + documentID, this.getHttpOptions())
      .pipe(shareReplay(1),
      catchError(callback.handleApiError));
  }

  /*
  tagDocument(documentID: string, key: string, value: string = ''): Observable<Document> {
    const body = {
      key,
      value
    };
    return this.httpClient
      .post<Document>(this.configurationService.apigateway.url + 'documents/' + documentID + '/tags', body, this.getHttpOptions())
      .pipe(shareReplay(1));
  }
  */

  getDocumentTags(documentID: string, queryString: string, callback: HttpErrorCallback): Observable<{} | Array<Tag>> {
    return this.httpClient
      .get<Array<Tag>>(this.configurationService.apigateway.url + 'documents/' + documentID + '/tags' + queryString, this.getHttpOptions())
      .pipe(shareReplay(1),
      catchError(callback.handleApiError));
  }

  postDocumentTag(documentID: string, json: string, callback: HttpErrorCallback): Observable<any> {
    const body = JSON.parse(json);
    return this.httpClient
      .post<Tag>(this.configurationService.apigateway.url + 'documents/' + documentID + '/tags', body, this.getHttpOptions())
      .pipe(shareReplay(1),
      catchError(callback.handleApiError));
  }

  getDocumentTag(documentID: string, key: string, callback: HttpErrorCallback): Observable<any> {
    return this.httpClient
      .get<Tag>(this.configurationService.apigateway.url + 'documents/' + documentID + '/tags/' + key, this.getHttpOptions())
      .pipe(shareReplay(1),
      catchError(callback.handleApiError));
  }

  deleteDocumentTag(documentID: string, key: string, callback: HttpErrorCallback): Observable<any> {
    return this.httpClient
      .delete<Tag>(this.configurationService.apigateway.url + 'documents/' + documentID + '/tags/' + key, this.getHttpOptions())
      .pipe(shareReplay(1),
      catchError(callback.handleApiError));
  }

  getDocumentUrl(documentID: string, callback: HttpErrorCallback): Observable<{} | string> {
    return this.httpClient
      .get<string>(this.configurationService.apigateway.url + 'documents/' + documentID + '/url', this.getHttpOptions())
      .pipe(shareReplay(1),
      catchError(callback.handleApiError));
  }

  getDocumentsUpload(callback: HttpErrorCallback): Observable<{} | string> {
    return this.httpClient
      .get<string>(this.configurationService.apigateway.url + 'documents/upload', this.getHttpOptions())
      .pipe(shareReplay(1),
      catchError(callback.handleApiError));
  }

  getDocumentUpload(documentID: string, callback: HttpErrorCallback): Observable<{} | string> {
    return this.httpClient
      .get<string>(this.configurationService.apigateway.url + 'documents/' + documentID + '/upload', this.getHttpOptions())
      .pipe(shareReplay(1),
      catchError(callback.handleApiError));
  }

  postSearch(json: string, callback: HttpErrorCallback): Observable<{} | Document[]> {
    const body = JSON.parse(json);
    return this.httpClient
      .post<Array<Document>>(this.configurationService.apigateway.url + 'search', body, this.getHttpOptions())
      .pipe(shareReplay(1),
      catchError(callback.handleApiError));
  }

}

export interface HttpErrorCallback {
  handleApiError(errorResponse: HttpErrorResponse): any;
}
