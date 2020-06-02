import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from "@angular/router";
import {Observable} from "rxjs";
import {AuthService} from "./auth.service";
import {map, take} from "rxjs/operators";
import {ApplicationProperteis} from "../application.properteis";
import {UserInfoService} from "./user-info.service";

@Injectable({providedIn: "root"})
export class AdminGuardService implements CanActivate {

  constructor(private userInfoService: UserInfoService,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.userInfoService.authUser) {
      return this.userInfoService.authUser.isInRole(ApplicationProperteis.ADMIN_ROLE_NAME);
    }

    return this.userInfoService.onUserUpdate.pipe(
      take(1),
      map(() => {
        if (!this.userInfoService.authUser) {
          return this.router.createUrlTree(['/courses']);
        }
        return this.userInfoService.authUser.isInRole(ApplicationProperteis.ADMIN_ROLE_NAME)
      }));
  }
}
