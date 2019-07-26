import {
  BrowserModule
} from '@angular/platform-browser';
import {
  NgModule
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import {
  AppRoutingModule
} from './app-routing.module';
import {
  AppComponent
} from './app.component';
import {
  SearchbarComponent
} from './components/searchbar/searchbar.component';
import {
  LoginComponent
} from './pages/login/login.component';
import {
  ConsoleComponent
} from './pages/console/console.component';
import {
  HTTP_INTERCEPTORS,
  HttpClientModule
} from '@angular/common/http';
import {
  LogoutComponent
} from './pages/logout/logout.component';
import {
  FormkiqapiService
} from './components/formkiq/formkiqapi.service';
import {
  TokenInterceptor
} from './components/formkiq/token.interceptor';
import {
  UploadfileComponent
} from './components/uploadfile/uploadfile.component';
import {
  SpinnerComponent
} from './components/spinner/spinner.component';

@NgModule({
  declarations: [
    AppComponent,
    SearchbarComponent,
    ConsoleComponent,
    LoginComponent,
    LogoutComponent,
    UploadfileComponent,
    SpinnerComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    FormkiqapiService, {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}