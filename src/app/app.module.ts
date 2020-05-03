import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule, HttpBackend } from '@angular/common/http';
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
import { LibraryService } from './services/library.service';
import { TokenInterceptor } from './utils/token.interceptor';

export function load(libraryService: LibraryService): (() => Promise<boolean>) {
  return (): Promise<boolean> => libraryService.loadConfig();
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
      LibraryService
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
