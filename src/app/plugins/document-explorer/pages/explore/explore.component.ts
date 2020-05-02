import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ApiService, HttpErrorCallback } from '../../../../services/api.service';
import { Document } from '../../../../services/api.schema';
import { SearchbarComponent } from '../../components/searchbar/searchbar.component';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-docex-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit, AfterViewInit, HttpErrorCallback {

  results$: Observable<{} | Document[]>;
  dateSearchSubmitted = false;
  tagSearchSubmitted = false;
  shareUrl = '';
  @ViewChild('searchbar') searchbar: SearchbarComponent;

  constructor(
    private router: Router,
    private apiService: ApiService
  ) { }

  currentTimezone: string;

  ngOnInit() {
    this.currentTimezone = moment.tz.guess();
    if (!this.currentTimezone) {
      this.currentTimezone = 'America/New_York';
    }
  }

  ngAfterViewInit() {
    this.searchbar.dateFormSubmitted$.subscribe(
      (submitted) => {
        this.dateSearchSubmitted = submitted;
        this.results$ = null;
      });
    this.searchbar.tagFormSubmitted$.subscribe(
      (submitted) => {
        this.tagSearchSubmitted = submitted;
        this.results$ = null;
      });
  }

  addDocuments() {
    this.router.navigate(['/documents/add']);
  }

  displayResults(results) {
    this.dateSearchSubmitted = false;
    this.tagSearchSubmitted = false;
    this.results$ = Observable.create((observer) => {
      this.searchbar.nextToken = null;
      this.searchbar.previousToken = null;
      if (results.next) {
        this.searchbar.nextToken = results.next;
      }
      if (results.previous) {
        this.searchbar.previousToken = results.previous;
      }
      observer.next(results);
    });
  }

  loadPreviousPage() {
    if (this.searchbar.currentTab === 'date') {
      this.searchbar.loadPreviousDatePage();
      this.dateSearchSubmitted = true;
    } else if (this.searchbar.currentTab === 'tag') {
      this.searchbar.loadPreviousTagPage();
      this.tagSearchSubmitted = true;
    }
  }

  loadNextPage() {
    if (this.searchbar.currentTab === 'date') {
      this.searchbar.loadNextDatePage();
      this.dateSearchSubmitted = true;
    } else if (this.searchbar.currentTab === 'tag') {
      this.searchbar.loadNextTagPage();
      this.tagSearchSubmitted = true;
    }
  }

  shareDocument(documentId, content) {
    this.apiService.getDocumentUrl(documentId, this).subscribe((data: string) => {
      const shareInfo = JSON.parse(JSON.stringify(data));
      if (shareInfo.hasOwnProperty('url')) {
        this.shareUrl = shareInfo.url;
        // this.modalService.open(content, { centered: true, size: 'lg' });
      } else {
        this.shareUrl = '';
      }
    });
  }

  viewDocumentTags(documentId) {
    this.router.navigate(['/documents/' + documentId + '/tags']);
  }

  closeModal(event) {
    // this.modalService.dismissAll();
  }

  handleApiError(errorResponse: HttpErrorResponse) {
    return Observable.create((observer) => {
      observer.next(errorResponse);
    });
  }

}
