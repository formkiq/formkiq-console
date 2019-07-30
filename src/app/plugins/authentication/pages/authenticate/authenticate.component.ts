import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-authenticate',
  templateUrl: './authenticate.component.html',
  styleUrls: ['./authenticate.component.scss']
})
export class AuthenticateComponent implements OnInit, OnDestroy {

  currentAuthenticationForm = 'login';
  private forgotPasswordResponseSubscription: Subscription = null;
  private registrationResponseSubscription: Subscription = null;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService) { }

  ngOnInit() {
    if (this.authenticationService.loggedInUser != null) {
      this.router.navigate(['/']);
    }
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
