export class UserInfo {
  public id:string;

  constructor(public email: string,
              public name: string,
              public familyName: string,
              public roles: string[],
              public isBlocked: boolean,
              public favouriteCoursesIds: string[]) {
  }

  isInRole(role: string): boolean {
    if (this.roles) {
      return this.roles.includes(role);
    }

    return false;
  }
}
