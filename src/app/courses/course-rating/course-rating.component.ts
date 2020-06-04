import {Component, Input, OnInit} from '@angular/core';
import {Course} from "../course.model";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {UserInfoService} from "../../authentication/user-info.service";
import {CourseService} from "../course.service";
import {Subject} from "rxjs";
import {take} from "rxjs/operators";

@Component({
  selector: 'app-course-rating',
  templateUrl: './course-rating.component.html',
  styleUrls: ['./course-rating.component.css']
})
export class CourseRatingComponent implements OnInit {

  @Input() course: Course;
  courseRatingForm: FormGroup;
  error: string;

  constructor(private userInfoService: UserInfoService,
              private courseService: CourseService) {
  }

  ngOnInit(): void {
    this.InitForm();
  }

  private InitForm() {
    this.courseRatingForm = new FormGroup({
      'rating': new FormControl(+this.course.currentUserRating,
        [
          Validators.required,
          Validators.min(1),
          Validators.max(5)
        ])
    })
  }

  submitCourseRating() {
    if (!this.courseRatingForm.valid) {
      this.error = "Rating must be number between 1 and 5"
      return;
    }

    const currentUserId = this.userInfoService.authUser.id;
    const rating = +this.courseRatingForm.value.rating;

    if (!this.course.rating) {
      this.course.rating = {};
    }
    this.course.rating[currentUserId] = rating;
    this.courseService.updateCourse(this.course)
      .pipe(take(1))
      .subscribe(() => {}, error => {
        this.courseService.coursesUpdate.next();
      });
  }
}
