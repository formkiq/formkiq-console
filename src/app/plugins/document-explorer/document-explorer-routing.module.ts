import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddComponent } from './pages/add/add.component';
import { ExploreComponent } from './pages/explore/explore.component';
import { TagsComponent } from './pages/tags/tags.component';

const routes: Routes = [
  { path: '', redirectTo: 'explore', pathMatch: 'full' },
  {
    path: 'explore',
    component: ExploreComponent,
    data: { title: 'Documents' }
  },
  {
    path: 'explore/untagged',
    component: ExploreComponent,
    data: {
      title: 'Untagged Documents',
      tagToSearch: {
        key: 'untagged'
      }
    }
  },
  {
    path: 'add',
    component: AddComponent,
    data: { title: 'Add Documents' }
  },
  {
    path: ':id/tags',
    component: TagsComponent,
    data: { title: 'Document Tags' }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentExplorerRoutingModule { }
