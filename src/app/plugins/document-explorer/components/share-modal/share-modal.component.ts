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

  constructor() { }

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

  copyShareLinkToClipboard(clipboardMessage) {
    const shareUrlTextarea: HTMLTextAreaElement = document.getElementById('shareUrlTextarea') as HTMLTextAreaElement;
    console.log(shareUrlTextarea);
    shareUrlTextarea.select();
    shareUrlTextarea.setSelectionRange(0, 99999);
    document.execCommand("copy");
    const clipboardMessageElement = document.getElementById(clipboardMessage);
    if (clipboardMessageElement) {
      clipboardMessageElement.classList.remove('hidden');
      setTimeout(() => {
        clipboardMessageElement.classList.add('hidden');
      }, 1000);
    }
  }

}
