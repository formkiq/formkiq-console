import {
  Injectable
} from '@angular/core';
import {
  Router
} from "@angular/router";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import {
  Observable,
  throwError
} from 'rxjs';
import {
  catchError,
} from 'rxjs/operators';
import {
  AuthService
} from '../../auth.service';
@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private router: Router, private authService: AuthService) {}

  intercept(request: HttpRequest < any > , next: HttpHandler): Observable < HttpEvent < any >> {

    console.log("Token Interceptor: " + this.authService.getAccessToken());

    request = request.clone({
      setHeaders: {
        Authorization: this.authService.getAccessToken()
      }
    });

    return next.handle(request).pipe(catchError(err => {

      if (err.status === 401 || err.status === 0) {
        this.router.navigate(['/login']);
      }
      const error = err.error.message || err.statusText;
      return throwError(error);
    }));
  }
}