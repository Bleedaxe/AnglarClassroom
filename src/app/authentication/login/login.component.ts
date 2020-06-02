import {Component, OnDestroy} from "@angular/core";
import {NgForm} from "@angular/forms";
import {Subscription} from "rxjs";
import {AuthResponseData, AuthService} from "../auth.service";
import {Authentication} from "../authentication.model";
import {Router} from "@angular/router";

@Component({
  selector: 'login-component',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  isLoading = false;
  error: string = null;

  constructor(private authService: AuthService,
              private router: Router) {
  }

  ngOnInit(): void {
  }

  onSubmit(loginForm: NgForm) {
    if (!loginForm.valid) {
      this.error = "Form is invalid!"
      return;
    }

    this.isLoading = true;
    this.authService.login(new Authentication(
      loginForm.value.email,
      loginForm.value.password))
      .subscribe(
        _ => {
          this.isLoading = false;
          this.router.navigate(['/']);
        },
        error => {
          console.log(error);
          this.error = error;
          this.isLoading = false;
        });
  }
}
