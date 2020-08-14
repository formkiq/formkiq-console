import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ApiService, HttpErrorCallback } from '../../../../services/api.service';
import { LibraryService } from '../../../../services/library.service';
import { Document, Tag } from '../../../../services/api.schema';
import { NotificationService } from '../../../../services/notification.service';
import { NotificationInfoType } from '../../../../services/notification.schema';
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
    private notificationService: NotificationService,
    private searchService: SearchService
  ) {
    route.data.pipe().subscribe(routeData => {
    });
    route.params.subscribe(params => {
      if (params.id) {
        this.getDocumentFromId(params.id);
      } else {
        this.setUpUntaggedSearch();
      }
    });
  }

  searchQuery: any;
  results$: Observable<any>;
  tagResults$: Observable<any>;
  tags: Array<any>;
  loading$ = new Subject<boolean>();
  documentUrl$: Observable<any>;
  currentDocument: any;
  previousDocument: any;
  currentDocumentIsMarkedUntagged = false;
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

  setUpUntaggedSearch() {
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
    this.searchQuery = this.searchService.buildTagSearchQuery(searchParameters.tagQuery);
    const queryString = '?limit=' + this.resultsLimit;
    this.getNextUntaggedDocuments(queryString);
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

  getDocumentFromId(documentId) {
    this.apiService.getDocument(documentId, this).subscribe(result => {
      const document: any = result;
      if (document.documentId) {
        this.currentDocument = result;
        const documentResult = {
          documents: [
            this.currentDocument
          ]
        };
        this.results$ = Observable.create((observer) => {
          observer.next(documentResult);
          this.checkUntaggedStatus();
          this.loadTags();
          this.loadDocumentContent();
        });
      }
    });
  }

  getNextUntaggedDocuments(queryString) {
    this.loading$.next(true);
    this.results$ = this.apiService.postSearch(JSON.stringify(this.searchQuery), queryString, this);
    this.results$.subscribe((results) => {
      this.reachedEndOfUntaggedDocuments = false;
      if (!results.documents && !results.documents.length) {
        this.currentDocument = null;
      } else {
        results.documents.forEach(document => {
          if (!this.currentDocument && (!this.previousDocument || this.previousDocument.documentId !== document.documentId)) {
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
        if (!results.next) {
          this.reachedEndOfUntaggedDocuments = true;
          this.loading$.next(false);
          return false;
        }
        queryString = '?limit=' + this.resultsLimit + '&next=' + results.next;
        this.getNextUntaggedDocuments(queryString);
        return false;
      }
      this.checkUntaggedStatus();
      this.loadTags();
      this.loadDocumentContent();
    });
  }

  checkUntaggedStatus() {
    this.apiService.getDocumentTag(this.currentDocument.documentId, 'untagged', this).subscribe(result => {
      if (result.key) {
        this.currentDocumentIsMarkedUntagged = true;
      } else {
        this.currentDocumentIsMarkedUntagged = false;
      }
    });
  }

  loadDocumentContent() {
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
      this.tags = [];
      result.tags.forEach(tag => {
        this.tags.push(tag);
      });
      setTimeout(() => {
        this.setTextareaHeights();
        this.editTag(-1);
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

  editTag(tagIndex = -1) {
    const tagTable = document.getElementById('tag-table');
    if (!tagTable) {
      return false;
    }
    const tagRows = Array.from(tagTable.getElementsByTagName('TR'));
    tagRows.forEach((tagRow, index) => {
      const editDiv = Array.from(tagRow.getElementsByClassName('absolute'))[0];
      const columns = Array.from(tagRow.getElementsByTagName('TD'));
      const textareas = Array.from(tagRow.getElementsByTagName('TEXTAREA'));
      let tagKey = '';
      let tagValue = '';
      this.tags.forEach(tagResult => {
        if (tagRow.getAttribute('id') === 'tag-' + tagResult.key) {
          tagKey = tagResult.key;
          tagValue = tagResult.value;
          return false;
        }
      });
      if (index === tagIndex) {
        tagRow.classList.remove('bg-yellow-500');
        tagRow.classList.add('bg-white');
        if (editDiv) {
          editDiv.classList.add('hidden');
        }
        columns.forEach(column => {
          if (column.classList.contains('pl-1')) {
            column.classList.remove('pr-8');
          } else if (column.classList.contains('text-center')) {
            column.classList.remove('hidden');
            const saveButton = Array.from(column.getElementsByClassName('identifier-save-button'))[0];
            const tagValueTextarea = Array.from(
              tagRow.getElementsByClassName('identifier-tag-value-textarea') as HTMLCollectionOf<HTMLTextAreaElement>
            )[0];
            if (saveButton && tagValueTextarea) {
              tagValueTextarea.addEventListener(
                'keyup',
                (e: Event) => {
                  if (tagValue === tagValueTextarea.value) {
                    saveButton.classList.remove('bg-green-600', 'hover:bg-green-500');
                    saveButton.classList.add('bg-gray-500', 'hover:bg-gray-500');
                  } else {
                    saveButton.classList.remove('bg-gray-500', 'hover:bg-gray-500');
                    saveButton.classList.add('bg-green-600', 'hover:bg-green-500');
                  }
                }
              );
              saveButton.addEventListener(
                'click',
                (e: Event) => {
                  if (tagValue !== tagValueTextarea.value) {
                    this.saveTag(tagKey, tagValueTextarea.value);
                  }
                }
              );
            }
          }
        });
        textareas.forEach((textarea, textareaIndex) => {
          if (textareaIndex === 1) {
            textarea.removeAttribute('readonly');
            textarea.setAttribute('rows', '2');
            textarea.classList.remove('hidden', 'bg-transparent', 'resize-none');
            textarea.classList.add('bg-white', 'border', 'border-gray-600', 'text-gray-900', 'rounded-md', 'p-2');
          }
        });
      } else {
        if (tagRow.classList.contains('bg-white')) {
          tagRow.classList.remove('bg-white');
          tagRow.classList.add('bg-yellow-500');
        }
        if (editDiv) {
          editDiv.classList.remove('hidden');
        }
        columns.forEach(column => {
          if (column.classList.contains('pl-1')) {
            column.classList.add('pr-8');
          } else if (column.classList.contains('text-center')) {
            column.classList.add('hidden');
          }
        });
        textareas.forEach((textarea: HTMLTextAreaElement, textareaIndex) => {
          if (textareaIndex === 1) {
            if (tagValue) {
              textarea.value = tagValue;
            } else {
              textarea.value = '';
            }
            if (!textarea.value.length) {
              textarea.classList.add('hidden');
            }
            textarea.setAttribute('readonly', 'true');
            textarea.setAttribute('rows', '1');
            textarea.classList.add('bg-transparent', 'resize-none');
            textarea.classList.remove('bg-white', 'border', 'border-gray-600', 'text-gray-900', 'rounded-md', 'p-2');
          }
        });
      }
      this.setTextareaHeights();
    });
  }

  deleteTag(tagKey) {
    if (confirm('Are you sure you want to delete this tag? (cannot be undone)')) {
      this.apiService.deleteDocumentTag(this.currentDocument.documentId, tagKey, this).subscribe((result) => {
        this.notificationService.createNotification(
          NotificationInfoType.Success,
          result.message,
          2000,
          false
        );
        this.loadTags();
      });
    }
  }

  addTag() {
    if (this.form.invalid) {
      return false;
    }
    const key = this.form.controls.tagKey.value;
    const value = this.form.controls.tagValue.value;
    let json;
    if (value) {
      json = {
        key,
        value
      };
    } else {
      json = {
        key
      };
    }
    this.apiService.postDocumentTag(this.currentDocument.documentId, JSON.stringify(json), this).subscribe((result) => {
      this.form.reset();
      this.notificationService.createNotification(
        NotificationInfoType.Success,
        result.message,
        2000,
        false
      );
      this.loadTags();
    });
  }

  saveTag(key, value) {
    let json;
    if (value) {
      json = {
        key,
        value
      };
    } else {
      json = {
        key
      };
    }
    this.apiService.postDocumentTag(this.currentDocument.documentId, JSON.stringify(json), this).subscribe((result) => {
      this.form.reset();
      this.notificationService.createNotification(
        NotificationInfoType.Success,
        'Changes to Tag "' + key + '" have been saved.',
        2000,
        false
      );
      this.loadTags();
    });
  }

  markAsTagged() {
    this.apiService.deleteDocumentTag(this.currentDocument.documentId, 'untagged', this).subscribe(result => {
      this.previousDocument = this.currentDocument;
      this.currentDocument = null;
      this.getNextUntaggedDocuments('?limit=' + this.resultsLimit);
    });
  }

  handleApiError(errorResponse: HttpErrorResponse) {
    return Observable.create((observer) => {
      observer.next(errorResponse);
    });
  }

}
