import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-authenticate',
  templateUrl: './authenticate.component.html',
  styleUrls: ['./authenticate.component.scss']
})
export class AuthenticateComponent implements OnInit, OnDestroy {

  currentAuthenticationForm = 'login';
  allowUserSelfRegistration = false;
  private email: string;
  private verificationCode: string;
  private forgotPasswordResponseSubscription: Subscription = null;
  private registrationResponseSubscription: Subscription = null;
  // private authenticationPageLoad$ = this.authenticationService.authenticationPageLoadSource.asObservable();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService
    ) { }

  ngOnInit() {
    this.allowUserSelfRegistration = this.authenticationService.allowUserSelfRegistration;
    this.route.queryParams.subscribe((params) => {
      if (params.action) {
        this.currentAuthenticationForm = params.action;
      }
      if (params.email) {
        this.email = params.email;
      }
      if (params.verificationCode) {
        this.verificationCode = params.verificationCode;
      }
    });
    if (this.authenticationService.loggedInUser != null) {
      this.router.navigate(['/']);
    }
    this.authenticationService.authenticationPageLoadSource.next();

    this.forgotPasswordResponseSubscription = this.authenticationService.forgotPasswordResponse$.subscribe(
      (value) => {
        this.currentAuthenticationForm = 'login';
    });
    this.registrationResponseSubscription = this.authenticationService.registrationResponse$.subscribe(
      (value) => {
        this.currentAuthenticationForm = 'login';
    });
  }

  ngOnDestroy() {
    this.forgotPasswordResponseSubscription.unsubscribe();
    this.registrationResponseSubscription.unsubscribe();
  }

  toggleAuthenticationForm(authenticationForm: string) {
    this.currentAuthenticationForm = authenticationForm;
  }

  revertToLogin() {
    this.currentAuthenticationForm = 'login';
  }

}
