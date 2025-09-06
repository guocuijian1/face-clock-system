import { ErrorMessageComponent } from '../src/app/components/error-message/error-message.component';
import { ResponseMessageTypeEnum } from '../src/app/enums/response-message-type.enum';
import { mount } from 'cypress/angular';

describe('ErrorMessageComponent', () => {
  it('应正确渲染并显示消息内容', () => {
    const msg = { type: ResponseMessageTypeEnum.Error, content: '发生错误' };
    mount(ErrorMessageComponent, { componentProperties: { msg } });
    cy.get('.message').should('have.class', 'error').should('contain', '发生错误');
  });

  it('type 为 success 时 class 包含 success，内容正确', () => {
    const msg = { type: ResponseMessageTypeEnum.Success, content: '操作成功' };
    mount(ErrorMessageComponent, { componentProperties: { msg } });
    cy.get('.message').should('have.class', 'success').and('contain', '操作成功');
  });
});
