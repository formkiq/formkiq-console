import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService, HttpErrorCallback } from '../../../../services/api.service';
import { NavigationService } from '../../../../services/navigation.service';
import { Document } from '../../../../services/api.schema';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css']
})
export class SearchbarComponent implements OnInit, HttpErrorCallback {

  results$: Observable<{} | Document[]>;
  dateSearchForm: FormGroup;
  tagSearchForm: FormGroup;

  public dateFormSubmittedSource = new Subject<boolean>();
  public dateFormSubmitted$ = this.dateFormSubmittedSource.asObservable();
  public tagFormSubmittedSource = new Subject<boolean>();
  public tagFormSubmitted$ = this.tagFormSubmittedSource.asObservable();

  @ViewChild('d', {static: false}) dp: NgbInputDatepicker;
  @Output() documentQueryResultEmitter: EventEmitter<any> = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private navigationService: NavigationService,
    private router: Router
    ) {}

  ngOnInit() {
    this.dateSearchForm = this.formBuilder.group({
      dp: []
    });
    this.tagSearchForm = this.formBuilder.group({
      tagKey: ['', Validators.required],
      searchType: [],
      tagValue: []
    });
    this.tagSearchForm.get('searchType').setValue('eq');
  }

  get f() {
    return this.tagSearchForm.controls;
  }

  onDateSelected(event) {
    const documentDate = this.buildDocumentDate(event.year, event.month, event.day);
    this.runDateSearch(documentDate);
  }

  viewTodaysDocuments() {
    const now = new Date();
    const todayForPicker = {year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate()};
    this.dp.writeValue(todayForPicker);
    this.dateSearchForm.get('dp').setValue(todayForPicker);
    const documentDate = this.buildDocumentDate(todayForPicker.year, todayForPicker.month, todayForPicker.day);
    this.runDateSearch(documentDate);
    this.runDateSearch(documentDate);
  }

  buildDocumentDate(year, month, day) {
    return year + '-' + ('0' + month).slice(-2) + '-' + ('0' + day).slice(-2);
  }

  viewAllUntaggedDocuments() {
    this.tagSearchForm.get('tagKey').setValue('untagged');
    this.tagSearchForm.get('searchType').setValue('eq');
    this.tagSearchForm.get('tagValue').setValue('');
    this.runTagSearch();
  }

  runDateSearch(documentDate) {
    const dateRegExp = new RegExp('\\d{4}-\\d{2}-\\d{2}');
    if (!dateRegExp.test(documentDate)) {
      // TODO: make date field invalid
      return;
    }
    this.results$ = this.apiService.getAllDocuments('?date=' + documentDate, this);
    this.results$.subscribe((results) => {
      this.documentQueryResultEmitter.emit(results);
    });
  }

  runTagSearch() {
    if (this.tagSearchForm.invalid) {
      return;
    }
    this.tagFormSubmittedSource.next(true);
    const key = this.tagSearchForm.controls.tagKey.value;
    const value = this.tagSearchForm.controls.tagValue.value;
    let searchTag = new SearchTag(key, null, null);
    if (value != null && value.trim().length > 0) {
      const searchType = this.tagSearchForm.controls.searchType.value;
      if (searchType === 'beginsWith') {
        searchTag = new SearchTag(key, null, value.trim());
      } else {
        searchTag = new SearchTag(key, value.trim(), null);
      }
    }
    const searchQuery = {
      query: {
        tag: searchTag
      }
    };
    this.results$ = this.apiService.postSearch(JSON.stringify(searchQuery), this);
    this.results$.subscribe((results) => {
      this.documentQueryResultEmitter.emit(results);
    });
  }

  viewDocumentTags(documentId) {
    this.router.navigate(['/documents/' + documentId + '/tags']);
  }

  handleApiError(errorResponse: HttpErrorResponse) {
    return Observable.create((observer) => {
      observer.next(errorResponse);
    });
  }

}

export class SearchTag {
  constructor(
    public key: string,
    public eq: string,
    public beginsWith: string
  ) {}
}
