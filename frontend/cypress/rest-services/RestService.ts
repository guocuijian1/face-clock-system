/// <reference types="cypress" />
import { environment   } from '../../src/environments/environment';

export class RestService {
  private static readonly BASE_URL = environment.API_BASE_URL;

  static interceptCroppedFaces(statusCode:number,message:string,imageData: string) {
    return cy.intercept('POST', `${RestService.BASE_URL}/cropped_faces`, {
      statusCode: statusCode,
      body: {
        status: statusCode,
        message: message,
        data: {
          face_locations: [[10, 20, 30, 40]],
          face_image: imageData
        }
      }
    });
  }

  static interceptRegister(statusCode: number, message: string) {
    return cy.intercept('POST', `${RestService.BASE_URL}/register`, {
      statusCode: statusCode,
      body: { message: message }
    });
  }
}
