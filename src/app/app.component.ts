import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'FormKiQ Stacks Console';

  public isSidebarToggled = true;

  ngOnInit() {
    window.addEventListener(
      'requestSidebarClose',
      (e: Event) => {
        if (this.isSidebarToggled) {
          setTimeout(() => {
            this.isSidebarToggled = false;
          }, 100);
        }
      }
    );
  }

  toggleSidebar() {
    if (this.isSidebarToggled) {
      this.isSidebarToggled = false;
    } else {
      this.isSidebarToggled = true;
    }
  }

  onSidebarItemClick() {
    if (window.innerWidth < 768) {
      if (this.isSidebarToggled) {
        this.toggleSidebar();
      }
    }
  }

}
