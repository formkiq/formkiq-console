import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '../../services/authentication.service';
import { MustMatch } from '../../helpers/must-match.validator';
import { ChangePasswordResponse } from '../../services/authentication.schema';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private notificationService: NotificationService
  ) { }

  public form: FormGroup;
  formSubmitted = false;
  get f() { return this.form.controls; }

  @Input() email: string;
  @Input() verificationCode: string;
  showVerificationCodeResendButton = false;
  private changePasswordResponseSubscription: Subscription = null;
  private changePasswordResponse: ChangePasswordResponse = null;
  @Output() cancelDropdownEmitter: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
    this.form = this.formBuilder.group({
      oldPassword: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      passwordConfirmation: ['', Validators.required]
    }, {
      validator: MustMatch('password', 'passwordConfirmation')
    });
    if (this.verificationCode) {
      this.f.oldPassword.setValue('PASSWORD');
    }
    this.changePasswordResponseSubscription = this.authenticationService.changePasswordResponse$.subscribe(
      (value: ChangePasswordResponse) => {
        this.changePasswordResponse = value;
        if (this.changePasswordResponse.requestNewVerificationCode) {
          this.showVerificationCodeResendButton = true;
        }
        this.notificationService.createNotificationFromAuthenticationResponse(value);
        if (this.changePasswordResponse.retryChangeForm) {
          this.f.password.setValue('');
          this.f.passwordConfirmation.setValue('');
        } else if (!this.changePasswordResponse.requestNewVerificationCode) {
          this.router.navigate(['/authenticate'], {
            queryParams:
            {
              action: 'login',
            }
          });
        }
      });

  }

  ngOnDestroy() {
    this.changePasswordResponseSubscription.unsubscribe();
  }

  changePassword() {
    this.formSubmitted = true;
    if (!this.f.oldPassword.errors && !this.f.password.errors && !this.f.passwordConfirmation.errors) {
      if (this.verificationCode) {
        this.authenticationService.confirmPassword(this.email, this.verificationCode, this.form.get('password').value);
      } else {
        this.authenticationService.changePassword(this.email, this.form.get('oldPassword').value, this.form.get('password').value);
      }
    }
  }

  cancel() {
    this.cancelDropdownEmitter.emit();
  }

  requestPasswordResetVerificationCodeResend() {
    this.authenticationService.requestPasswordResetVerificationCodeResend(this.email);
  }

}
