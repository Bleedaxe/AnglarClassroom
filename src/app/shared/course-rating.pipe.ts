import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: 'courseRating'})
export class CourseRatingPipe implements PipeTransform {

  transform(value: {[key: string]: number}, ...args): number {
    if(!value) {
      return 0;
    }
    const values = Object.keys(value).map(key => {
      return value[key];
    });
    return values.reduce((sum, next) => sum + next, 0) / values.length;
  }
}
