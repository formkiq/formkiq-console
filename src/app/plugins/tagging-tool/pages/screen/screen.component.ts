import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import * as ExpiredStorage from 'expired-storage';
import { ApiService, HttpErrorCallback } from '../../../../services/api.service';
import { ConfigurationService } from '../../../../services/configuration.service';
import { LibraryService } from '../../../../services/library.service';
import { Preset } from '../../../../services/api.schema';
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

  private expiredStorage: ExpiredStorage;
  private presetCacheInSeconds = 120; // two minutes

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private configurationService: ConfigurationService,
    private libraryService: LibraryService,
    private notificationService: NotificationService,
    private searchService: SearchService
  ) {
    this.expiredStorage = new ExpiredStorage();
    route.data.pipe().subscribe(routeData => {
    });
    route.params.subscribe(params => {
      if (params.id) {
        this.getDocumentFromId(params.id);
      } else {
        this.setUpUntaggedSearch();
      }
      this.getCurrentTaggingPreset();
    });
  }

  searchQuery: any;
  taggingPresetResults$: Observable<any>;
  taggingPresets: Array<Preset>;
  currentTaggingPreset = null;
  showAddTagFormOnPreset = false;
  presetTags: Array<any>;
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
    this.loadTaggingPresets();
  }

  ngAfterViewInit() {
  }

  get f() {
    return this.form.controls;
  }

  getCurrentTaggingPreset() {
    let presetId = '';
    const presetTags = [];
    const taggingPresetSelect = document.getElementById('taggingPresets') as HTMLSelectElement;
    if (taggingPresetSelect && taggingPresetSelect.selectedIndex !== -1) {
      presetId = taggingPresetSelect.options[taggingPresetSelect.selectedIndex].value;
      const filteredPresets = this.taggingPresets.filter((preset: Preset) => preset.id === presetId);
      if (filteredPresets.length) {
        this.currentTaggingPreset = filteredPresets[0];
      } else {
        this.currentTaggingPreset = null;
      }
    } else {
      this.currentTaggingPreset = null;
    }
    this.setTextareaHeights(100);
  }

  loadTaggingPresets() {
    this.taggingPresets = [];
    if (this.expiredStorage.getItem('presets')) {
      this.taggingPresets = this.expiredStorage.getJson('presets');
      return true;
    }
    if (
      this.configurationService.formkiqEdition && 
      (this. configurationService.formkiqEdition === 'pro' || this. configurationService.formkiqEdition === 'enterprise')
      ) {
      this.apiService.getAllPresets('', this).subscribe((result) => {
        const presetResponse: any = result;
        if (presetResponse.presets) {
          const presetTagPromises: Promise<any>[]  = [];
          presetResponse.presets.forEach((preset: Preset) => {
            presetTagPromises.push(new Promise((resolve) => {
              this.apiService.getPresetTags(preset.id, '', this).subscribe((tagsResult) => {
                const presetTagsResult: any = tagsResult;
                if (presetTagsResult.tags) {
                  preset.tags = presetTagsResult.tags;
                }
                this.taggingPresets.push(preset);
                resolve();
              });
            }));
          });
          Promise.all(presetTagPromises).then(() => {
            this.sortByName(this.taggingPresets);
            this.expiredStorage.setJson('presets', this.taggingPresets, this.presetCacheInSeconds);
          });
        }
      });
    }
  }

  sortByName(arrayToSort) {
    arrayToSort.sort((a, b) =>
      (a.name).localeCompare(
        b.name
      )
    );
  }

  setUpUntaggedSearch() {
    const tagQuery: TagQuery = {
      key: 'untagged',
      operator: 'eq',
      value: 'true'
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

  setTextareaHeights(timeout = 1) {
    setTimeout(() => {
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
    }, timeout);
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
    if (!this.searchQuery) {
      this.router.navigate(['/tagging']);
      return true;
    }
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
        if (tag.key === 'TAGGING:presetId') {
          const matchingPresets = this.taggingPresets.filter((preset) => preset.id === tag.value);
          if (matchingPresets.length) {
            const taggingPresetSelect = document.getElementById('taggingPresets') as HTMLSelectElement;
            Array.from(taggingPresetSelect.options).forEach((option, index) => {
              if (option.value === matchingPresets[0].id) {
                taggingPresetSelect.selectedIndex = index;
                this.getCurrentTaggingPreset();
              }
            });
          }
        }
      });
      this.setTextareaHeights(100);
      this.editTag(-1);
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
          1000,
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
        1000,
        false
      );
      this.loadTags();
    });
  }

  savePresetTags() {
    const presetTagTable = document.getElementById('preset-tag-table');
    if (!presetTagTable) {
      // TODO: add error message
      return true;
    }
    const presetTagTableRows = Array.from(presetTagTable.getElementsByTagName('TR'));
    if (!presetTagTableRows) {
      // TODO: add error message
      return true;
    }
    const presetTagSavePromises: Promise<any>[]  = [];
    presetTagTableRows.forEach((tableRow) => {
      const keyFields = Array.from(tableRow.getElementsByTagName('TEXTAREA'));
      if (keyFields && keyFields.length === 2) {
        const key = keyFields[0].innerHTML;
        const value = (keyFields[1] as HTMLTextAreaElement).value;
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
        presetTagSavePromises.push(new Promise((resolve) => {
          this.apiService.postDocumentTag(this.currentDocument.documentId, JSON.stringify(json), this).subscribe((result) => {
            // TODO: handle bad result
            resolve();
          });
        }));
      }
    });
    presetTagSavePromises.push(new Promise((resolve) => {
      this.buildPresetSavePromise(resolve);
    }));
    Promise.all(presetTagSavePromises).then(() => {
      this.notificationService.createNotification(
        NotificationInfoType.Success,
        'Tags for "' + this.currentTaggingPreset.name + '" have been saved.',
        2000,
        false
      );
      this.loadTags();
    });
  }

  buildPresetSavePromise(resolve) {
    if (this.currentDocument) {
      if (this.currentTaggingPreset) {
        const matchingPresetTags = this.tags.filter((tag) =>
          tag.key === 'TAGGING:presetId' && tag.value === this.currentTaggingPreset.id
        );
        if (!matchingPresetTags.length) {
          const json = {
            key: 'TAGGING:presetId',
            value: this.currentTaggingPreset.id
          };
          this.apiService.postDocumentTag(this.currentDocument.documentId, JSON.stringify(json), this).subscribe((result) => {
            resolve();
          });
        } else {
          resolve();
        }
      } else {
        const presetTags = this.tags.filter((tag) =>
          tag.key === 'TAGGING:presetId'
        );
        if (presetTags.length) {
          this.apiService.deleteDocumentTag(this.currentDocument.documentId, 'TAGGING:presetId', this).subscribe((result) => {
            resolve();
          });
        } else {
          resolve();
        }
      }
    } else {
      resolve();
    }
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
      this.notificationService.createNotification(
        NotificationInfoType.Success,
        'Changes to Tag "' + key + '" have been saved.',
        2000,
        false
      );
      this.loadTags();
    });
  }

  getTagValueIfExists(key) {
    let value = '';
    const matchedPresetTags = this.tags.filter((tag) => {
      return tag.key === key;
    });
    if (matchedPresetTags.length) {
      value = matchedPresetTags[0].value;
    }
    return value;
  }

  isTagInPreset(key) {
    if (!this.currentTaggingPreset || !this.currentTaggingPreset.tags) {
      return false;
    }
    const matchedPresetTags = this.currentTaggingPreset.tags.filter((tag) => {
      return tag.key === key;
    });
    if (matchedPresetTags.length) {
      return true;
    }
    return false;
  }

  markAsTagged() {
    const tagsAdded = this.tags.filter((tag) => tag.key !== 'untagged');
    let readyToMarkAsTagged = false;
    if (tagsAdded.length) {
      readyToMarkAsTagged = true;
    } else {
      readyToMarkAsTagged = confirm('Are you sure you want to mark as tagged? You have not added any tags to this document.');
    }
    if (!readyToMarkAsTagged) {
      return true;
    }
    const documentTagDeletePromises: Promise<any>[]  = [];
    documentTagDeletePromises.push(new Promise((resolve) => {
      this.buildPresetSavePromise(resolve);
    }));
    documentTagDeletePromises.push(new Promise((resolve) => {
      this.apiService.deleteDocumentTag(this.currentDocument.documentId, 'untagged', this).subscribe(result => {
        resolve();
      });
    }));
    Promise.all(documentTagDeletePromises).then(() => {
      this.previousDocument = this.currentDocument;
      this.currentDocument = null;
      this.getNextUntaggedDocuments('?limit=' + this.resultsLimit);
    });
  }

  viewInfo() {
    this.router.navigate([`/documents/${this.currentDocument.documentId}`]);
  }

  copyToClipboard(value, clipboardMessage) {
    const copyInputElement: HTMLInputElement = document.createElement('INPUT') as HTMLInputElement;
    copyInputElement.value = value;
    const body = document.getElementsByTagName('BODY')[0];
    body.appendChild(copyInputElement);
    copyInputElement.select();
    copyInputElement.setSelectionRange(0, 99999);
    document.execCommand("copy");
    body.removeChild(copyInputElement);
    const clipboardMessageElement = document.getElementById(clipboardMessage);
    if (clipboardMessageElement) {
      clipboardMessageElement.classList.remove('hidden');
      setTimeout(() => {
        clipboardMessageElement.classList.add('hidden');
      }, 1000);
    }
  }

  showInfoModal() {
    if (localStorage.getItem('hasShownTaggingToolInfoModal')) {
      return false;
    }
    return true;
  }

  closeInfoModal() {
    localStorage.setItem('hasShownTaggingToolInfoModal', 'TRUE');
  }

  handleApiError(errorResponse: HttpErrorResponse) {
    return Observable.create((observer) => {
      observer.next(errorResponse);
    });
  }

}
