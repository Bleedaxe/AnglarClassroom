import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CoursesComponent} from "./courses/courses.component";
import {CourseDefaultComponent} from "./courses/courses-list/course-default/course-default.component";
import {CoursesEditComponent} from "./courses/courses-edit/courses-edit.component";
import {AuthGuardService} from "./authentication/auth-guard.service";
import {LoginComponent} from "./authentication/login/login.component";
import {RegisterComponent} from "./authentication/register/register.component";
import {CourseDetailComponent} from "./courses/course-detail/course-detail.component";
import {CourseDeleteComponent} from "./courses/course-delete/course-delete.component";
import {ProfileComponent} from "./users/profile/profile.component";
import {AdminGuardService} from "./authentication/admin-guard.service";
import {UserListComponent} from "./users/user-list/user-list.component";
import {CourseFavouritesComponent} from "./courses/course-favourites/course-favourites.component";


const routes: Routes = [
  {path: '', redirectTo: '/courses', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {
    path: 'courses', component: CoursesComponent, canActivate: [AuthGuardService], children: [
      {path: '', component: CourseDefaultComponent},
      {path: 'new', component: CoursesEditComponent, canActivate: [AdminGuardService]},
      {path: ':id', component: CourseDetailComponent},
      {path: ':id/edit', component: CoursesEditComponent, canActivate: [AdminGuardService]},
      {path: ':id/delete', component: CourseDeleteComponent, canActivate: [AdminGuardService]}
    ]
  },
  {path: 'favourites', component: CourseFavouritesComponent},
  {path: 'profile', component: ProfileComponent, canActivate: [AuthGuardService]},
  {path: 'users', component: UserListComponent, canActivate: [AuthGuardService, AdminGuardService]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
