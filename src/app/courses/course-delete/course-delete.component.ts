import {Component, OnInit} from '@angular/core';
import {Course} from "../course.model";
import {ActivatedRoute, Router} from "@angular/router";
import {CourseService} from "../course.service";
import {take} from "rxjs/operators";

@Component({
  selector: 'app-course-delete',
  templateUrl: './course-delete.component.html',
  styleUrls: ['./course-delete.component.css']
})
export class CourseDeleteComponent implements OnInit {

  isLoading: boolean;
  course: Course;
  error: string;

  constructor(private courseService: CourseService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.isLoading = true;
      this.courseService.getCourse(params['id'])
        .pipe(take(1))
        .subscribe(course => {
          if (!course) {
            this.router.navigate(['/', '404']);
          }
          this.course = course;
          this.isLoading = false;
        }, error => {
          console.log(error);
          this.error = error.message;
        });
    })
  }

  onConfirm() {
    this.isLoading = true;
    this.courseService.deleteCourse(this.course.id).subscribe(() => {
      this.router.navigate(['/courses']);
    })
  }

  onCancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }
}
