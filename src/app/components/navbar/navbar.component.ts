import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { timer, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthenticationService } from '../../plugins/authentication/services/authentication.service';
import { ConfigurationService } from '../../services/configuration.service';
import { LibraryService } from '../../services/library.service';
import { LoginResponse, LogoutResponse } from '../../plugins/authentication/services/authentication.schema';
import { NotificationService } from '../../services/notification.service';
import { NotificationInfo } from '../../services/notification.schema';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {

  public requireAuthenticationForRead: boolean = this.configurationService.authentication.requireAuthenticationForRead;

  @Input() isSidebarToggled: boolean;
  @Output() toggleSidebarEmitter: EventEmitter<any> = new EventEmitter();

  routeTitle = '';

  private authenticationPageLoadSubscription: Subscription = null;
  private authenticationChangeSubscription: Subscription = null;

  private notificationSubscription: Subscription = null;
  public notificationInfo: NotificationInfo = null;

  private loginResponseSubscription: Subscription = null;
  private loginResponse: LoginResponse = null;
  private logoutResponseSubscription: Subscription = null;
  private forgotPasswordResponseSubscription: Subscription = null;
  public registrationResponseSubscription: Subscription = null;

  showHamburgerButton = true;
  showDropdown = false;
  currentAuthenticationForm = 'login';

  currentRouteUrl = null;

  constructor(
    public authenticationService: AuthenticationService,
    private configurationService: ConfigurationService,
    private libraryService: LibraryService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const source = timer(0, 30000);
    this.libraryService.loadHamburgers();
    const subscribe = source.subscribe(intervalNum => {
      if (this.requireAuthenticationForRead) {
        this.authenticationService.checkLoginAndToken();
      }
    });
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
      ).subscribe((value: NavigationEnd) => {
        this.routeTitle = this.route.root.firstChild.snapshot.data.title;
        this.currentRouteUrl = value.url;
        if (value.url === '/authenticate') {
          if (this.isSidebarToggled) {
            this.toggleSidebar();
          }
          this.showHamburgerButton = false;
        } else {
          this.showDropdown = true;
          this.showHamburgerButton = true;
        }
      }
    );
    this.authenticationPageLoadSubscription = this.authenticationService.authenticationPageLoad$.subscribe(
      () => {
        setTimeout(() => {
          if (this.isSidebarToggled) {
            this.toggleSidebar();
          }
        });
      }
    );
    this.authenticationChangeSubscription = this.authenticationService.authenticationChange$.subscribe(
      () => {
        if (this.currentRouteUrl === '/authenticate') {
          if (this.isSidebarToggled) {
            this.toggleSidebar();
          }
          this.showDropdown = false;
          this.showHamburgerButton = false;
        } else {
          if (this.requireAuthenticationForRead) {
            this.router.navigate(['/authenticate']);
          } else {
            this.showDropdown = true;
            this.showHamburgerButton = true;
          }
        }
      }
    );
    this.notificationSubscription = this.notificationService.notification$.subscribe(
      (value: NotificationInfo) => {
        this.notificationInfo = value;
        if (this.notificationInfo.millisecondsUntilClose > 0) {
          setTimeout(() => this.notificationInfo = null, this.notificationInfo.millisecondsUntilClose);
        }
      });
    this.loginResponseSubscription = this.authenticationService.loginResponse$.subscribe(
      (value: LoginResponse) => {
        this.loginResponse = value;
        // TODO: check for last sidebar toggle status from user (local storage)
        if (this.loginResponse.success && this.hasSmallViewport) {
          if (!this.isSidebarToggled) {
            this.toggleSidebar();
          }
        }
      });
    this.logoutResponseSubscription = this.authenticationService.logoutResponse$.subscribe(
      (value: LogoutResponse) => {
        this.notificationService.createNotificationFromAuthenticationResponse(value);
        if (this.requireAuthenticationForRead) {
          this.router.navigate(['/authenticate']);
        }
      });
    this.forgotPasswordResponseSubscription = this.authenticationService.forgotPasswordResponse$.subscribe(
      (value) => {
        this.currentAuthenticationForm = 'login';
      });
    this.registrationResponseSubscription = this.authenticationService.registrationResponse$.subscribe(
      (value) => {
        this.currentAuthenticationForm = 'login';
      });
  }

  ngOnDestroy() {
    this.authenticationChangeSubscription.unsubscribe();
    this.authenticationPageLoadSubscription.unsubscribe();
    this.notificationSubscription.unsubscribe();
    this.loginResponseSubscription.unsubscribe();
    this.logoutResponseSubscription.unsubscribe();
    this.forgotPasswordResponseSubscription.unsubscribe();
    this.registrationResponseSubscription.unsubscribe();
  }

  toggleAuthenticationForm(authenticationForm: string) {
    this.currentAuthenticationForm = authenticationForm;
  }

  toggleSidebar() {
    this.toggleSidebarEmitter.emit();
  }

  hasSmallViewport() {
    return (window.innerWidth < 768);
  }

  signOut() {
    this.authenticationService.logout();
  }

  close(dropdown) {
    dropdown.close();
  }

}
