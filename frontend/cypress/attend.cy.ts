import AttendComponent from '../src/app/components/attend/attend.component';
import { mount } from 'cypress/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AttendComponent', () => {
  it('should mount the component', () => {
    mount(AttendComponent, { providers: [provideHttpClient(withInterceptorsFromDi())] });
    cy.get('h2').contains('考勤');
    cy.get('form#attendForm').should('exist');
  });

  it('should render the video capture component', () => {
    mount(AttendComponent, { providers: [provideHttpClient(withInterceptorsFromDi())] });
    cy.get('app-vidio-capture').should('exist');
  });

  it('should render the submit button with correct text', () => {
    mount(AttendComponent, { providers: [provideHttpClient(withInterceptorsFromDi())] });
    cy.get('button[type="submit"]').contains('考勤');
  });

  it('should show error message when responseMessage is set', () => {
    mount(AttendComponent, {
      providers: [provideHttpClient(withInterceptorsFromDi())],
      componentProperties: {
        responseMessage: { type: 'error', content: 'Error occurred' }
      }
    });
    cy.get('app-error-message').should('exist').contains('Error occurred');
  });

  it('should update imageData when registerCaptureReady is called', () => {
    mount(AttendComponent, { providers: [provideHttpClient(withInterceptorsFromDi())] }).then(({ component }) => {
      component.registerCaptureReady('mockBase64');
      expect(component.imageData).to.equal('mockBase64');
    });
  });

  it('should call onSubmitAttendForm on form submit', () => {
    mount(AttendComponent, { providers: [provideHttpClient(withInterceptorsFromDi())] }).then(({ component }) => {
      cy.spy(component, 'onSubmitAttendForm').as('submitSpy');
      cy.get('form#attendForm').submit();
      cy.get('@submitSpy').should('have.been.called');
    });
  });

  // Optionally, add a test for API call simulation with cy.stub(window, 'fetch')
});
