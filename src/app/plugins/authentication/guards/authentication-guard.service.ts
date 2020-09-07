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
    if (this.requireAuthenticationForRead) {
      const queryParams: any = {};
      if (next.routeConfig.path) {
        queryParams.rurl = next.routeConfig.path;
      }
      if (this.authenticationService.loggedInUser) {
        if (!this.authenticationService.loggedInAccessTokenTimeLeft) {
          this.authenticationService.verifyToken().subscribe((valid: boolean) => {
            return new Observable<boolean>((observer) => {
              if (!valid) {
                this.router.navigate(['/authenticate'], { queryParams });
              }
              observer.next(valid);
            });
          });
        } else {
          return true;
        }
      }
      this.router.navigate(['/authenticate'], { queryParams });
      return false;
    } else {
      return true;
    }
  }

}
