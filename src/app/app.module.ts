import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule, HttpBackend } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { of, Observable, ObservableInput } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { ChartsModule } from 'ng2-charts';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './plugins/authentication/components/login/login.component';
import { RegisterComponent } from './plugins/authentication/components/register/register.component';
import { ForgotPasswordComponent } from './plugins/authentication/components/forgot-password/forgot-password.component';
import { ChangePasswordComponent } from './plugins/authentication/components/change-password/change-password.component';
import { ConfirmUserComponent } from './plugins/authentication/pages/confirm-user/confirm-user.component';
import { AuthenticateComponent } from './plugins/authentication/pages/authenticate/authenticate.component';
import { ExploreComponent as ApiExploreComponent } from './plugins/api-explorer/pages/explore/explore.component';
import { ApiItemComponent } from './plugins/api-explorer/components/api-item/api-item.component';
import { ExploreComponent as DocsExploreComponent } from './plugins/document-explorer/pages/explore/explore.component';
import { AddComponent as DocsAddComponent } from './plugins/document-explorer/pages/add/add.component';
import { TagsComponent as DocsTagsComponent } from './plugins/document-explorer/pages/tags/tags.component';
import { SearchbarComponent as DocsSearchbarComponent } from './plugins/document-explorer/components/searchbar/searchbar.component';
import { ShareModalComponent as DocsShareModalComponent } from './plugins/document-explorer/components/share-modal/share-modal.component';
import { ApiService } from './services/api.service';
import { ConfigurationService } from './services/configuration.service';
import { TokenInterceptor } from './utils/token.interceptor';
import { PagingComponent } from './plugins/document-explorer/components/paging/paging.component';

export function load(httpBackend: HttpBackend, config: ConfigurationService): (() => Promise<boolean>) {
  return (): Promise<boolean> => {
    return new Promise<boolean>((resolve: (a: boolean) => void): void => {
      const http = new HttpClient(httpBackend);
      http.get('./config.json')
        .pipe(
          map((x: ConfigurationService) => {
            config.apigateway = x.apigateway;
            config.cognito = x.cognito;
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
    SpinnerComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ChangePasswordComponent,
    ConfirmUserComponent,
    AuthenticateComponent,
    ApiExploreComponent,
    ApiItemComponent,
    DocsExploreComponent,
    DocsAddComponent,
    DocsTagsComponent,
    DocsSearchbarComponent,
    DocsShareModalComponent,
    PagingComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    AngularFontAwesomeModule,
    ChartsModule
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
export class AppModule {}
