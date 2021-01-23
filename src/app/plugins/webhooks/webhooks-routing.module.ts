import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WebhooksComponent } from './pages/webhooks/webhooks.component';

const routes: Routes = [
  { path: '', redirectTo: 'webhooks', pathMatch: 'full' },
  {
    path: 'webhooks',
    component: WebhooksComponent,
    data: { title: 'Webhooks' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WebhooksRoutingModule { }
