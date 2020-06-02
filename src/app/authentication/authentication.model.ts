export class Authentication {

  returnSecureToken: boolean;

  constructor(public email: string,
              public password: string,
              /*public name: string,
              public familyName: string*/) {
    this.returnSecureToken = true;
  }
}
