import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { Observable } from 'rxjs';
import AuthenticationConfigJson from '../config.json';
import { AuthenticationService } from '../services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuardService {

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router) { }

  private requireAuthenticationForRead = AuthenticationConfigJson.requireAuthenticationForRead;


  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.requireAuthenticationForRead && this.authenticationService.loggedInUser == null) {
      const queryParams: any = {};
      if (next.routeConfig.path) {
        queryParams.rurl = next.routeConfig.path;
      }
      this.router.navigate(['/authenticate'], { queryParams });
      return false;
    }
    return true;
  }

}
