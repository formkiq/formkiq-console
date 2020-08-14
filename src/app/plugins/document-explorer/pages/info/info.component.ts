import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from '../../../../services/api.service';
import { HttpErrorCallback } from '../../../../services/api.service';
import { Document, Tag } from '../../../../services/api.schema';

@Component({
  selector: 'app-docs-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit, AfterViewInit {

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
  ) { }

  documentId = '';
  currentDocument: any;
  documentUrl$: Observable<any>;
  documentEmbedUrl = '';
  quickLookExpanded = false;
  results$: any;
  form: FormGroup;
  tagToSearch: any;
  formSubmitted = false;
  isTagEditMode = false;
  nextToken = null;
  previousToken = null;

  ngOnInit() {
    this.form = this.formBuilder.group({
      tagKey: ['', Validators.required],
      tagValue: []
    });
    this.route.queryParams.subscribe(params => {
      if (params.tagToSearch) {
        this.tagToSearch = JSON.parse(params.tagToSearch);
      }
    });
    this.route.params.subscribe(params => {
      this.documentId = params.id;
      this.getDocument();
      this.loadTags();
    });
  }

  ngAfterViewInit() {
  }

  getDocument() {
    this.apiService.getDocument(this.documentId, this).subscribe(result => {
      this.currentDocument = result;
    });
  }

  loadTags(previousToken = '', nextToken = '') {
    this.previousToken = null;
    this.nextToken = null;
    let queryString = '';
    if (previousToken) {
      queryString += '?previous=' + previousToken;
    } else if (nextToken) {
      queryString += '?next=' + nextToken;
    }
    const container = this;
    this.isTagEditMode = false;
    this.results$ = this.apiService.getDocumentTags(this.documentId, queryString, this);
    this.results$.subscribe((result) => {
      if (result.previous) {
        this.previousToken = result.previous;
      }
      if (result.next) {
        this.nextToken = result.next;
      }
    });
  }

  get f() {
    return this.form.controls;
  }

  editTag(key, value) {
    this.isTagEditMode = true;
    this.form.reset();
    this.form.controls.tagKey.setValue(key);
    this.form.controls.tagValue.setValue(value);
    const formHeader = document.getElementById('formHeader');
    if (formHeader) {
      formHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  deleteTag(key) {
    if (confirm('Delete this tag?')) {
      this.apiService.deleteDocumentTag(this.documentId, key, this).subscribe((result) => {
        this.loadTags();
      });
    }
  }

  saveTag() {
    this.formSubmitted = true;
    if (this.form.invalid) {
      return;
    }
    const key = this.form.controls.tagKey.value;
    const value = this.form.controls.tagValue.value;
    const json = {
      key,
      value
    };
    this.apiService.postDocumentTag(this.documentId, JSON.stringify(json), this).subscribe((result) => {
      this.form.reset();
      this.formSubmitted = false;
      this.loadTags();
    });
  }

  cancelEdit() {
    this.isTagEditMode = false;
    this.form.reset();
  }

  handleApiError(errorResponse: HttpErrorResponse) {
    console.log(errorResponse);
    return Observable.create((observer) => {
      observer.next(errorResponse);
    });
  }

  loadPreviousPage() {
    if (this.previousToken) {
      this.loadTags(this.previousToken);
    }
  }

  loadNextPage() {
    if (this.nextToken) {
      this.loadTags('', this.nextToken);
    }
  }

  openForQuickLook() {
    document.getElementById('documentFrame').setAttribute('src', this.documentEmbedUrl);
    this.documentUrl$ = this.apiService.getDocumentUrl(this.currentDocument.documentId, '', this);
    this.documentUrl$.subscribe((result) => {
      if (result.url) {
        this.documentEmbedUrl = result.url;
        this.quickLookExpanded = true;
        document.getElementById('documentFrame').setAttribute('src', this.documentEmbedUrl);
        const heightAvailable = window.innerHeight - 240;
        document.getElementById('documentFrame').setAttribute('style', 'height: ' + heightAvailable + 'px');
      }
    });
  }

  closeQuickLook() {
    this.quickLookExpanded = false;
    document.getElementById('documentFrame').removeAttribute('src');
  }

  backToList() {
    if (this.tagToSearch && this.tagToSearch.key) {
      if (this.tagToSearch.key === 'untagged') {
        this.router.navigate(['/documents/explore/untagged']);
        return;
      }
    }
    this.router.navigate(['/documents']);
  }

}
