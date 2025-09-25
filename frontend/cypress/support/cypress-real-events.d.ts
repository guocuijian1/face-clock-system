declare namespace Cypress {
  interface Chainable {
    realHover(options?: any): Chainable<JQuery<HTMLElement>>;
    realClick(options?: any): Chainable<JQuery<HTMLElement>>;
    realType(text: string, options?: any): Chainable<JQuery<HTMLElement>>;
    // 添加您需要的其他 real-events 方法
  }
}
