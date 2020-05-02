import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../../../../services/api.service';
import { LibraryService } from '../../../../services/library.service';
import { Observable } from 'rxjs';
import * as Dropzone from '../../../../../assets/dist/dropzone/dropzone';

@Component({
  selector: 'app-docs-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit, AfterViewInit {

  @ViewChild('dropzone') dropzoneContainer: ElementRef;

  constructor(
    private apiService: ApiService,
    private libraryService: LibraryService
  ) { }

  dropzone: Dropzone;
  documentsAdded = [];

  ngOnInit() {
    this.libraryService.loadDropzoneStyle();
    this.dropzone = new Dropzone('div#dropzone', {
      url: '#',
      autoQueue: false,
      method: 'PUT',
      dictDefaultMessage: 'Drop files here or click to upload (up to 100 files at a time)',
      maxFiles: 100
    }
    );
    this.dropzone.on('addedfile', (file) => {
      file.putUrl = '';
      const queryString = '?path=' + encodeURIComponent(file.name);
      this.apiService.getDocumentsUpload(queryString, this).subscribe((data: any) => {
        // TODO: handle error response
        file.putUrl = data.url;
        this.dropzone.enqueueFile(file);
      });
    });
    this.dropzone.on('processing', (file) => {
      this.dropzone.options.url = file.putUrl;
      this.dropzone.headers = {
        'Content-Type': file.type,
        Origin: window.location.host,
        'Access-Control-Request-Method': 'PUT'
      };
    });
    this.dropzone.on('sending', (file, xhr, formData) => {
      const xhrSend = xhr.send;
      xhr.send = () => {
        xhrSend.call(xhr, file);
      };
    });
    this.dropzone.on('complete', (file) => {
      this.dropzone.removeFile(file);
      this.addFileToAddedList(file);
    });
  }

  ngAfterViewInit() {

  }

  addFileToAddedList(file) {
    const responseUrl = file.xhr.responseURL;
    const documentID = responseUrl.substr(
      responseUrl.lastIndexOf('/') + 1, responseUrl.indexOf('?X-Amz-Security-Token=') - (responseUrl.lastIndexOf('/') + 1)
    );
    this.apiService.getDocument(documentID, this).subscribe((data: any) => {
      if (data.documentId) {
        this.documentsAdded.push(data);
      }
    });
  }

  handleApiError(errorResponse: HttpErrorResponse) {
    return Observable.create((observer) => {
      observer.next(errorResponse);
    });
  }

}
