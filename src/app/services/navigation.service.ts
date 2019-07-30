import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private apiTopClickedSource = new Subject<any>();
  public apiTopClicked$ = this.apiTopClickedSource.asObservable();
  private apiHeaderDocumentsClickedSource = new Subject<any>();
  public apiHeaderDocumentsClicked$ = this.apiHeaderDocumentsClickedSource.asObservable();
  private apiGetDocumentsClickedSource = new Subject<any>();
  public apiGetDocumentsClicked$ = this.apiGetDocumentsClickedSource.asObservable();
  private apiGetDocumentClickedSource = new Subject<any>();
  public apiGetDocumentClicked$ = this.apiGetDocumentClickedSource.asObservable();
  private apiPostDocumentClickedSource = new Subject<any>();
  public apiPostDocumentClicked$ = this.apiPostDocumentClickedSource.asObservable();
  private apiPatchDocumentClickedSource = new Subject<any>();
  public apiPatchDocumentClicked$ = this.apiPatchDocumentClickedSource.asObservable();
  private apiDeleteDocumentClickedSource = new Subject<any>();
  public apiDeleteDocumentClicked$ = this.apiDeleteDocumentClickedSource.asObservable();
  private apiGetDocumentUrlClickedSource = new Subject<any>();
  public apiGetDocumentUrlClicked$ = this.apiGetDocumentUrlClickedSource.asObservable();
  private apiGetDocumentTagsClickedSource = new Subject<any>();
  public apiGetDocumentTagsClicked$ = this.apiGetDocumentTagsClickedSource.asObservable();
  private apiPostDocumentTagsClickedSource = new Subject<any>();
  public apiPostDocumentTagsClicked$ = this.apiPostDocumentTagsClickedSource.asObservable();
  private apiGetDocumentTagClickedSource = new Subject<any>();
  public apiGetDocumentTagClicked$ = this.apiGetDocumentTagClickedSource.asObservable();
  private apiDeleteDocumentTagClickedSource = new Subject<any>();
  public apiDeleteDocumentTagClicked$ = this.apiDeleteDocumentTagClickedSource.asObservable();
  private apiGetDocumentsUploadClickedSource = new Subject<any>();
  public apiGetDocumentsUploadClicked$ = this.apiGetDocumentsUploadClickedSource.asObservable();
  private apiGetDocumentUploadClickedSource = new Subject<any>();
  public apiGetDocumentUploadClicked$ = this.apiGetDocumentUploadClickedSource.asObservable();
  private apiHeaderSearchClickedSource = new Subject<any>();
  public apiHeaderSearchClicked$ = this.apiHeaderSearchClickedSource.asObservable();
  private apiPostSearchClickedSource = new Subject<any>();
  public apiPostSearchClicked$ = this.apiPostSearchClickedSource.asObservable();

  constructor() { }

  trigger(subjectName: string, value: any) {
    switch (subjectName) {
      case 'apiGetDocumentsClicked':
        this.apiGetDocumentsClickedSource.next(value);
        break;
      case 'apiGetDocumentClicked':
        this.apiGetDocumentClickedSource.next(value);
        break;
      case 'apiPostDocumentClicked':
        this.apiPostDocumentClickedSource.next(value);
        break;
      case 'apiPatchDocumentClicked':
        this.apiPatchDocumentClickedSource.next(value);
        break;
      case 'apiDeleteDocumentClicked':
        this.apiDeleteDocumentClickedSource.next(value);
        break;
      case 'apiGetDocumentUrlClicked':
        this.apiGetDocumentUrlClickedSource.next(value);
        break;
    }
  }

}

