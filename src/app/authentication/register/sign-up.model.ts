import {Authentication} from "../authentication.model";

export class SignUp extends Authentication {

  constructor(public email: string,
              public password: string,
              public name: string,
              public familyName: string) {
    super(email, password);
  }
}
