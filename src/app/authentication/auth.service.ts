import {Injectable, OnInit} from "@angular/core";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from "@angular/common/http";
import {Authentication} from "./authentication.model";
import {catchError, exhaustMap, map, take, tap} from "rxjs/operators";
import {BehaviorSubject, Observable, throwError} from "rxjs";
import {AuthUser} from "./auth-user.model";
import {Router} from "@angular/router";
import {UserInfo} from "./user-info.model";
import {ApplicationProperteis} from "../application.properteis";
import {SignUp} from "./register/sign-up.model";
import {UserInfoService} from "./user-info.service";

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

export interface RefreshTokenResponseData {
  'email'?: string;
  'access_token': string;
  'expires_in': string;
  'id_token': string;
  'refresh_token': string;
  'project_id': string;
}

export interface ChangePasswordResponseData {
  localId: string;
  email: string;
  passwordHash: string;
  providerUserInfo: string[];
  idToken: string;
  refreshToken: string
  expiresIn: string;
}

@Injectable({providedIn: 'root'})
export class AuthService implements OnInit {
  static LOCAL_STORAGE_USER_KEY = 'userData';

  private static ERROR_MESSAGES = {
    'DEFAULT': 'An unknown error occurred!',
    'EMAIL_EXISTS': 'This email already exists!',
    'INVALID_PASSWORD': 'Password is invalid!',
    'EMAIL_NOT_FOUND': 'This email does not exists!'
  };

  user: BehaviorSubject<AuthUser> = new BehaviorSubject<AuthUser>(null);

  constructor(private http: HttpClient,
              private router: Router,
              private userInfoService: UserInfoService) {
  }

  ngOnInit() {
  }

  signUp(signUp: SignUp) {
    return this.http.post<AuthResponseData>(
      ApplicationProperteis.SIGN_UP_URL,
      signUp
    )
      .pipe(
        exhaustMap(response => {
          return this.createUser(signUp, response);
        }),
        tap(response => this.handleAuthentication(response)),
        catchError(this.handleError)
      );
  }

  login(authModel: Authentication) {
    return this.http.post<AuthResponseData>(
      ApplicationProperteis.SIGN_IN_URL,
      authModel)
      .pipe(
        exhaustMap(response => this.getUser(response)),
        tap(response => this.handleAuthentication(response)),
        catchError(this.handleError)
      )
      ;
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/login']);
    localStorage.removeItem(AuthService.LOCAL_STORAGE_USER_KEY)
  }

  refreshToken(): Observable<RefreshTokenResponseData> {
    return this.user.pipe(
      take(1),
      exhaustMap(user => {
        console.log('[refreshToken]', user)
        const body = new URLSearchParams();
        body.set('grant_type', 'refresh_token');
        body.set('refresh_token', user.refreshToken);

        return this.http.post<RefreshTokenResponseData>(
          ApplicationProperteis.REFRESH_TOKEN_URL,
          body.toString(),
          {
            headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
          }).pipe(map(response => {
          response.email = user.email;
          return response;
        }))
      }),
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 400) {
          this.logout();
        }
        return throwError(error);
      })
    );
  }

  autoLogin() {
    const userData = JSON.parse(localStorage.getItem(AuthService.LOCAL_STORAGE_USER_KEY));

    if (!userData) {
      return;
    }

    const loadedUser = new AuthUser(
      userData.email,
      userData.token,
      userData.refreshToken
    );

    if (loadedUser.token) {
      this.user.next(loadedUser);
      this.getUserInfo(loadedUser.email, loadedUser.token)
        .pipe(take(1))
        .subscribe(user => this.checkAndAddAuthUser(loadedUser.email, user));
    }
  }

  private handleAuthentication(authUser: AuthUser) {
    this.user.next(authUser);
    localStorage.setItem(AuthService.LOCAL_STORAGE_USER_KEY, JSON.stringify(authUser));
  }

  private handleError(errorResponse: any): Observable<never> {
    console.log("Error occurred", errorResponse);
    if (!errorResponse.error || !errorResponse.error.error) {
      console.log(errorResponse)
      return throwError(errorResponse.message);
    }

    console.log(errorResponse.error.error.message);
    return throwError(
      AuthService.ERROR_MESSAGES[errorResponse.error.error.message] ||
      AuthService.ERROR_MESSAGES.DEFAULT);
  }

  private createUser(signUp: SignUp,
                     response: AuthResponseData): Observable<AuthUser> {
    const initialRoles = [];

    const userInfo = new UserInfo(
      signUp.email,
      signUp.name,
      signUp.familyName,
      initialRoles,
      false,
      []
    );

    return this.http.post<{ name: string }>(
      ApplicationProperteis.getUrl('user'),
      userInfo,
      {
        params: new HttpParams().set('auth', response.idToken)
      }
    ).pipe(
      map(userResponse => {
        userInfo.id = userResponse.name;
        this.userInfoService.authUser = userInfo;

        return new AuthUser(
          response.email,
          response.idToken,
          response.refreshToken)
      }))
  }

  getUser(authResponseData: AuthResponseData): Observable<AuthUser> {
    return this.getUserInfo(authResponseData.email, authResponseData.idToken)
      .pipe(map(user => {
        this.checkAndAddAuthUser(authResponseData.email, user);

        return new AuthUser(
          user.email,
          authResponseData.idToken,
          authResponseData.refreshToken);
      }))
  }

  changePassword(password: string): Observable<ChangePasswordResponseData> {
    return this.user.pipe(
      exhaustMap(user => {
        if (!user) {
          this.logout();
          throw new Error("User is already logged out");
        }

        return this.http.post<ChangePasswordResponseData>(ApplicationProperteis.CHANGE_PASSWORD_URL,
          {
            idToken: user.token,
            password: password,
            returnSecureToken: true
          })
      }),
      tap(response => {
        const authUser = new AuthUser(
          response.email,
          response.idToken,
          response.refreshToken
        );
        this.handleAuthentication(authUser);
      }))
  }

  private getUserInfo(email: string, authToken: string) {
    return this.http.get<{ [key: string]: UserInfo }[]>(
      ApplicationProperteis.getUrl(`user`),
      {
        params: new HttpParams().set('auth', authToken)
      }
    ).pipe(map(response => {
      return Object.keys(response).map(key => {
        return {...response[key], id: key}
      }).find(user => user.email === email)
    }));
  }

  private checkAndAddAuthUser(email: string, user: UserInfo) {
    if (!user) {
      throw new Error(`User with email ${email} is not found!`)
    }

    if (user.isBlocked) {
      throw new Error(`User with email ${email} is blocked!`);
    }
    const userInfo = new UserInfo(
      user.email,
      user.name,
      user.familyName,
      user.roles,
      user.isBlocked,
      user.favouriteCoursesIds
    );
    userInfo.id = user.id;
    this.userInfoService.authUser = userInfo;
  }
}
