import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddComponent } from './pages/add/add.component';
import { ExploreComponent } from './pages/explore/explore.component';
import { InfoComponent } from './pages/info/info.component';

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
    path: ':id',
    component: InfoComponent,
    data: { title: 'Document Info' }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentExplorerRoutingModule { }
