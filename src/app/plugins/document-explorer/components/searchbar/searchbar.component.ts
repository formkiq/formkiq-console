import { Component, EventEmitter, OnInit, Input, Output, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService, HttpErrorCallback } from '../../../../services/api.service';
import { NavigationService } from '../../../../services/navigation.service';
import { Document } from '../../../../services/api.schema';
import { SearchService } from '../../services/search.service';
import { TagQuery, SearchParameters, SearchType } from '../../services/search.schema';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss']
})
export class SearchbarComponent implements OnInit, AfterViewInit, HttpErrorCallback {

  results$: Observable<{} | Document[]>;
  dateSearchForm: FormGroup;
  tagSearchForm: FormGroup;

  public dateFormSubmittedSource = new Subject<boolean>();
  public dateFormSubmitted$ = this.dateFormSubmittedSource.asObservable();
  public tagFormSubmittedSource = new Subject<boolean>();
  public tagFormSubmitted$ = this.tagFormSubmittedSource.asObservable();

  public searchParameters: SearchParameters = {
    documentDate: null,
    tagQuery: null,
    searchType: SearchType.Tag
  };

  public nextToken = null;
  public previousToken = null;
  private reloadLastSearch = false;

  @Input() currentTimezone: string;
  // @ViewChild('d') dp: NgbInputDatepicker;
  @Output() documentQueryResultEmitter: EventEmitter<any> = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    public navigationService: NavigationService,
    private searchService: SearchService,
    private router: Router
  ) { }

  public get currentSearch(): string {
    return this.searchParameters.searchType;
  }

  ngOnInit() {
    this.dateSearchForm = this.formBuilder.group({
      dp: []
    });
    this.tagSearchForm = this.formBuilder.group({
      tagKey: ['', Validators.required],
      operator: [],
      tagValue: []
    });
    if (localStorage.getItem('documentSearchParameters')) {
      this.searchParameters = JSON.parse(localStorage.getItem('documentSearchParameters'));
      this.reloadLastSearch = true;
    }
    this.tagSearchForm.get('operator').setValue('eq');
    if (this.searchParameters.documentDate) {
      const todayForPicker = this.searchService.splitDocumentDate(this.searchParameters.documentDate);
      // this.dateSearchForm.get('dp').setValue(todayForPicker);
    } else if (this.searchParameters.tagQuery) {
      if (this.searchParameters.tagQuery.key) {
        this.tagSearchForm.get('tagKey').setValue(this.searchParameters.tagQuery.key);
        if (this.searchParameters.tagQuery.value) {
          this.tagSearchForm.get('tagValue').setValue(this.searchParameters.tagQuery.value);
        }
      }
      if (this.searchParameters.tagQuery.operator) {
        this.tagSearchForm.get('operator').setValue(this.searchParameters.tagQuery.operator);
      }
    }
  }

  ngAfterViewInit() {
    if (this.reloadLastSearch) {
      if (this.currentSearch === 'date') {
        this.runDateSearch(this.searchParameters.documentDate);
      } else {
        this.runTagSearch(this.searchParameters.tagQuery);
      }
    } else {
      this.viewTodaysDocuments();
    }
    if (this.searchParameters.documentDate) {
      const todayForPicker = this.searchService.splitDocumentDate(this.searchParameters.documentDate);
      // this.dp.writeValue(todayForPicker);
    }
  }

  get f() {
    return this.tagSearchForm.controls;
  }

  onDateSelected(event) {
    const documentDate: string = this.searchService.buildDocumentDate(event.year, event.month, event.day);
    this.runDateSearch(documentDate);
  }

  viewTodaysDocuments() {
    const now = new Date();
    const todayForPicker = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
    // this.dp.writeValue(todayForPicker);
    // this.dateSearchForm.get('dp').setValue(todayForPicker);
    const documentDate: string = this.searchService.buildDocumentDate(todayForPicker.year, todayForPicker.month, todayForPicker.day);
    this.runDateSearch(documentDate);
  }

  viewAllUntaggedDocuments() {
    this.tagSearchForm.get('tagKey').setValue('untagged');
    this.tagSearchForm.get('operator').setValue('eq');
    this.tagSearchForm.get('tagValue').setValue('');
    this.runTagSearch();
  }

  runDateSearch(documentDate: string, previousToken = '', nextToken = '') {
    this.searchParameters.documentDate = null;
    this.searchParameters.tagQuery = null;
    const dateRegExp = new RegExp('\\d{4}-\\d{2}-\\d{2}');
    if (!dateRegExp.test(documentDate)) {
      // TODO: make date field invalid
      return;
    }
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
    localStorage.setItem('documentSearchParameters', JSON.stringify(this.searchParameters));
    const searchQuery = this.searchService.buildTagSearchQuery(this.searchParameters.tagQuery);
    this.results$ = this.apiService.postSearch(JSON.stringify(searchQuery), queryString, this);
    this.results$.subscribe((results) => {
      this.documentQueryResultEmitter.emit(results);
    });
  }

  public loadNextTagPage() {
    this.runTagSearch(this.searchParameters.tagQuery, '', this.nextToken);
  }

  public loadPreviousTagPage() {
    this.runTagSearch(this.searchParameters.tagQuery, this.previousToken);
  }

  handleApiError(errorResponse: HttpErrorResponse) {
    return Observable.create((observer) => {
      observer.next(errorResponse);
    });
  }

}
