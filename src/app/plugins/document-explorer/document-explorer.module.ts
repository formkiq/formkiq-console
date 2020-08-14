import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PagingModule } from '../../modules/paging/paging.module';
import { PipesModule } from '../../utils/pipes/pipes.module';
import { DocumentExplorerRoutingModule } from './document-explorer-routing.module';
import { SearchbarComponent } from './components/searchbar/searchbar.component';
import { ShareModalComponent } from './components/share-modal/share-modal.component';
import { AddComponent } from './pages/add/add.component';
import { ExploreComponent } from './pages/explore/explore.component';
import { TagsComponent } from './pages/tags/tags.component';


@NgModule({
  declarations: [
    SearchbarComponent,
    ShareModalComponent,
    AddComponent,
    ExploreComponent,
    TagsComponent
  ],
  imports: [
    CommonModule,
    PagingModule,
    PipesModule,
    DocumentExplorerRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class DocumentExplorerModule { }
