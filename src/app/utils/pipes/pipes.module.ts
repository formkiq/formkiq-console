import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatetimeFormat } from './datetime-format';


@NgModule({
  declarations: [
    DatetimeFormat
  ],
  imports: [
    CommonModule
  ],
  exports: [
    DatetimeFormat
  ]
})
export class PipesModule { }
