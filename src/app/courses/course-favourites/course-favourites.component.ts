import {Component, OnDestroy, OnInit} from '@angular/core';
import {Course} from "../course.model";
import {CourseService} from "../course.service";
import {Subject} from "rxjs";
import {UserInfoService} from "../../authentication/user-info.service";
import {exhaustMap, take, takeUntil, tap} from "rxjs/operators";
import {UserService} from "../../users/user.service";
import {UserInfo} from "../../authentication/user-info.model";

@Component({
  selector: 'app-course-favourites',
  templateUrl: './course-favourites.component.html',
  styleUrls: ['./course-favourites.component.css']
})
export class CourseFavouritesComponent implements OnInit, OnDestroy {
  courses: Course[] = [];
  isLoading: boolean;
  private unsubscribe = new Subject<void>();
  private currentUser: UserInfo;

  constructor(private courseService: CourseService,
              private userInfoService: UserInfoService,
              private userService: UserService) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    if (this.userInfoService.authUser) {
      this.currentUser = this.userInfoService.authUser
      this.loadFavouriteCourses();
    }

    this.userInfoService.onUserUpdate
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        if (this.userInfoService.authUser) {
          this.currentUser = this.userInfoService.authUser;
          this.loadFavouriteCourses();
        }
      });

    this.courseService.coursesUpdate
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.loadFavouriteCourses();
      });

    this.isLoading = false;
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  private loadFavouriteCourses() {
    this.isLoading = true;
    const coursesIds = this.currentUser.favouriteCoursesIds;
    this.courseService.getCourses(this.currentUser)
      .pipe(take(1))
      .subscribe(courses => {
        if (courses !== null && courses !== undefined) {
          this.courses = courses.filter(course => coursesIds.includes(course.id));
        }

        this.isLoading = false;
      })
  }

  removeFromFavourites(id: string) {
    if (!this.currentUser) {
      throw new Error('User is not found!');
    }

    this.currentUser.favouriteCoursesIds = this.currentUser.favouriteCoursesIds.filter(cId => cId !== id);
    this.userService.updateUser(this.currentUser)
      .pipe(
        take(1),
        exhaustMap(() => this.userService.getUser(this.currentUser.email).pipe(tap(user => {
            this.userInfoService.authUser = user
          }))
        ))
      .subscribe()
  }
}
