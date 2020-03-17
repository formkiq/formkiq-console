import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { DocumentExplorerRoutingModule } from './document-explorer-routing.module';
import { DatetimeFormat } from '../../utils/pipes/datetime-format';
import { PagingComponent } from './components/paging/paging.component';
import { SearchbarComponent } from './components/searchbar/searchbar.component';
import { ShareModalComponent } from './components/share-modal/share-modal.component';
import { AddComponent } from './pages/add/add.component';
import { ExploreComponent } from './pages/explore/explore.component';
import { TagsComponent } from './pages/tags/tags.component';


@NgModule({
  declarations: [
    DatetimeFormat,
    PagingComponent,
    SearchbarComponent,
    ShareModalComponent,
    AddComponent,
    ExploreComponent,
    TagsComponent
  ],
  imports: [
    CommonModule,
    DocumentExplorerRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule
  ]
})
export class DocumentExplorerModule { }
