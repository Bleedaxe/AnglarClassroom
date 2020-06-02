export class AuthUser {

  constructor(public email: string,
              public token: string,
              public refreshToken: string) {
  }
}
