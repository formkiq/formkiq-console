import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService, HttpErrorCallback } from '../../../../services/api.service';
import { NavigationService } from '../../../../services/navigation.service';
import { Document } from '../../../../services/api.schema';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css']
})
export class SearchbarComponent implements OnInit, HttpErrorCallback {

  results$: Observable<{} | Document[]>;
  tagsearchForm: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private navigationService: NavigationService
    ) {}

  ngOnInit() {
    this.tagsearchForm = this.formBuilder.group({
      tagKey: ['', Validators.required],
      searchType: [],
      tagValue: []
    });
  }

  search() {
    this.submitted = true;
    if (this.tagsearchForm.invalid) {
      return;
    }
    const key = this.tagsearchForm.controls.tagKey.value;
    const value = this.tagsearchForm.controls.tagValue.value;
    let searchTag = new SearchTag(key, null, null);
    if (value != null && value.trim().length > 0) {
      const searchType = this.tagsearchForm.controls.searchType.value;
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
  }

  get f() {
    return this.tagsearchForm.controls;
  }

  viewTodaysDocuments() {

  }

  viewAllUntaggedDocuments() {

  }

  runTagSearch() {

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
