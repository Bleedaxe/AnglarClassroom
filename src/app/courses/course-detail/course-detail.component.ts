import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {CourseService} from "../course.service";
import {Course} from "../course.model";
import {exhaustMap, take, takeUntil, tap} from "rxjs/operators";
import {UserInfoService} from "../../authentication/user-info.service";
import {UserInfo} from "../../authentication/user-info.model";
import {Subject} from "rxjs";
import {ApplicationProperteis} from "../../application.properteis";
import {UserService} from "../../users/user.service";

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css']
})
export class CourseDetailComponent implements OnInit, OnDestroy {

  isLoading = false;
  course: Course;
  isAdmin: boolean = false;
  currentUser: UserInfo;
  error: string

  private unsubscribe = new Subject<void>();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private courseService: CourseService,
              private userInfoService: UserInfoService,
              private userService: UserService) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    if (this.userInfoService.authUser) {
      this.currentUser = this.userInfoService.authUser;
      this.loadCourse(this.currentUser);
      this.isAdmin = this.currentUser.isInRole(ApplicationProperteis.ADMIN_ROLE_NAME);
    }

    this.userInfoService.onUserUpdate
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.currentUser = this.userInfoService.authUser;
        this.loadCourse(this.currentUser);
        this.isAdmin = this.currentUser.isInRole(ApplicationProperteis.ADMIN_ROLE_NAME);
      })

    this.courseService.coursesUpdate
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.loadCourse(this.currentUser);
      })
  }

  changeFavouriteStatus() {
    if (!this.currentUser) {
      throw new Error('User is not found!');
    }

    const newUser = {...this.currentUser} as UserInfo;
    if (!newUser.favouriteCoursesIds) {
      newUser.favouriteCoursesIds = [];
    }

    if (this.isCourseInFavourites()) {
      newUser.favouriteCoursesIds = newUser.favouriteCoursesIds.filter(cId => cId !== this.course.id);
    } else {
      newUser.favouriteCoursesIds = [...newUser.favouriteCoursesIds, this.course.id];
    }

    this.userService.updateUser(newUser)
      .pipe(
      take(1),
      exhaustMap(() => this.userService.getUser(this.currentUser.email).pipe(tap(user => {
          this.userInfoService.authUser = user
        }))
      ))
      .subscribe()
  }

  isCourseInFavourites(): boolean {
    return this.currentUser?.favouriteCoursesIds?.includes(this.course.id);
  }

  private loadCourse(currentUser: UserInfo) {
    this.route.params.subscribe(params => {
      this.isLoading = true;
      this.courseService.getCourse(params['id'], currentUser)
        .pipe(take(1))
        .subscribe(course => {
          if (!course) {
            this.router.navigate(['/404']);
            return;
          }
          this.course = course
          this.isLoading = false;
        }, error => {
          this.error = error;
        })
    })
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
