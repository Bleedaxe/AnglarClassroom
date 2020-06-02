export class Course {
  currentUserRating: number;

  constructor(public id: string,
              public title: string,
              public description: string,
              public releasedDate: Date,
              public rating: {
                [email: string]: number
              }) {
  }
}
