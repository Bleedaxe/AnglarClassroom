import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable, Subject, throwError} from "rxjs";
import {UserInfo} from "../authentication/user-info.model";
import {ApplicationProperteis} from "../application.properteis";
import {catchError, exhaustMap, map, take, tap} from "rxjs/operators";
import {AuthService} from "../authentication/auth.service";

@Injectable({providedIn: "root"})
export class UserService {

  usersUpdate = new Subject<void>();

  constructor(private http: HttpClient,
              private authService: AuthService) {
  }

  getUser(email: string): Observable<UserInfo> {
    return this.http.get<{ [key: string]: UserInfo }[]>(
      ApplicationProperteis.getUrl(`user`)
    ).pipe(map(response => {
      return Object.keys(response).map(key => {
        return {...response[key], id: key}
      }).find(user => user.email === email)
    }));
  }

  updateUser(userInfo: UserInfo): Observable<any> {
    if (!userInfo) {
      throw new Error("[UserService.updateUser] User is not present!");
    }
    return this.http.put(
      ApplicationProperteis.getUrl(`user/${userInfo.id}`),
      userInfo
    ).pipe(tap(() => this.usersUpdate.next()))
  }

  getUsers(): Observable<UserInfo[]> {
    return this.http.get<{ [key: string]: UserInfo }>(
      ApplicationProperteis.getUrl('user')
    ).pipe(
      map(response => {
        if (!response) {
          return [];
        }

        return Object.keys(response).map(key => {
          const userInfo = new UserInfo(
            response[key].email,
            response[key].name,
            response[key].familyName,
            response[key].roles,
            response[key].isBlocked,
            response[key].favouriteCoursesIds
          );
          userInfo.id = key;
          return userInfo;
        })
      })
    )
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(
      ApplicationProperteis.getUrl(`user/${id}`)
    ).pipe(
      tap(() => this.usersUpdate.next()),
      catchError(error => {
        console.log(error);
        return throwError(error);
      })
    );
  }
}
