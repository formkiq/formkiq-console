import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ExploreComponent as ApiExploreComponent } from './plugins/api-explorer/pages/explore/explore.component';
import { AuthenticateComponent } from './plugins/authentication/pages/authenticate/authenticate.component';
import { ConfirmUserComponent } from './plugins/authentication/pages/confirm-user/confirm-user.component';
import { ResetPasswordComponent } from './plugins/authentication/pages/reset-password/reset-password.component';
import { ExploreComponent as DocumentsExploreComponent } from './plugins/document-explorer/pages/explore/explore.component';
import { AddComponent as DocumentsAddComponent } from './plugins/document-explorer/pages/add/add.component';
import { TagsComponent as DocumentsTagsComponent } from './plugins/document-explorer/pages/tags/tags.component';
import { ExploreComponent as UsersExploreComponent } from './plugins/user-explorer/pages/explore/explore.component';
import { AuthenticationGuardService } from './plugins/authentication/guards/authentication-guard.service';

const routerOptions: ExtraOptions = {
  useHash: false,
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled',
  scrollOffset: [0, 42]
};

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: { title: 'Dashboard' },
    canActivate: [AuthenticationGuardService]
  },
  {
    path: 'api',
    component: ApiExploreComponent,
    data: { title: 'API' },
    canActivate: [AuthenticationGuardService]
  },
  {
    path: 'authenticate',
    component: AuthenticateComponent,
    data: { title: 'Authentication' }
  },
  {
    path: 'confirmUser',
    component: ConfirmUserComponent,
    data: { title: 'Confirm Account' }
  },
  {
    path: 'resetPassword',
    component: ResetPasswordComponent,
    data: { title: 'Reset Password' }
  },
  {
    path: 'documents',
    component: DocumentsExploreComponent,
    data: { title: 'Documents' },
    canActivate: [AuthenticationGuardService]
  },
  {
    path: 'documents/add',
    component: DocumentsAddComponent,
    data: { title: 'Add Documents' },
    canActivate: [AuthenticationGuardService]
  },
  {
    path: 'documents/:id/tags',
    component: DocumentsTagsComponent,
    data: { title: 'Document Tags' },
    canActivate: [AuthenticationGuardService]
  },
  {
    path: 'users',
    component: UsersExploreComponent,
    data: { title: 'Users' },
    canActivate: [AuthenticationGuardService]
  },
  {
    path: 'signOut',
    component: AuthenticateComponent,
    data: { title: 'Authentication' }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
