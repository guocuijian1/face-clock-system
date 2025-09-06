import RegisterComponent from '../src/app/components/register/register.component';
import { mount } from 'cypress/angular';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';

// mock VideoCaptureComponent
const mockImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA';

describe('RegisterComponent', () => {
  it('应正确渲染表单', () => {
    mount(RegisterComponent,{ providers: [provideHttpClient(withInterceptorsFromDi())] });
    cy.get('#title').should('contain', '人脸注册');
    cy.get('#registerTab').should('exist');
    cy.get('input#registerName').should('exist');
    cy.get('input#registerJobId').should('exist');
    cy.get('button[type="submit"]').should('contain', '注册');
  });

  it('未填写姓名或工号时不能提交', () => {
    mount(RegisterComponent, { providers: [provideHttpClient(withInterceptorsFromDi())] });
    // 初始时按钮应禁用
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('采集图片后 registerImageData 应被赋值', () => {
    mount(RegisterComponent, { providers: [provideHttpClient(withInterceptorsFromDi())] }).then(({ component }) => {
      component.registerCaptureReady(mockImageData);
      expect(component.registerImageData).to.eq(mockImageData);
    });
  });

  it('注册成功时显示成功消息', () => {
    cy.intercept('POST', '**/register', {
      statusCode: 200,
      body: { message: '注册成功' }
    }).as('register');
    mount(RegisterComponent, { providers: [provideHttpClient(withInterceptorsFromDi())] });
    cy.get('input#registerName').type('张三');
    cy.get('input#registerJobId').type('1001');
    // 模拟采集图片
    cy.get('app-vidio-capture').then(($el) => {
      const ng = (window as any).ng;
      const cmp = ng.getComponent($el[0]);
      cmp.onCaptureReady.emit(mockImageData);
    });
    cy.get('button[type="submit"]').click();
    cy.wait('@register');
    cy.contains('注册成功').should('exist');
  });

  it('注册失败时显示失败消息', () => {
    cy.intercept('POST', '**/register', {
      statusCode: 400,
      body: { message: '' }
    }).as('register');
    mount(RegisterComponent, { providers: [provideHttpClient(withInterceptorsFromDi())] });
    cy.get('input#registerName').type('李四');
    cy.get('input#registerJobId').type('1002');
    cy.get('app-vidio-capture').then(($el) => {
      const ng = (window as any).ng;
      const cmp = ng.getComponent($el[0]);
      cmp.onCaptureReady.emit(mockImageData);
    });
    cy.get('button[type="submit"]').click();
    cy.wait('@register');
    cy.contains('注册失败').should('exist');
  });

  it('图片base64解码失败时显示错误消息', () => {
    mount(RegisterComponent, { providers: [provideHttpClient(withInterceptorsFromDi())] }).then(({ component }) => {
      // 传入非法base64
      component.registerImageData = 'data:image/png;base64,!!!notbase64';
      cy.get('input#registerName').type('王五');
      cy.get('input#registerJobId').type('1003');
      cy.get('button[type="submit"]').click();
      cy.contains('图片base64解码失败').should('exist');
    });
  });
});
