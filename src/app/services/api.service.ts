import { HttpClient, HttpHeaders, HttpErrorResponse, HttpBackend } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, map } from 'rxjs/operators';
import { AuthenticationService } from '../plugins/authentication/services/authentication.service';
import { ConfigurationService } from '../services/configuration.service';
import { Document, Preset, Site, Tag, Webhook } from '../services/api.schema';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private httpClient: HttpClient,
    private authenticationService: AuthenticationService,
    private configurationService: ConfigurationService,
    private httpBackend: HttpBackend
  ) {
    this.noAuthHttpClient = new HttpClient(httpBackend);
  }

  // NOTE: not currently in use as the signed S3 URL PUT is not included as a method
  private noAuthHttpClient: HttpClient;

  getHttpOptions() {
    return {
      headers: new HttpHeaders({
        Authorization: this.authenticationService.loggedInAccessToken
      })
    };
  }

  getAllDocuments(queryString: string, callback: HttpErrorCallback): Observable<{} | Document[]> {
    return this.httpClient
      .get<Document[]>(this.configurationService.apigateway.url + '/documents' + queryString, this.getHttpOptions())
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  getDocument(documentID: string, callback: HttpErrorCallback): Observable<{} | Document> {
    return this.httpClient
      .get<Document>(this.configurationService.apigateway.url + '/documents/' + documentID, this.getHttpOptions())
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  postDocument(json: string, callback: HttpErrorCallback): any {
    const body = JSON.parse(json);
    return this.httpClient
      .post<Document>(this.configurationService.apigateway.url + '/documents', body, this.getHttpOptions())
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  patchDocument(documentID: string, json: string, callback: HttpErrorCallback): any {
    const body = JSON.parse(json);
    return this.httpClient
      .patch<Document>(this.configurationService.apigateway.url + '/documents/' + documentID, body, this.getHttpOptions())
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  deleteDocument(documentID: string, callback: HttpErrorCallback): Observable<{} | Document> {
    return this.httpClient
      .delete<Document>(this.configurationService.apigateway.url + '/documents/' + documentID, this.getHttpOptions())
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }
  getDocumentTags(documentID: string, queryString: string, callback: HttpErrorCallback): Observable<{} | Array<Tag>> {
    return this.httpClient
      .get<Array<Tag>>(this.configurationService.apigateway.url + '/documents/' + documentID + '/tags' + queryString, this.getHttpOptions())
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  postDocumentTag(documentID: string, json: string, callback: HttpErrorCallback): Observable<any> {
    const body = JSON.parse(json);
    return this.httpClient
      .post<Tag>(this.configurationService.apigateway.url + '/documents/' + documentID + '/tags', body, this.getHttpOptions())
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  getDocumentTag(documentID: string, key: string, callback: HttpErrorCallback): Observable<any> {
    return this.httpClient
      .get<Tag>(
        this.configurationService.apigateway.url + '/documents/' + documentID + '/tags/' + encodeURIComponent(key), this.getHttpOptions()
      )
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  deleteDocumentTag(documentID: string, key: string, callback: HttpErrorCallback): Observable<any> {
    return this.httpClient
      .delete<Tag>(
        this.configurationService.apigateway.url + '/documents/' + documentID + '/tags/' + encodeURIComponent(key), this.getHttpOptions()
      )
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  getDocumentUrl(documentID: string, queryString: string, callback: HttpErrorCallback): Observable<{} | string> {
    return this.httpClient
      .get<any>(this.configurationService.apigateway.url + '/documents/' + documentID + '/url' + queryString, this.getHttpOptions())
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  getDocumentContent(documentID: string, queryString: string, callback: HttpErrorCallback): Observable<any> {
    return this.httpClient
      .get<any>(this.configurationService.apigateway.url + '/documents/' + documentID + '/content' + queryString, this.getHttpOptions())
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  postDocumentFormat(documentID: string, json: string, callback: HttpErrorCallback): Observable<any> {
    const body = JSON.parse(json);
    return this.httpClient
      .post<any>(this.configurationService.apigateway.url + '/documents/' + documentID + '/formats', body, this.getHttpOptions())
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  getDocumentVersions(documentID: string, callback: HttpErrorCallback): Observable<{} | string> {
    return this.httpClient
      .get<string>(this.configurationService.apigateway.url + '/documents/' + documentID + '/versions', this.getHttpOptions())
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  getDocumentsUpload(queryString: string, callback: HttpErrorCallback): Observable<{} | string> {
    return this.httpClient
      .get<string>(this.configurationService.apigateway.url + '/documents/upload' + queryString, this.getHttpOptions())
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  getDocumentUpload(documentID: string, queryString: string, callback: HttpErrorCallback): Observable<{} | string> {
    return this.httpClient
      .get<string>(this.configurationService.apigateway.url + '/documents/' + documentID + '/upload' + queryString, this.getHttpOptions())
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  postSearch(json: string, queryString: string, callback: HttpErrorCallback): Observable<{} | Document[]> {
    const body = JSON.parse(json);
    return this.httpClient
      .post<Array<Document>>(this.configurationService.apigateway.url + '/search' + queryString, body, this.getHttpOptions())
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  getAllSites(queryString: string, callback: HttpErrorCallback): Observable<{} | Site[]> {
    return this.httpClient
      .get<Site[]>(this.configurationService.apigateway.url + '/sites' + queryString, this.getHttpOptions())
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  getAllPresets(queryString: string, callback: HttpErrorCallback): Observable<{} | Preset[]> {
    return this.httpClient
      .get<Preset[]>(this.configurationService.apigateway.url + '/presets' + queryString, this.getHttpOptions())
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  postPreset(json: string, callback: HttpErrorCallback): any {
    const body = JSON.parse(json);
    return this.httpClient
      .post<Preset>(this.configurationService.apigateway.url + '/presets', body, this.getHttpOptions())
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  deletePreset(presetID: string, callback: HttpErrorCallback): Observable<{} | Preset> {
    return this.httpClient
      .delete<Preset>(this.configurationService.apigateway.url + '/presets/' + presetID, this.getHttpOptions())
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  getPresetTags(presetID: string, queryString: string, callback: HttpErrorCallback): Observable<{} | Array<Tag>> {
    return this.httpClient
      .get<Array<Tag>>(this.configurationService.apigateway.url + '/presets/' + presetID + '/tags' + queryString, this.getHttpOptions())
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  postPresetTag(presetID: string, json: string, callback: HttpErrorCallback): Observable<any> {
    const body = JSON.parse(json);
    return this.httpClient
      .post<Tag>(this.configurationService.apigateway.url + '/presets/' + presetID + '/tags', body, this.getHttpOptions())
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  deletePresetTag(presetID: string, key: string, callback: HttpErrorCallback): Observable<any> {
    return this.httpClient
      .delete<Tag>(
        this.configurationService.apigateway.url + '/presets/' + presetID + '/tags/' + encodeURIComponent(key), this.getHttpOptions()
      )
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  getVersion(callback: HttpErrorCallback): Observable<any> {
    return this.httpClient
      .get<any>(
        this.configurationService.apigateway.url + '/version', this.getHttpOptions()
      )
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  getAllWebhooks(queryString: string, callback: HttpErrorCallback): Observable<{} | Webhook[]> {
    return this.httpClient
      .get<Webhook[]>(this.configurationService.apigateway.url + '/webhooks' + queryString, this.getHttpOptions())
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  postWebhook(json: string, callback: HttpErrorCallback): any {
    const body = JSON.parse(json);
    return this.httpClient
      .post<Webhook>(this.configurationService.apigateway.url + '/webhooks', body, this.getHttpOptions())
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

  deleteWebhook(webhookID: string, callback: HttpErrorCallback): Observable<{} | Preset> {
    return this.httpClient
      .delete<Webhook>(this.configurationService.apigateway.url + '/webhooks/' + webhookID, this.getHttpOptions())
      .pipe(shareReplay(1),
        catchError(callback.handleApiError));
  }

}

export interface HttpErrorCallback {
  handleApiError(errorResponse: HttpErrorResponse): any;
}
