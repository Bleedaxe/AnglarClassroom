import {Component, OnDestroy, OnInit} from '@angular/core';
import {Course} from "../course.model";
import {CourseService} from "../course.service";
import {AuthService} from "../../authentication/auth.service";
import {Subject} from "rxjs";
import {ApplicationProperteis} from "../../application.properteis";
import {ActivatedRoute, Router} from "@angular/router";
import {takeUntil} from "rxjs/operators";
import {UserInfo} from "../../authentication/user-info.model";
import {UserInfoService} from "../../authentication/user-info.service";

@Component({
  selector: 'app-courses-list',
  templateUrl: './courses-list.component.html',
  styleUrls: ['./courses-list.component.css']
})
export class CoursesListComponent implements OnInit, OnDestroy {

  isLoading = false;
  unsubscribe = new Subject<void>();
  courses: Course[];
  isAdmin: boolean = false;

  constructor(private courseService: CourseService,
              private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private userInfoService: UserInfoService) {
  }

  ngOnInit(): void {
    if(this.userInfoService.authUser) {
      const currentUser = this.userInfoService.authUser;
      this.loadCourses(currentUser);
      this.isAdmin = currentUser.isInRole(ApplicationProperteis.ADMIN_ROLE_NAME)
    }

    this.courseService.coursesUpdate.pipe(
      takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.loadCourses(this.userInfoService.authUser);
      })

    this.userInfoService.onUserUpdate.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
      const currentUser = this.userInfoService.authUser;
      this.isAdmin = currentUser.isInRole(ApplicationProperteis.ADMIN_ROLE_NAME)
      this.loadCourses(currentUser);
    })
  }

  private loadCourses(currentUser: UserInfo) {
    this.isLoading = true;
    this.courseService.getCourses(currentUser).subscribe(courses => {
        console.log(courses);
        this.courses = courses;
        this.isLoading = false;
      }
    );
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
