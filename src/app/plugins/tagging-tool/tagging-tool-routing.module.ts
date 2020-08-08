import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ScreenComponent } from './pages/screen/screen.component';

const routes: Routes = [
  { path: '', redirectTo: 'screen', pathMatch: 'full' },
  {
    path: 'screen',
    component: ScreenComponent,
    data: { title: 'Tagging Tool' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaggingToolRoutingModule { }
