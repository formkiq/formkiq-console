import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'FormKiQ Stacks Console';

  public isSidebarToggled = true;

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
