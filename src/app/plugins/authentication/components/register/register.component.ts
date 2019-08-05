import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '../../services/authentication.service';
import { NotificationService } from '../../../../services/notification.service';
import { MustMatch } from '../../helpers/must-match.validator';
import { RegistrationResponse } from '../../services/authentication.schema';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {

  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private notificationService: NotificationService
    ) { }

  public form: FormGroup;
  formSubmitted = false;
  get f() { return this.form.controls; }

  private registrationResponseSubscription: Subscription = null;
  private registrationResponse: RegistrationResponse = null;
  @Output() cancelDropdownEmitter: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      passwordConfirmation: ['', Validators.required]
    }, {
      validator: MustMatch('password', 'passwordConfirmation')
    });
    this.registrationResponseSubscription = this.authenticationService.registrationResponse$.subscribe((value: RegistrationResponse) => {
      this.registrationResponse = value;
      this.notificationService.createNotificationFromAuthenticationResponse(
        value,
        3500
      );
    });
  }

  ngOnDestroy() {
    this.registrationResponseSubscription.unsubscribe();
  }

  checkIfEmailStillInvalid(emailTooltip) {
    if (!this.f.email.errors) {
      emailTooltip.close();
    }
  }

  checkIfPasswordStillInvalid(passwordTooltip) {
    if (!this.f.password.errors) {
      passwordTooltip.close();
    }
  }

  checkIfPasswordConfirmationStillInvalid(passwordConfirmationTooltip) {
    if (!this.f.passwordConfirmation.errors) {
      passwordConfirmationTooltip.close();
    }
  }

  createAccount(emailTooltip, passwordTooltip, passwordConfirmationTooltip) {
    this.formSubmitted = true;
    emailTooltip.close();
    passwordTooltip.close();
    passwordConfirmationTooltip.close();
    if (!this.f.email.errors && !this.f.password.errors && !this.f.passwordConfirmation.errors) {
      this.authenticationService.register(this.form.get('email').value, this.form.get('password').value);
    } else {
      if (this.f.email.errors) {
        emailTooltip.open();
      }
      if (this.f.password.errors) {
        passwordTooltip.open();
      }
      if (this.f.passwordConfirmation.errors) {
        passwordConfirmationTooltip.open();
      }
    }
  }

  cancel() {
    this.cancelDropdownEmitter.emit();
  }

}
