import { Component, EventEmitter, OnInit, Input, Output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-share-modal',
  templateUrl: './share-modal.component.html',
  styleUrls: ['./share-modal.component.css']
})
export class ShareModalComponent implements OnInit, AfterViewInit {

  @Input() shareUrl = '';
  @Output() closeEmitter: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('shareUrlTextarea') textarea: ElementRef;

  constructor() {}

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.selectLink();
  }

  selectLink() {
    if (this.shareUrl.length > 0) {
      this.textarea.nativeElement.select();
    }
  }

  close() {
    this.closeEmitter.emit(true);
  }

}
