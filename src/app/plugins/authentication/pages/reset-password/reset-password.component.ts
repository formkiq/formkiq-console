import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '../../services/authentication.service';
import { ResetPasswordResponse } from '../../services/authentication.schema';
import { NotificationService } from '../../../../services/notification.service';
import { NotificationInfoType } from '../../../../services/notification.schema';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private notificationService: NotificationService
  ) { }

  private clientId: string;
  private userName: string;
  private resetCode: string;

  private resetPasswordResponseSubscription: Subscription = null;
  private resetPasswordResponse: ResetPasswordResponse = null;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params.user_name) {
        if (/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/.test(params.user_name)) {
          this.userName = params.user_name;
        } else {
          this.notificationService.createNotification(
            NotificationInfoType.Warning,
            'Invalid user name provided.'
          );
          this.router.navigate(['/authenticate']);
        }
      }
      if (params.code) {
        this.resetCode = params.code;
      }
      if (this.userName && this.resetCode) {
        this.router.navigate(['/authenticate'], {
          queryParams:
          {
            action: 'changePassword',
            email: this.userName,
            verificationCode: this.resetCode
          }
        });
      }
    });
  }

}
