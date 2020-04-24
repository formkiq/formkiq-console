import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ApiExplorerRoutingModule } from './api-explorer-routing.module';
import { ApiItemComponent } from './components/api-item/api-item.component';
import { ExploreComponent } from './pages/explore/explore.component';


@NgModule({
  declarations: [ApiItemComponent, ExploreComponent],
  imports: [
    CommonModule,
    ApiExplorerRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ApiExplorerModule { }
