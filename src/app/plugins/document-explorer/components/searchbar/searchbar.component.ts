import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService, HttpErrorCallback } from '../../../../services/api.service';
import { NavigationService } from '../../../../services/navigation.service';
import { Document, Tag } from '../../../../services/api.schema';
import { SearchService } from '../../services/search.service';
import { TagQuery, SearchParameters, SearchType } from '../../services/search.schema';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss']
})
export class SearchbarComponent implements OnInit, HttpErrorCallback {

  @Input() currentTimezone: string;
  @Input() tagToSearch: any;
  @Output() documentQueryResultEmitter: EventEmitter<any> = new EventEmitter();

  showSearchFields = true;
  currentTab = 'date';
  public searchParameters: SearchParameters = {
    documentDate: null,
    documentId: null,
    tagQuery: null,
    searchType: SearchType.Tag
  };

  public dateSearchForm: FormGroup;
  public dateFormSubmittedSource = new Subject<boolean>();
  public dateFormSubmitted$ = this.dateFormSubmittedSource.asObservable();
  showPicker = false;
  dateForPicker: any = null;
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  blankDaysBeforeMonth = [];
  daysInMonth = Array.from(
    { length: 30 },
    (v, k) => k + 1
  );

  public tagSearchForm: FormGroup;
  public tagFormSubmittedSource = new Subject<boolean>();
  public tagFormSubmitted$ = this.tagFormSubmittedSource.asObservable();

  public idSearchForm: FormGroup;
  public idFormSubmittedSource = new Subject<boolean>();
  public idFormSubmitted$ = this.idFormSubmittedSource.asObservable();

  results$: Observable<{} | Document[]>;
  public nextToken = null;
  public previousToken = null;

  public get currentSearch(): string {
    return this.searchParameters.searchType;
  }

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    public navigationService: NavigationService,
    private searchService: SearchService,
    private router: Router
  ) { }

  ngOnInit() {
    this.dateSearchForm = this.formBuilder.group({
      date: ['', [Validators.required, Validators.pattern('\\d{4}-\\d{2}-\\d{2}')]]
    });
    this.tagSearchForm = this.formBuilder.group({
      tagKey: ['', Validators.required],
      operator: [],
      tagValue: []
    });
    this.idSearchForm = this.formBuilder.group({
      documentId: ['', [Validators.minLength(16), Validators.required]]
    });
    const now = new Date();
    this.dateForPicker = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
    this.calculatePickerDays();
    this.tagSearchForm.get('operator').setValue('eq');
    if (this.tagToSearch) {
      const tagQuery: TagQuery = {
        key: this.tagToSearch.key,
        operator: 'eq',
        value: ''
      };
      if (this.tagToSearch.operator) {
        tagQuery.operator = this.tagToSearch.operator;
      }
      if (this.tagToSearch.value) {
        tagQuery.value = this.tagToSearch.value;
      }
      this.searchParameters = {
        searchType: SearchType.Tag,
        documentDate: null,
        documentId: null,
        tagQuery
      };
      if (tagQuery.key === 'untagged') {
        this.showSearchFields = false;
      }
    } else if (localStorage.getItem('documentSearchParameters')) {
      this.searchParameters = JSON.parse(localStorage.getItem('documentSearchParameters'));
    }
    if (this.searchParameters.documentDate) {
      this.setCurrentTab('date');
      this.dateForPicker = this.searchService.splitDocumentDate(this.searchParameters.documentDate);
      this.calculatePickerDays();
      this.runDateSearch();
    } else if (this.searchParameters.tagQuery) {
      this.setCurrentTab('tag');
      if (this.searchParameters.tagQuery.key) {
        this.tagSearchForm.get('tagKey').setValue(this.searchParameters.tagQuery.key);
        if (this.searchParameters.tagQuery.value) {
          this.tagSearchForm.get('tagValue').setValue(this.searchParameters.tagQuery.value);
        }
      }
      if (this.searchParameters.tagQuery.operator) {
        this.tagSearchForm.get('operator').setValue(this.searchParameters.tagQuery.operator);
      }
      this.runTagSearch();
    } else if (this.searchParameters.documentId) {
      this.setCurrentTab('id');
      this.idSearchForm.get('documentId').setValue(this.searchParameters.documentId);
      this.runIdSearch();
    }
  }

  setCurrentTab(tab: string) {
    this.currentTab = tab;
  }

  setDateForPickerFromDateInput() {
    if (this.dateSearchForm.controls.date.valid) {
      this.dateForPicker = this.searchService.splitDocumentDate(this.dateSearchForm.controls.date.value);
      this.calculatePickerDays();
    }
  }

  setDateForPickerFromPicker(dayOfMonth) {
    this.dateForPicker.day = dayOfMonth;
    this.calculatePickerDays();
  }

  calculatePickerDays() {
    const daysInMonth = new Date(this.dateForPicker.year, this.dateForPicker.month + 1, 0).getDate();
    const dayOfWeek = new Date(this.dateForPicker.year, this.dateForPicker.month).getDay();
    this.blankDaysBeforeMonth = [];
    for (let i = 1; i <= dayOfWeek; i++) {
      this.blankDaysBeforeMonth.push(i);
    }
    this.daysInMonth = [];
    for (let i = 1; i <= daysInMonth; i++) {
      this.daysInMonth.push(i);
    }
    this.dateSearchForm.controls.date.setValue(
      this.dateForPicker.year + '-' + ('0' + this.dateForPicker.month).slice(-2) + '-' + ('0' + this.dateForPicker.day).slice(-2)
    );
  }

  previousMonth() {
    this.dateForPicker.month--;
    if (this.dateForPicker.month < 1) {
      this.dateForPicker.month = 12;
      this.dateForPicker.year--;
    }
    this.calculatePickerDays();
  }

  nextMonth() {
    this.dateForPicker.month++;
    if (this.dateForPicker.month > 12) {
      this.dateForPicker.month = 1;
      this.dateForPicker.year++;
    }
    this.calculatePickerDays();
  }

  runDateSearch(documentDate: string = '', previousToken = '', nextToken = '') {
    if (documentDate === '') {
      documentDate = this.searchService.buildDocumentDate(
        this.dateForPicker.year, this.dateForPicker.month, this.dateForPicker.day
      );
    }
    this.searchParameters.documentDate = null;
    this.searchParameters.tagQuery = null;
    const currentUtcOffset = moment(documentDate).tz(this.currentTimezone).format('Z');
    let queryString = '?date=' + documentDate + '&tz=' + currentUtcOffset;
    if (nextToken !== '') {
      queryString += '&next=' + nextToken;
    }
    if (previousToken !== '') {
      queryString += '&previous=' + previousToken;
    }
    this.dateFormSubmittedSource.next(true);
    this.searchParameters.searchType = SearchType.Date;
    this.searchParameters.documentDate = documentDate;
    localStorage.setItem('documentSearchParameters', JSON.stringify(this.searchParameters));
    this.results$ = this.apiService.getAllDocuments(queryString, this);
    this.results$.subscribe((results) => {
      this.documentQueryResultEmitter.emit(results);
    });
  }

  viewTodaysDocuments() {
    const now = new Date();
    this.dateForPicker = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
    this.calculatePickerDays();
    this.runDateSearch();
  }

  public loadNextDatePage() {
    this.runDateSearch(this.searchParameters.documentDate, '', this.nextToken);
  }

  public loadPreviousDatePage() {
    this.runDateSearch(this.searchParameters.documentDate, this.previousToken);
  }

  runTagSearch(tagQuery: TagQuery = null, previousToken = '', nextToken = '') {
    let queryString = '';
    if (tagQuery) {
      this.searchParameters.tagQuery = tagQuery;
      if (previousToken) {
        queryString = '?previous=' + previousToken;
      } else if (nextToken) {
        queryString = '?next=' + nextToken;
      }
    } else {
      this.searchParameters.tagQuery = null;
      this.searchParameters.documentDate = null;
      if (this.tagSearchForm.invalid) {
        return;
      }
      this.tagFormSubmittedSource.next(true);
      let key = this.tagSearchForm.controls.tagKey.value;
      const operator = this.tagSearchForm.controls.operator.value;
      let value = this.tagSearchForm.controls.tagValue.value;
      if (key && key.length > 0) {
        key = key.trim();
      }
      if (value && value.length > 0) {
        value = value.trim();
      }
      this.searchParameters.tagQuery = new TagQuery(key, operator, value);
    }
    this.searchParameters.searchType = SearchType.Tag;
    if (this.searchParameters.tagQuery.key !== 'untagged') {
      localStorage.setItem('documentSearchParameters', JSON.stringify(this.searchParameters));
    }
    const searchQuery = this.searchService.buildTagSearchQuery(this.searchParameters.tagQuery);
    this.results$ = this.apiService.postSearch(JSON.stringify(searchQuery), queryString, this);
    this.results$.subscribe((results) => {
      this.documentQueryResultEmitter.emit(results);
    });
  }

  viewAllUntaggedDocuments() {
    this.router.navigate(['/documents/explore/untagged']);
  }

  public loadNextTagPage() {
    this.runTagSearch(this.searchParameters.tagQuery, '', this.nextToken);
  }

  public loadPreviousTagPage() {
    this.runTagSearch(this.searchParameters.tagQuery, this.previousToken);
  }

  runIdSearch() {
    if (this.idSearchForm.invalid) {
      return;
    }
    this.idFormSubmittedSource.next(true);
    let documentId = this.idSearchForm.controls.documentId.value;
    if (documentId && documentId.length > 0) {
      documentId = documentId.trim();
    }
    this.results$ = this.apiService.getDocument(documentId, this);
    this.results$.subscribe((results: any) => {
      if (results.documentId) {
        const documents = {
          documents: [
            results
          ]
        };
        this.searchParameters.documentDate = null;
        this.searchParameters.documentId = results.documentId;
        this.searchParameters.tagQuery = null;
        this.searchParameters.searchType = SearchType.Id;
        localStorage.setItem('documentSearchParameters', JSON.stringify(this.searchParameters));
        this.documentQueryResultEmitter.emit(documents);
      } else {
        this.documentQueryResultEmitter.emit({documents: []});
      }
    });
  }

  handleApiError(errorResponse: HttpErrorResponse) {
    return Observable.create((observer) => {
      observer.next(errorResponse);
    });
  }

}
