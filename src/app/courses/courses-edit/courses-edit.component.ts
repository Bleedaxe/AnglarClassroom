import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {CourseService} from "../course.service";
import {Course} from "../course.model";
import {take} from "rxjs/operators";

@Component({
  selector: 'app-courses-edit',
  templateUrl: './courses-edit.component.html',
  styleUrls: ['./courses-edit.component.css']
})
export class CoursesEditComponent implements OnInit {

  isLoading: boolean;

  id: string;
  editMode = false;
  courseForm: FormGroup;
  editCourse: Course;
  error: string;

  constructor(private route: ActivatedRoute,
              private courseService: CourseService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => {
        this.editMode = params['id'] != null;
        if (this.editMode) {
          this.id = params['id'];
        }
        this.initForm();
      }
    )
  }

  //TODO: Add error handling
  onSubmit() {
    if (!this.courseForm.valid) {
      this.error = "Form is invalid!"
      return;
    }
    this.isLoading = true;
    const submit = this.editMode
      ? this.courseService.updateCourse({...this.courseForm.value, rating: this.editCourse.rating, id: this.id})
      : this.courseService.addCourse(this.courseForm.value);

    submit
      .pipe(take(1))
      .subscribe(response => {
        console.log(response);
        this.isLoading = false;
        this.router.navigate(["../"], {relativeTo: this.route});
      })
  }

  private initForm() {
    this.isLoading = true;
    if (this.editMode) {
      this.courseService.getCourse(this.id)
        .pipe(take(1))
        .subscribe(course => {
          if (!course) {
            this.router.navigate(['/', '404']);
            return;
          }
          this.editCourse = course;
          this.loadForm(course.title, course.description, course.releasedDate);
          this.isLoading = false;
        });
    } else {
      this.loadForm("", "", new Date());
      this.isLoading = false;
    }
  }

  loadForm(title: string, description: string, releasedDate: Date) {
    this.courseForm = new FormGroup({
      'title': new FormControl(title, Validators.required),
      'description': new FormControl(description, Validators.required),
      'releasedDate': new FormControl(releasedDate, Validators.required)
    })
  }
}
