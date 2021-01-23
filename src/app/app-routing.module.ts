import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AuthenticateComponent } from './plugins/authentication/pages/authenticate/authenticate.component';
import { ConfirmUserComponent } from './plugins/authentication/pages/confirm-user/confirm-user.component';
import { ResetPasswordComponent } from './plugins/authentication/pages/reset-password/reset-password.component';
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
    loadChildren: () =>
      import('./plugins/api-explorer/api-explorer.module')
        .then(m => m.ApiExplorerModule),
    data: {
      title: 'API'
    },
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
    loadChildren: () =>
      import('./plugins/document-explorer/document-explorer.module')
        .then(m => m.DocumentExplorerModule),
    data: {
      title: 'Documents'
    },
    canActivate: [AuthenticationGuardService]
  },
  {
    path: 'tagging',
    loadChildren: () =>
      import('./plugins/tagging-tool/tagging-tool.module')
        .then(m => m.TaggingToolModule),
    data: {
      title: 'Documents'
    },
    canActivate: [AuthenticationGuardService]
  },
  {
    path: 'webhooks',
    loadChildren: () =>
      import('./plugins/webhooks/webhooks.module')
        .then(m => m.WebhooksModule),
    data: {
      title: 'Webhooks'
    },
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
