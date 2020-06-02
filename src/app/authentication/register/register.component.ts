import {Component, OnInit} from '@angular/core';
import {NgForm} from "@angular/forms";
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";
import {SignUp} from "./sign-up.model";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  isLoading = false;
  error: string = null;

  constructor(private authService: AuthService,
              private router: Router) { }

  ngOnInit(): void {
  }

  onSubmit(registerForm: NgForm) {
    if (!registerForm.valid) {
      return;
    }

    this.isLoading = true;
    this.authService.signUp(new SignUp(
      registerForm.value.email,
      registerForm.value.password,
      registerForm.value.name,
      registerForm.value.familyName))
      .subscribe(_ => this.onSignUp(), error => {
        this.error = error;
        this.isLoading = false;
      });
  }

  onSignUp(): void {
    this.isLoading = false;
    this.router.navigate(['/']);
  }
}
