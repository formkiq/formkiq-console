import {
  Injectable
} from '@angular/core';
import {
  Router
} from '@angular/router';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import {
  Observable,
  throwError
} from 'rxjs';
import {
  catchError,
} from 'rxjs/operators';
import { AuthenticationService } from '../plugins/authentication/services/authentication.service';
@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private router: Router, private authenticationService: AuthenticationService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.authenticationService.loggedInAccessToken) {
      this.authenticationService.checkLoginAndToken();
      return;
    }
    request = request.clone({
      setHeaders: {
        Authorization: this.authenticationService.loggedInAccessToken
      }
    });
    return next.handle(request).pipe(catchError(err => {
      console.log(err);
      if (err.status === 401 || err.status === 0) {
        this.router.navigate(['/login']);
      }
      const error = err.error.message || err.statusText;
      return throwError(error);
    }));
  }
}
