import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '../../services/authentication.service';
import { NotificationService } from '../../../../services/notification.service';
import { LoginResponse } from '../../services/authentication.schema';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  @Input() isDropdown = false;

  public form: FormGroup;
  formSubmitted = false;
  get f() { return this.form.controls; }

  redirectPath = '/';

  private loginResponseSubscription: Subscription = null;
  private loginResponse: LoginResponse = null;
  @Output() cancelDropdownEmitter: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.loginResponseSubscription = this.authenticationService.loginResponse$.subscribe(
      (value: LoginResponse) => {
        if (value.forcePasswordChange) {
          this.redirectPath += '/authenticate';
          this.router.navigate([this.redirectPath], {
            queryParams:
            {
              action: 'changePassword',
              email: value.email
            }
          });
        } else {
          this.route.queryParams.subscribe(params => {
            if (params.rurl) {
              this.redirectPath += params.rurl;
            }
            this.loginResponse = value;
            this.notificationService.createNotificationFromAuthenticationResponse(value);
            this.router.navigate([this.redirectPath]);
          });
        }
      });
  }

  ngOnDestroy() {
    this.loginResponseSubscription.unsubscribe();
  }

  signIn() {
    this.formSubmitted = true;
    if (!this.f.email.errors && !this.f.password.errors) {
      this.authenticationService.login(this.form.get('email').value, this.form.get('password').value);
    }
  }

  cancel() {
    this.cancelDropdownEmitter.emit();
  }

}
