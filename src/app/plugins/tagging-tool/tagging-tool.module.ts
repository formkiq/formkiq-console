import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PagingModule } from '../../modules/paging/paging.module';
import { PipesModule } from '../../utils/pipes/pipes.module';
import { TaggingToolRoutingModule } from './tagging-tool-routing.module';
import { ScreenComponent } from './pages/screen/screen.component';


@NgModule({
  declarations: [
    ScreenComponent
  ],
  imports: [
    CommonModule,
    PagingModule,
    PipesModule,
    TaggingToolRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class TaggingToolModule { }
