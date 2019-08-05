import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '../../services/authentication.service';
import { ConfirmationResponse } from '../../services/authentication.schema';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-confirm-user',
  templateUrl: './confirm-user.component.html',
  styleUrls: ['./confirm-user.component.scss']
})
export class ConfirmUserComponent implements OnInit, OnDestroy {

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private authenticationService: AuthenticationService,
      private notificationService: NotificationService
    ) { }

  private clientId: string;
  private userName: string;
  private confirmationCode: string;

  private confirmationResponseSubscription: Subscription = null;
  private confirmationResponse: ConfirmationResponse = null;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params.client_id) {
        this.clientId = params.client_id;
      }
      if (params.user_name) {
        this.userName = params.user_name;
      }
      if (params.confirmation_code) {
        this.confirmationCode = params.confirmation_code;
      }
      if (this.clientId && this.userName && this.confirmationCode) {
        this.authenticationService.confirmUser(this.userName, this.confirmationCode);
      }
    });
    this.confirmationResponseSubscription = this.authenticationService.confirmationResponse$.subscribe((value: ConfirmationResponse) => {
      this.confirmationResponse = value;
      this.notificationService.createNotificationFromAuthenticationResponse(this.confirmationResponse);
      this.router.navigate(['/authenticate']);
    });
  }

  ngOnDestroy() {
    this.confirmationResponseSubscription.unsubscribe();
  }

}
