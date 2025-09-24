/// <reference types="cypress" />

export class MessagePage {
  private readonly message = 'div[test-id="message-message"]';

  getMessage() {
    return cy.get(this.message).invoke('text').then(text => text.trim());
  }
}
