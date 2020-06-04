import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {UserService} from "../user.service";
import {AuthService} from "../../authentication/auth.service";
import {exhaustMap, take} from "rxjs/operators";
import {UserInfo} from "../../authentication/user-info.model";
import {UserInfoService} from "../../authentication/user-info.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  userInfo: UserInfo;
  userInfoForm: FormGroup;
  isLoading: boolean;
  changePasswordForm: FormGroup;
  profileError: string;
  changePasswordError: string;

  constructor(private authService: AuthService,
              private userService: UserService,
              private userInfoService: UserInfoService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.authService.user
      .pipe(
        take(1),
        exhaustMap(user => this.userService.getUser(user.email)))
      .subscribe(user => {
        this.userInfo = user;
        this.initForm();
        this.isLoading = false;
      })
  }

  onUserInfoSubmit() {
    if (!this.userInfoForm.valid) {
      this.profileError = "Form is invalid";
      return;
    }
    this.isLoading = true;
    this.userInfo.name = this.userInfoForm.value.name;
    this.userInfo.familyName = this.userInfoForm.value.familyName;

    this.userService.updateUser(this.userInfo)
      .pipe(take(1))
      .subscribe(() => {
        this.userInfoService.authUser = this.userInfo;
        this.isLoading = false;
        this.router.navigate(['../'], {relativeTo: this.route})
      }, error => {
        this.profileError = error.message || "Something went wrong"
        this.isLoading = false;
      })
  }

  initForm() {
    this.userInfoForm = new FormGroup({
      'email': new FormControl({
        value: this.userInfo.email,
        disabled: true
      }, [Validators.required, Validators.email]),
      'name': new FormControl(this.userInfo.name, Validators.required),
      'familyName': new FormControl(this.userInfo.familyName, Validators.required)
    })

    this.changePasswordForm = new FormGroup({
      'password': new FormControl('', [
        Validators.required,
        Validators.min(6)
      ])
    });
  }

  onChangePasswordSubmit() {
    if (this.changePasswordForm.invalid) {
      this.changePasswordError = "New password is invalid";
      return
    }
    this.isLoading = true;
    this.authService.changePassword(this.changePasswordForm.value.password)
      .subscribe(() => {
        this.isLoading = false;
        this.router.navigate(["../"], {relativeTo: this.route});
      }, error => {
        this.changePasswordError = error.error && error.error && error.error.error.message
          ? error.error.error.message
          : "Something went wrong";
        this.isLoading = false;
      });
  }
}
