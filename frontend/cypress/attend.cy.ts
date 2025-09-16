import AttendComponent from '../src/app/components/attend/attend.component';
import { mount } from 'cypress/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {ResponseMessageTypeEnum} from '../src/app/enums/response-message-type.enum';

describe('AttendComponent', () => {
  it('should mount the component', () => {
    mount(AttendComponent, { providers: [provideHttpClient(withInterceptorsFromDi())] });
    cy.get('#title').contains('考勤');
    cy.get('form#attendForm').should('exist');
    cy.get('app-vidio-capture').should('exist');
    cy.get('button[type="submit"]').contains('考勤');
  });

  it('should show error message when responseMessage is set', () => {
    mount(AttendComponent, {
      providers: [provideHttpClient(withInterceptorsFromDi())],
      componentProperties: {
        responseMessage: { type: ResponseMessageTypeEnum.Error, content: 'Error occurred' }
      }
    });
    cy.get('app-message').should('exist').contains('Error occurred');
  });

  it('should show success message when responseMessage is set', () => {
    mount(AttendComponent, {
      providers: [provideHttpClient(withInterceptorsFromDi())],
      componentProperties: {
        responseMessage: { type: ResponseMessageTypeEnum.Success, content: 'Success occurred' }
      }
    });
    cy.get('app-message').should('exist').contains('Success occurred');
  });

  it('should not show any message when responseMessage is not set', () => {
    mount(AttendComponent, {
      providers: [provideHttpClient(withInterceptorsFromDi())],
      componentProperties: {
        responseMessage: null
      }
    });
    cy.get('app-message').should('not.exist');
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
});
