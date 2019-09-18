import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-paging',
  templateUrl: './paging.component.html',
  styleUrls: ['./paging.component.css']
})
export class PagingComponent {

  constructor() { }

  @Input() results: {
    next: null,
    previous: null
  };
  @Output() previousEmitter: EventEmitter<any> = new EventEmitter();
  @Output() nextEmitter: EventEmitter<any> = new EventEmitter();

  previous() {
    this.previousEmitter.emit();
  }

  next() {
    this.nextEmitter.emit();
  }

}
