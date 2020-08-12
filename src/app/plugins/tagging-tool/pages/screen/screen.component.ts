import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ApiService, HttpErrorCallback } from '../../../../services/api.service';
import { LibraryService } from '../../../../services/library.service';
import { Document, Tag } from '../../../../services/api.schema';
import { SearchService } from '../../services/search.service';
import { TagQuery, SearchParameters, SearchType } from '../../services/search.schema';

@Component({
  selector: 'app-tagtool-screen',
  templateUrl: './screen.component.html',
  styleUrls: ['./screen.component.scss']
})
export class ScreenComponent implements OnInit, AfterViewInit, HttpErrorCallback {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private libraryService: LibraryService,
    private searchService: SearchService
  ) {
    route.data.pipe().subscribe(routeData => {
    });
  }

  results$: Observable<any>;
  tagResults$: Observable<any>;
  loading$ = new Subject<boolean>();
  documentUrl$: Observable<any>;
  currentDocument: any;
  documentEmbedUrl = '';
  resultsLimit = 20;
  reachedEndOfUntaggedDocuments = false;
  form: FormGroup;
  tagPreviousToken = null;
  tagNextToken = null;

  ngOnInit() {
    this.libraryService.loadFontAwesome();
    const event = new Event('requestSidebarClose');
    window.dispatchEvent(event);
    const tagQuery: TagQuery = {
      key: 'untagged',
      operator: 'eq',
      value: ''
    };
    const searchParameters: SearchParameters = {
      searchType: SearchType.Tag,
      documentDate: null,
      tagQuery
    };
    const searchQuery = this.searchService.buildTagSearchQuery(searchParameters.tagQuery);
    const queryString = '?limit=' + this.resultsLimit;
    this.getNextUntaggedDocuments(searchQuery, queryString);
    this.form = this.formBuilder.group({
      tagKey: ['', Validators.required],
      tagValue: []
    });
  }

  ngAfterViewInit() {
  }

  get f() {
    return this.form.controls;
  }

  setTextareaHeights() {
    const textareaElements = Array.from(document.getElementsByTagName('TEXTAREA'));
    textareaElements.forEach( (element: HTMLTextAreaElement) => {
      element.setAttribute('style', 'height: auto');
      element.setAttribute('style', 'height: ' + (element.scrollHeight + 10) + 'px');
      element.addEventListener(
        'dblclick', () => {
        element.select();
        }
      );
    });
  }

  getNextUntaggedDocuments(searchQuery, queryString) {
    this.loading$.next(true);
    this.results$ = this.apiService.postSearch(JSON.stringify(searchQuery), queryString, this);
    this.results$.subscribe((results) => {
      this.reachedEndOfUntaggedDocuments = false;
      if (!results.documents && !results.documents.length) {
        this.currentDocument = null;
      } else {
        results.documents.forEach(document => {
          if (!this.currentDocument) {
            let canEmbed = false;
            if (document.contentType) {
              // TODO: add other content types
              switch (document.contentType) {
                case 'application/pdf':
                  canEmbed = true;
                  break;
                case 'text/html':
                  canEmbed = true;
                  break;
              }
            }
            if (canEmbed) {
              this.currentDocument = document;
              return false;
            }
          }
        });
      }
      if (!this.currentDocument) {
        console.log('need another page');
        if (!results.next) {
          this.reachedEndOfUntaggedDocuments = true;
          this.loading$.next(false);
          return false;
        }
        queryString = '?limit=' + this.resultsLimit + '&next=' + results.next;
        this.getNextUntaggedDocuments(searchQuery, queryString);
        return false;
      }
      this.loadTags();
      this.documentUrl$ = this.apiService.getDocumentUrl(this.currentDocument.documentId, '', this);
      this.documentUrl$.subscribe((result) => {
        this.loading$.next(false);
        if (result.url) {
          this.documentEmbedUrl = result.url;
          document.getElementById('documentFrame').setAttribute('src', this.documentEmbedUrl);
          const heightAvailable = window.innerHeight - 240;
          document.getElementById('documentFrame').setAttribute('style', 'height: ' + heightAvailable + 'px');
        }
      });
    });
  }

  loadTags(previousToken = '', nextToken = '') {
    this.tagPreviousToken = null;
    this.tagNextToken = null;
    let queryString = '?limit=5';
    if (previousToken) {
      queryString += '&previous=' + previousToken;
    } else if (nextToken) {
      queryString += '&next=' + nextToken;
    }
    this.tagResults$ = this.apiService.getDocumentTags(this.currentDocument.documentId, queryString, this);
    this.tagResults$.subscribe((result) => {
      if (result.previous) {
        this.tagPreviousToken = result.previous;
      }
      if (result.next) {
        this.tagNextToken = result.next;
      }
      setTimeout(() => {
        this.setTextareaHeights();
      }, 100);
    });
  }

  loadPreviousTagPage() {
    if (this.tagPreviousToken) {
      this.loadTags(this.tagPreviousToken);
    }
  }

  loadNextTagPage() {
    if (this.tagNextToken) {
      this.loadTags('', this.tagNextToken);
    }
  }

  handleApiError(errorResponse: HttpErrorResponse) {
    return Observable.create((observer) => {
      observer.next(errorResponse);
    });
  }

}
