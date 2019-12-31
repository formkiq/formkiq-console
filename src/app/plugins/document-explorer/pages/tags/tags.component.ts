import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from '../../../../services/api.service';
import { HttpErrorCallback } from '../../../../services/api.service';
import { Document, Tag } from '../../../../services/api.schema';

@Component({
  selector: 'app-docs-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent implements OnInit, AfterViewInit {

  constructor(
      private router: Router,
      private formBuilder: FormBuilder,
      private apiService: ApiService,
      private route: ActivatedRoute,
    ) { }

  documentId = '';
  results$: any;
  addTagForm: FormGroup;
  submitted = false;
  isTagEditMode = false;
  nextToken = null;
  previousToken = null;

  ngOnInit() {
    this.loadTags();
    this.addTagForm = this.formBuilder.group({
      tagKey: ['', Validators.required],
      tagValue: []
    });
  }

  ngAfterViewInit() {
  }

  loadTags(previousToken = '', nextToken = '') {
    this.previousToken = null;
    this.nextToken = null;
    this.route.params.subscribe(params => {
      let queryString = '';
      if (previousToken) {
        queryString += '?previous=' + previousToken;
      } else if (nextToken) {
        queryString += '?next=' + nextToken;
      }
      this.documentId = params.id;
      const container = this;
      this.isTagEditMode = false;
      this.results$ = this.apiService.getDocumentTags(this.documentId, queryString, this);
      this.results$.subscribe((result) => {
        if (result.previous) {
          this.previousToken = result.previous;
        }
        if (result.next) {
          this.nextToken = result.next;
        }
      });
    });
  }

  get f() {
    return this.addTagForm.controls;
  }

  editTag(key, value) {
    this.isTagEditMode = true;
    this.addTagForm.reset();
    this.addTagForm.controls.tagKey.setValue(key);
    this.addTagForm.controls.tagValue.setValue(value);
  }

  deleteTag(key) {
    if (confirm('Delete this tag?')) {
      this.apiService.deleteDocumentTag(this.documentId, key, this).subscribe((result) => {
        console.log(result);
        this.loadTags();
      });
    }
  }

  saveTag() {
    this.submitted = true;
    if (this.addTagForm.invalid) {
      return;
    }
    const key = this.addTagForm.controls.tagKey.value;
    const value = this.addTagForm.controls.tagValue.value;
    const json = {
      key,
      value
    };
    this.apiService.postDocumentTag(this.documentId, JSON.stringify(json), this).subscribe((result) => {
      console.log(result);
      this.addTagForm.reset();
      this.submitted = false;
      this.loadTags();
    });
  }

  cancelEdit() {
    this.isTagEditMode = false;
    this.addTagForm.reset();
  }

  handleApiError(errorResponse: HttpErrorResponse) {
    console.log(errorResponse);
    return Observable.create((observer) => {
      observer.next(errorResponse);
    });
  }

  loadPreviousPage() {
    if (this.previousToken) {
      this.loadTags(this.previousToken);
    }
  }

  loadNextPage() {
    if (this.nextToken) {
      this.loadTags('', this.nextToken);
    }
  }

  backToList() {
    this.router.navigate(['/documents']);
  }

}
