import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PagingModule } from '../../modules/paging/paging.module';
import { PipesModule } from '../../utils/pipes/pipes.module';
import { WebhooksRoutingModule } from './webhooks-routing.module';
import { WebhooksComponent } from './pages/webhooks/webhooks.component';


@NgModule({
  declarations: [
    WebhooksComponent
  ],
  imports: [
    CommonModule,
    PagingModule,
    PipesModule,
    WebhooksRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class WebhooksModule { }
