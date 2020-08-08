import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TaggingToolRoutingModule } from './tagging-tool-routing.module';
import { ScreenComponent } from './pages/screen/screen.component';


@NgModule({
  declarations: [
    ScreenComponent
  ],
  imports: [
    CommonModule,
    TaggingToolRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class TaggingToolModule { }
