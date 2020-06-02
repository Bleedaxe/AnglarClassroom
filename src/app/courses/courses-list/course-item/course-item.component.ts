import {Component, Input, OnInit} from '@angular/core';
import {Course} from "../../course.model";
import {Router} from "@angular/router";

@Component({
  selector: 'app-course',
  templateUrl: './course-item.component.html',
  styleUrls: ['./course-item.component.css']
})
export class CourseItemComponent implements OnInit {

  @Input() course: Course;

  constructor() { }

  ngOnInit(): void {
  }
}
