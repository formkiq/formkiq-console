import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../../../../services/api.service';
import { HttpErrorCallback } from '../../../../services/api.service';
import { Observable } from 'rxjs';
import * as Dropzone from '../../../../../assets/dist/dropzone/dropzone';

@Component({
  selector: 'app-docs-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit, AfterViewInit {

  @ViewChild('dropzone', {static: false}) dropzoneContainer: ElementRef;

  constructor(private apiService: ApiService) { }

  dropzone: Dropzone;

  ngOnInit() {
    this.dropzone = new Dropzone('div#dropzone', {
        url: '#',
        autoQueue: false,
        method: 'PUT'
      }
    );
    this.dropzone.on('addedfile', (file) => {
      file.putUrl = '';
      this.apiService.getDocumentsUpload(this).subscribe((data: any) => {
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
