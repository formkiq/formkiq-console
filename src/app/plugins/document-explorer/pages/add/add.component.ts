import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../../../../services/api.service';
import { Observable } from 'rxjs';
import * as Dropzone from '../../../../../assets/dist/dropzone/dropzone';

@Component({
  selector: 'app-docs-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit, AfterViewInit {

  @ViewChild('dropzone') dropzoneContainer: ElementRef;

  constructor(private apiService: ApiService) { }

  dropzone: Dropzone;

  ngOnInit() {
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
      console.log(xhr);
      const xhrSend = xhr.send;
      xhr.send = () => {
        xhrSend.call(xhr, file);
      };
    });
  }

  ngAfterViewInit() {

  }

  handleApiError(errorResponse: HttpErrorResponse) {
    return Observable.create((observer) => {
      observer.next(errorResponse);
    });
  }

}
