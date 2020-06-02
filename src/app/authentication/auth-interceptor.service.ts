import {Injectable} from "@angular/core";
import {HttpEvent, HttpHandler, HttpInterceptor, HttpParams, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs";
import {AuthService} from "./auth.service";
import {exhaustMap, take} from "rxjs/operators";
import {ApplicationProperteis} from "../application.properteis";

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {

  private static IGNORE_URLS = [
    ApplicationProperteis.REFRESH_TOKEN_URL,
    ApplicationProperteis.CHANGE_PASSWORD_URL
  ]

  constructor(private authService: AuthService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.user.pipe(take(1), exhaustMap(user => {
      if (!user || AuthInterceptorService.IGNORE_URLS.includes(req.url)) {
        return next.handle(req);
      }
      const modifiedRequest = req.clone({
        params: new HttpParams().set('auth', user.token)
      });
      return next.handle(modifiedRequest);
    }));
  }

}
