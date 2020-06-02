import {Injectable} from "@angular/core";
import {UserInfo} from "./user-info.model";
import {Subject} from "rxjs";

@Injectable({providedIn: "root"})
export class UserInfoService {

  onUserUpdate = new Subject<void>();

  private _authUser: UserInfo;

  get authUser() {
    return this._authUser;
  }

  set authUser(authUser: UserInfo) {
    if(authUser) {
      this._authUser = new UserInfo(
        authUser.email,
        authUser.name,
        authUser.familyName,
        authUser.roles,
        authUser.isBlocked,
        authUser.favouriteCoursesIds
      );
      this._authUser.id = authUser.id;
      this.onUserUpdate.next();
    }
  }
}
