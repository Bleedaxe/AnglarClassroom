import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {AuthService} from "../authentication/auth.service";
import {UserInfoService} from "../authentication/user-info.service";
import {ApplicationProperteis} from "../application.properteis";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  collapsed = true;
  isAuthenticated = false;
  userSub: Subscription;
  isAdmin = false;

  constructor(private authService: AuthService,
              private userInfoService: UserInfoService) {
  }

  ngOnInit() {
    this.userInfoService.onUserUpdate.subscribe(() => {
      this.isAdmin = this.userInfoService.authUser.isInRole(ApplicationProperteis.ADMIN_ROLE_NAME);
    })
    this.userSub = this.authService.user.subscribe(user => {
      this.isAuthenticated = !!user;
    })
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }
}
