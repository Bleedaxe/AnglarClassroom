import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpParams,
  HttpRequest
} from "@angular/common/http";
import {BehaviorSubject, Observable, Subscription, throwError} from "rxjs";
import {catchError, filter, switchMap, take} from "rxjs/operators";
import {Injectable, OnDestroy} from "@angular/core";
import {AuthService, RefreshTokenResponseData} from "./auth.service";
import {AuthUser} from "./auth-user.model";

@Injectable()
export class RefreshTokenInterceptorService implements HttpInterceptor, OnDestroy {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  userSub: Subscription;

  constructor(private authService: AuthService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req)
      .pipe(catchError(error => {
        console.log(error);
        if (error instanceof HttpErrorResponse && error.status === 401) {
          console.log('401 error')
          return this.handler401Error(req, next);
        }
        return throwError(error);
      }))
  }

  private handler401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      console.log('!isRefreshing')
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((token: RefreshTokenResponseData) => {
          console.log('[handle401Error]', token);
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token.id_token);
          this.handleAuthentication(token);

          return next.handle(this.newTokenRequest(request, token.id_token));
        }));

    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.newTokenRequest(request, token));
        }));
    }
  }

  private newTokenRequest(req: HttpRequest<any>, token: string) {
    console.log('[newTokenRequest]', token);
    return req.clone({
      params: new HttpParams().set('auth', token)
    });
  }

  private handleAuthentication(token: RefreshTokenResponseData) {
    this.userSub = this.authService.user
      .pipe(take(1))
      .subscribe(user => {
        console.log(token);

        const newUser = new AuthUser(
          token.email,
          token.id_token,
          token.refresh_token,
        );
        this.authService.user.next(newUser);
        localStorage.setItem(AuthService.LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser));
      });
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }
}
