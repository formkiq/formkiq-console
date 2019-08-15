import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Document } from '../../../../services/api.schema';
import { SearchbarComponent } from '../../components/searchbar/searchbar.component';

@Component({
  selector: 'app-docex-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit, AfterViewInit {

  results$: Observable<{} | Document[]>;
  dateSearchSubmitted = false;
  tagSearchSubmitted = false;
  @ViewChild('searchbar', {static: false}) searchbar: SearchbarComponent;

  constructor(private router: Router) {}

  ngOnInit() {
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
    if (this.searchbar.currentSearch === 'date') {
      this.searchbar.loadPreviousDatePage();
    } else if (this.searchbar.currentSearch === 'tag') {
      this.searchbar.loadPreviousTagPage();
    }
  }

  loadNextPage() {
    if (this.searchbar.currentSearch === 'date') {
      this.searchbar.loadNextDatePage();
    } else if (this.searchbar.currentSearch === 'tag') {
      this.searchbar.loadNextTagPage();
    }
  }

  viewDocumentTags(documentId) {
    this.router.navigate(['/documents/' + documentId + '/tags']);
  }

}
