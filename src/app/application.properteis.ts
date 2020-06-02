export class ApplicationProperteis {
  private static BASE_URL = "https://ng-http-tpp-test.firebaseio.com";

  public static getUrl = function (resource: string): string {
    return `${ApplicationProperteis.BASE_URL}/${resource}.json`;
  }
  public static API_KEY = "AIzaSyCnQZiRDoxaOgDBJKwdlD7JMTUGYHwznoQ";
  public static SIGN_IN_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${ApplicationProperteis.API_KEY}`;
  public static SIGN_UP_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${ApplicationProperteis.API_KEY}`;
  public static REFRESH_TOKEN_URL = `https://securetoken.googleapis.com/v1/token?key=${ApplicationProperteis.API_KEY}`;
  public static CHANGE_PASSWORD_URL = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${ApplicationProperteis.API_KEY}`;
  public static DELETE_ACCOUNT_URL = `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${ApplicationProperteis.API_KEY}`;
  public static ADMIN_ROLE_NAME = "ADMIN";
}
