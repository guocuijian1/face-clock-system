/// <reference types="cypress" />

import {mount, MountResponse} from 'cypress/angular';
import RegisterComponent from '../../../src/app/components/register/register.component';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideStore} from '@ngrx/store';
import {imageDataReducer} from '../../../src/app/store/image-data/image-data.reducer';
import { ComponentInterface } from '../../interfaces/component-interface';
import {MessagePage} from '../message/message-page';

export class RegisterPage implements ComponentInterface<RegisterComponent> {
  private readonly videoCaptureComponent = 'app-video-capture';
  private readonly messageComponent = 'app-message';
  private readonly nameInput = 'input[name="name"]';
  private readonly jobIdInput = 'input[name="job_id"]';
  private readonly registerButton = 'button[type="submit"]';
  private readonly title = '#title';
  private readonly messagePage = new MessagePage();

  setName(name: string) {
    this.getName().type(name);
  }

  setJobId(jobId: string) {
    this.getJobId().type(jobId);
  }

  clickRegister() {
    this.getRegisterButton().click();
  }

  getName() {
    return cy.get(this.nameInput);
  }

  getJobId() {
    return cy.get(this.jobIdInput);
  }

  getRegisterButton() {
    return cy.get(this.registerButton);
  }

  getTitle() {
    return cy.get(this.title);
  }

  getMessage() {
    return this.messagePage.getMessage();
  }

  mountComponent(): Cypress.Chainable<MountResponse<RegisterComponent>> {
    return mount(RegisterComponent, {
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideStore({ imageData: imageDataReducer })
      ]
    });
  }
}
