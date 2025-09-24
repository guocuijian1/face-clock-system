/// <reference types="cypress" />

import {mount, MountResponse} from "cypress/angular";
import {ComponentInterface} from '../../interfaces/component-interface';
import AttendComponent from '../../../src/app/components/attend/attend.component';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideStore} from '@ngrx/store';
import {imageDataReducer} from '../../../src/app/store/image-data/image-data.reducer';

export class AttendPage implements ComponentInterface<AttendComponent> {
  private readonly title = '#title';
  private readonly attendButton = 'button[type="submit"]';

  getTitle() {
    return cy.get(this.title);
  }

  getAttendButton() {
    return cy.get(this.attendButton);
  }

  mountComponent(): Cypress.Chainable<MountResponse<AttendComponent>> {
      return mount(AttendComponent, {
        providers: [provideHttpClient(withInterceptorsFromDi()), provideStore({ imageData: imageDataReducer })]
      });
    }

}
