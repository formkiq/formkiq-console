import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ApiService, HttpErrorCallback } from '../../../../services/api.service';
import { ConfigurationService } from '../../../../services/configuration.service';
import { LibraryService } from '../../../../services/library.service';
import { NotificationService } from '../../../../services/notification.service';
import { NotificationInfoType } from '../../../../services/notification.schema';

@Component({
  selector: 'app-webhooks',
  templateUrl: './webhooks.component.html',
  styleUrls: ['./webhooks.component.scss']
})
export class WebhooksComponent implements OnInit, AfterViewInit, HttpErrorCallback {

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private configurationService: ConfigurationService,
    private libraryService: LibraryService,
    private notificationService: NotificationService,
  ) {
  }

  showWebhookAddForm = false;
  webhookResults$: Observable<any>;
  webhooks: Array<any>;
  loading$ = new Subject<boolean>();
  form: FormGroup;

  ngOnInit() {
    this.libraryService.loadFontAwesome();
    this.form = this.formBuilder.group({
      name: ['', Validators.required]
    });
    this.loadWebhooks();
  }

  ngAfterViewInit() {
  }

  get f() {
    return this.form.controls;
  }

  sortByName(arrayToSort) {
    arrayToSort.sort((a, b) =>
      (a.name).localeCompare(
        b.name
      )
    );
  }

  loadWebhooks() {
    this.webhookResults$ = this.apiService.getAllWebhooks('', this);
    this.webhookResults$.subscribe((result) => {
      this.webhooks = result.webhooks;
      this.sortByName(this.webhooks);
    });
  }

  addWebhook() {
    if (this.form.invalid) {
      return;
    }
    const name = this.form.controls.name.value;
    const json = {
      name
    };
    this.apiService.postWebhook(JSON.stringify(json), this).subscribe((result) => {
      this.notificationService.createNotification(
        NotificationInfoType.Success,
        'Webhook added successfully',
        1000,
        false
      );
      this.form.reset();
      this.showWebhookAddForm = false;
      this.loadWebhooks();
    });
  }

  deleteWebhook(webhookId) {
    if (confirm('Are you sure you want to delete this webhook? (cannot be undone)')) {
      this.apiService.deleteWebhook(webhookId, this).subscribe((result) => {
        this.notificationService.createNotification(
          NotificationInfoType.Success,
          result.message,
          1000,
          false
        );
        this.loadWebhooks();
      });
    }
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

  handleApiError(errorResponse: HttpErrorResponse) {
    return Observable.create((observer) => {
      observer.next(errorResponse);
    });
  }

}
