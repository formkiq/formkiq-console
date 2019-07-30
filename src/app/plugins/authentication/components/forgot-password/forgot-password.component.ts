import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '../../services/authentication.service';
import { ForgotPasswordResponse } from '../../services/authentication.schema';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {

  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private notificationService: NotificationService
    ) { }

  public form: FormGroup;
  formSubmitted = false;
  get f() { return this.form.controls; }

  private forgotPasswordResponseSubscription: Subscription = null;
  private forgotPasswordResponse: ForgotPasswordResponse = null;
  @Output() cancelDropdownEmitter: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]]
    });
    this.forgotPasswordResponseSubscription = this.authenticationService.forgotPasswordResponse$.subscribe(
      (value: ForgotPasswordResponse) => {
        this.forgotPasswordResponse = value;
        this.notificationService.createNotificationFromAuthenticationResponse(value);
    });
  }

  ngOnDestroy() {
    this.forgotPasswordResponseSubscription.unsubscribe();
  }

  checkIfEmailStillInvalid(emailTooltip) {
    if (!this.f.email.errors) {
      emailTooltip.close();
    }
  }

  resetPassword(emailTooltip) {
    this.formSubmitted = true;
    emailTooltip.close();
    if (!this.f.email.errors) {
      this.authenticationService.forgotPassword(this.form.get('email').value);
    } else {
      if (this.f.email.errors) {
        emailTooltip.open();
      }
    }
  }

  cancel() {
    this.cancelDropdownEmitter.emit();
  }

}
