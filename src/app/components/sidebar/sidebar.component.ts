import { Component, OnInit, Input, Output, EventEmitter, Injectable, ElementRef, Renderer2} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthenticationService } from '../../plugins/authentication/services/authentication.service';
import { NavigationService } from '../../services/navigation.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
@Injectable({
  providedIn: 'root'
})
export class SidebarComponent implements OnInit {

  @Input() isSidebarToggled: boolean;
  @Output() sidebarItemClickEmitter: EventEmitter<any> = new EventEmitter();

  currentUrl = '/';
  elements: ElementRef<any>[];

  constructor(
    private authenticationService: AuthenticationService,
    private navigationService: NavigationService,
    private router: Router,
    private renderer: Renderer2
    ) { }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
      ).subscribe((value: NavigationEnd) => {
        this.currentUrl = value.url;
      }
    );
  }

  emitSidebarItemClick(clickSource: Subject<any>) {
    if (clickSource && window.innerWidth > 480) {
      clickSource.next(true);
    } else {
      this.sidebarItemClickEmitter.emit();
    }
  }

  signOut() {
    this.authenticationService.logout();
  }

}
