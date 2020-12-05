import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import * as moment from 'moment-timezone';

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

  currentTimezone: string;
  documentId = '';
  currentDocument: any;
  currentTab = 'metadata';
  showFormDataTab = false;
  showJsonDataTab = false;
  showViewDocumentTab = false;
  documentUrl$: Observable<any>;
  documentEmbedUrl = '';
  quickLookExpanded = false;
  quickLookLoaded = false;
  results$: any;
  form: FormGroup;
  tagToSearch: any;
  explorePagingToken: null;
  formSubmitted = false;
  isTagEditMode = false;
  nextToken = null;
  previousToken = null;

  ngOnInit() {
    this.currentTimezone = moment.tz.guess();
    if (!this.currentTimezone) {
      this.currentTimezone = 'America/New_York';
    }
    this.form = this.formBuilder.group({
      tagKey: ['', Validators.required],
      tagValue: []
    });
    this.route.queryParams.subscribe(params => {
      if (params.tagToSearch) {
        this.tagToSearch = JSON.parse(params.tagToSearch);
      }
      if (params.explorePagingToken) {
        this.explorePagingToken = params.explorePagingToken;
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
      if (this.currentDocument.contentType === 'application/json') {
        this.apiService.getDocumentContent(this.documentId, '', this).subscribe(result => {
          this.currentDocument.content = result.content;
          this.showJsonDataTab = true;
          if (this.currentDocument.content.formName) {
            this.showFormDataTab = true;
            this.changeTab('formData');
          } else {
            this.changeTab('jsonData');
          }
        });
      } else {
        this.showViewDocumentTab = true;
      }
    });
  }

  changeTab(currentTab) {
    this.currentTab = currentTab;
    if (currentTab === 'viewDocument') {
      this.openForQuickLook();
    } else {
      this.closeQuickLook();
    }
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
    if (!this.quickLookLoaded) {
      document.getElementById('documentFrame').setAttribute('src', this.documentEmbedUrl);
      this.documentUrl$ = this.apiService.getDocumentUrl(this.currentDocument.documentId, '', this);
      this.documentUrl$.subscribe((result) => {
        if (result.url) {
          this.documentEmbedUrl = result.url;
          this.quickLookExpanded = true;
          this.quickLookLoaded = true;
          document.getElementById('documentFrame').setAttribute('src', this.documentEmbedUrl);
          const heightAvailable = window.innerHeight - 240;
          document.getElementById('documentFrame').setAttribute('style', 'height: ' + heightAvailable + 'px');
        }
      });
    } else {
      this.quickLookExpanded = true;
    }
  }

  closeQuickLook() {
    this.quickLookExpanded = false;
  }

  backToList() {
    const queryParams: any = {};
    if (this.explorePagingToken) {
      queryParams.page = this.explorePagingToken;
    }
    if (this.tagToSearch && this.tagToSearch.key) {
      if (this.tagToSearch.key === 'untagged') {
        this.router.navigate(['/documents/explore/untagged'], { queryParams });
        return;
      }
    }
    this.router.navigate(['/documents'], { queryParams });
  }

}
