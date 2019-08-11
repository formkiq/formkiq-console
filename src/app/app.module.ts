import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './plugins/authentication/components/login/login.component';
import { RegisterComponent } from './plugins/authentication/components/register/register.component';
import { ForgotPasswordComponent } from './plugins/authentication/components/forgot-password/forgot-password.component';
import { ConfirmUserComponent } from './plugins/authentication/pages/confirm-user/confirm-user.component';
import { AuthenticateComponent } from './plugins/authentication/pages/authenticate/authenticate.component';
import { ExploreComponent as ApiExploreComponent } from './plugins/api-explorer/pages/explore/explore.component';
import { ApiItemComponent } from './plugins/api-explorer/components/api-item/api-item.component';
import { ExploreComponent as DocsExploreComponent } from './plugins/document-explorer/pages/explore/explore.component';
import { AddComponent as DocsAddComponent } from './plugins/document-explorer/pages/add/add.component';
import { TagsComponent as DocsTagsComponent } from './plugins/document-explorer/pages/tags/tags.component';
import { SearchbarComponent as DocsSearchbarComponent } from './plugins/document-explorer/components/searchbar/searchbar.component';
import { ApiService } from './services/api.service';
import { TokenInterceptor } from './utils/token.interceptor';

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
    ConfirmUserComponent,
    AuthenticateComponent,
    ApiExploreComponent,
    ApiItemComponent,
    DocsExploreComponent,
    DocsAddComponent,
    DocsTagsComponent,
    DocsSearchbarComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    AngularFontAwesomeModule
  ],
  providers: [
    ApiService, {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
