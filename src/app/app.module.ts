import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule, HttpBackend } from '@angular/common/http';
import { of, Observable, ObservableInput } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './plugins/authentication/components/login/login.component';
import { RegisterComponent } from './plugins/authentication/components/register/register.component';
import { ForgotPasswordComponent } from './plugins/authentication/components/forgot-password/forgot-password.component';
import { ChangePasswordComponent } from './plugins/authentication/components/change-password/change-password.component';
import { ConfirmUserComponent } from './plugins/authentication/pages/confirm-user/confirm-user.component';
import { ResetPasswordComponent } from './plugins/authentication/pages/reset-password/reset-password.component';
import { AuthenticateComponent } from './plugins/authentication/pages/authenticate/authenticate.component';
import { ApiService } from './services/api.service';
import { ConfigurationService } from './services/configuration.service';
import { TokenInterceptor } from './utils/token.interceptor';

export function load(httpBackend: HttpBackend, config: ConfigurationService): (() => Promise<boolean>) {
  return (): Promise<boolean> => {
    return new Promise<boolean>((resolve: (a: boolean) => void): void => {
      const http = new HttpClient(httpBackend);
      http.get('./config.json')
        .pipe(
          map((x: ConfigurationService) => {
            config.apigateway = x.apigateway;
            config.cognito = x.cognito;
            config.version = x.version;
            resolve(true);
          }),
          catchError((x: { status: number }, caught: Observable<void>): ObservableInput<{}> => {
            if (x.status !== 404) {
              resolve(false);
            }
            resolve(true);
            return of({});
          })
        ).subscribe();
    });
  };
}

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SidebarComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ChangePasswordComponent,
    ConfirmUserComponent,
    ResetPasswordComponent,
    AuthenticateComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [{
    provide: APP_INITIALIZER,
    deps: [
      HttpBackend,
      ConfigurationService
    ],
    useFactory: load,
    multi: true
  }, {
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptor,
    multi: true
  },
    ApiService,
    ConfigurationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
