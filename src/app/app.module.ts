import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CoursesComponent} from './courses/courses.component';
import {CoursesListComponent} from './courses/courses-list/courses-list.component';
import {CourseItemComponent} from './courses/courses-list/course-item/course-item.component';
import {ProfileComponent} from './users/profile/profile.component';
import {CoursesEditComponent} from './courses/courses-edit/courses-edit.component';
import {CourseDefaultComponent} from './courses/courses-list/course-default/course-default.component';
import {LoginComponent} from './authentication/login/login.component';
import {RegisterComponent} from './authentication/register/register.component';
import {LoadingSpinnerComponent} from "./shared/loading-spinner/loading-spinner.component";
import {HeaderComponent} from "./header/header.component";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {AuthInterceptorService} from "./authentication/auth-interceptor.service";
import {RefreshTokenInterceptorService} from "./authentication/refresh-token-interceptor.service";
import {CourseDetailComponent} from './courses/course-detail/course-detail.component';
import {DropdownDirective} from "./shared/dropdown.directive";
import {CourseDeleteComponent} from './courses/course-delete/course-delete.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { CourseFavouritesComponent } from './courses/course-favourites/course-favourites.component';
import {CourseRatingPipe} from "./shared/course-rating.pipe";
import { CourseRatingComponent } from './courses/course-rating/course-rating.component';

@NgModule({
  declarations: [
    AppComponent,
    CoursesComponent,
    CoursesListComponent,
    CourseItemComponent,
    ProfileComponent,
    CoursesEditComponent,
    CourseDefaultComponent,
    LoginComponent,
    RegisterComponent,
    LoadingSpinnerComponent,
    HeaderComponent,
    CourseDetailComponent,
    DropdownDirective,
    CourseDeleteComponent,
    UserListComponent,
    CourseFavouritesComponent,
    CourseRatingPipe,
    CourseRatingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RefreshTokenInterceptorService,
      multi: true
    }],
  bootstrap: [AppComponent]
})
export class AppModule {
}
