import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  currentTimezone: string;
  tagToSearch: any;
  dateSearchSubmitted = false;
  tagSearchSubmitted = false;
  showModal = false;
  shareUrl = '';
  @ViewChild('searchbar') searchbar: SearchbarComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {
    route.data.pipe().subscribe(routeData => {
      if (routeData && routeData.tagToSearch) {
        this.tagToSearch = routeData.tagToSearch;
      }
    });
  }


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
      if (this.searchbar) {
        this.searchbar.nextToken = null;
        this.searchbar.previousToken = null;
        if (results.next) {
          this.searchbar.nextToken = results.next;
        }
        if (results.previous) {
          this.searchbar.previousToken = results.previous;
        }
      }
      observer.next(results);
    });
  }

  loadPreviousPage() {
    if (this.searchbar.currentSearch === 'date') {
      this.searchbar.loadPreviousDatePage();
      this.dateSearchSubmitted = true;
    } else if (this.searchbar.currentSearch === 'tag') {
      this.searchbar.loadPreviousTagPage();
      this.tagSearchSubmitted = true;
    }
  }

  loadNextPage() {
    if (this.searchbar.currentSearch === 'date') {
      this.searchbar.loadNextDatePage();
      this.dateSearchSubmitted = true;
    } else if (this.searchbar.currentSearch === 'tag') {
      this.searchbar.loadNextTagPage();
      this.tagSearchSubmitted = true;
    }
  }

  shareDocument(documentId, content) {
    this.apiService.getDocumentUrl(documentId, '', this).subscribe((data: string) => {
      const shareInfo = JSON.parse(JSON.stringify(data));
      if (shareInfo.hasOwnProperty('url')) {
        this.shareUrl = shareInfo.url;
        this.showModal = true;
      } else {
        this.shareUrl = '';
      }
    });
  }

  viewDocumentTags(documentId) {
    const queryParams: any = {};
    if (this.tagToSearch) {
      queryParams.tagToSearch = JSON.stringify(this.tagToSearch);
    }
    this.router.navigate(['/documents/' + documentId], { queryParams });
  }

  openTaggingTool(documentId) {
    this.router.navigate(['/tagging/' + documentId ]);
  }

  handleApiError(errorResponse: HttpErrorResponse) {
    return Observable.create((observer) => {
      observer.next(errorResponse);
    });
  }

}
