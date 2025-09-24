/// <reference types="cypress" />

import {MountResponse} from 'cypress/angular';

export interface ComponentInterface<T> {
  mountComponent(): Cypress.Chainable<MountResponse<T>>;
}
