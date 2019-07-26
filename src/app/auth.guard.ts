import {
  Injectable
} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import {
  Observable
} from 'rxjs';

import {
  AuthService
} from './auth.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authService.isLoggedIn()) {
      //if (state.url == "/login?return=%2F") {
      //console.log("YUP!");
      // this.router.navigate(['/']);
      //} else {
      //console.log("Logged in>" + state.url);
      return true;
      //}
    } else {
      this.router.navigate(['/login'], {
        queryParams: {
          return: state.url
        }
      });
      return false;
    }
  }
}