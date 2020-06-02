import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Course} from "./course.model";
import {ApplicationProperteis} from "../application.properteis";
import {map, tap} from "rxjs/operators";
import {Observable, Subject} from "rxjs";
import {UserInfo} from "../authentication/user-info.model";

@Injectable({providedIn: "root"})
export class CourseService {

  coursesUpdate = new Subject<void>();

  constructor(private http: HttpClient) {
  }

  getCourse(id: string, currentUser: UserInfo = null): Observable<Course> {
    return this.http.get<Course>(
      ApplicationProperteis.getUrl(`course/${id}`)
    ).pipe(
      map(course => {
        const newCourse = {...course, id: id }
        if (currentUser) {
          newCourse.currentUserRating = this.getCourseRatingForCurrentUser(course, currentUser);
        }
        return newCourse;
      })
    );
  }

  getCourses(currentUser: UserInfo): Observable<Course[]> {
    return this.http.get<{ [id: string]: Course }>(ApplicationProperteis.getUrl('course'))
      .pipe(
        map(response => {
          if (response) {
            return Object.keys(response)
              .map(key => {
                return {...response[key], id: key, currentUserRating: this.getCourseRatingForCurrentUser(response[key], currentUser)}
              })
          }

          throw new Error("Courses not found!")
        })
      );
  }

  updateCourse(course: Course): Observable<any> {
    return this.http.put(
      ApplicationProperteis.getUrl(`course/${course.id}`),
      course
    ).pipe(
      tap(response => {
        console.log(response);
        this.coursesUpdate.next();
      })
    );
  }

  addCourse(course: Course): Observable<any> {
    return this.http.post(
      ApplicationProperteis.getUrl('course'),
      course
    ).pipe(
      tap(response => {
        console.log(response);
        this.coursesUpdate.next();
      })
    );
  }

  deleteCourse(id: string): Observable<any> {
    return this.http.delete(
      ApplicationProperteis.getUrl(`course/${id}`)
    ).pipe(
      tap(response => {
        console.log(response);
        this.coursesUpdate.next();
      })
    );
  }

  private getCourseRatingForCurrentUser(course: Course, user: UserInfo): number {
    if (!user || !course.rating || !course.rating[user.id]) {
      return 0;
    }

    return course.rating[user.id];;
  }
}
