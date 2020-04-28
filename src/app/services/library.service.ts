import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { ReplaySubject, Observable, forkJoin, ObservableInput, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ConfigurationService } from '../services/configuration.service';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  private loadedLibraries: { [url: string]: ReplaySubject<any> } = {};

  constructor(
    @Inject(DOCUMENT) private readonly document: any,
    private httpBackend: HttpBackend,
    public configurationService: ConfigurationService
  ) { }

  loadConfig(useMockJson = false): Promise<boolean> {
    if (useMockJson) {
      return new Promise<boolean>((resolve: (a: boolean) => void): void => {
        resolve(true);
      });
    } else {
      return new Promise<boolean>((resolve: (a: boolean) => void): void => {
        const http = new HttpClient(this.httpBackend);
        http.get('./config.json')
          .pipe(
            map((x: ConfigurationService) => {
              this.configurationService.apigateway = x.apigateway;
              this.configurationService.cognito = x.cognito;
              this.configurationService.version = x.version;
              resolve(true);
            }),
            catchError((x: { status: number }, caught: Observable<void>): ObservableInput<{}> => {
              if (x.status !== 404) {
                resolve(false);
              }
              resolve(true);
              return of({});
            })
          ).subscribe();
      });
    }
  }

  loadHamburgers(): Observable<any> {
    return forkJoin([
      this.loadStyle('assets/dist/hamburgers/hamburgers.css'),
    ]);
  }

  loadDropzone(): Observable<any> {
    return forkJoin([
      this.loadScript('assets/dist/dropzone/dropzone.js'),
      this.loadStyle('assets/dist/dropzone/dropzone.css'),
    ]);
  }

  private loadScript(url: string, module: boolean = false): Observable<any> {
    if (this.loadedLibraries[url]) {
      return this.loadedLibraries[url].asObservable();
    }
    this.loadedLibraries[url] = new ReplaySubject();
    const script = this.document.createElement('script');
    if (module) {
      script.type = 'module';
    } else {
      script.type = 'text/javascript';
      script.async = true;
    }
    script.src = url;
    script.onload = () => {
      this.loadedLibraries[url].next();
      this.loadedLibraries[url].complete();
    };
    this.document.body.appendChild(script);
    return this.loadedLibraries[url].asObservable();
  }

  private loadStyle(url: string): Observable<any> {
    if (this.loadedLibraries[url]) {
      return this.loadedLibraries[url].asObservable();
    }
    this.loadedLibraries[url] = new ReplaySubject();
    const style = this.document.createElement('link');
    style.type = 'text/css';
    style.href = url;
    style.rel = 'stylesheet';
    style.onload = () => {
      this.loadedLibraries[url].next();
      this.loadedLibraries[url].complete();
    };
    const head = document.getElementsByTagName('head')[0];
    head.appendChild(style);
    return this.loadedLibraries[url].asObservable();
  }

}

