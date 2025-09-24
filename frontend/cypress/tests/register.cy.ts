import { RestService } from '../rest-services/RestService';
import {RegisterPage} from '../page-objects/register/register-page';
import {VideoCapturePage} from '../page-objects/video-capture/video-capture-page';

const registerPage = new RegisterPage();

describe('RegisterComponent', () => {
  it('应正确渲染表单', () => {
    registerPage.mountComponent().then(() => {
      registerPage.getTitle().should('contain', '人脸注册');
      registerPage.getName().should('exist');
      registerPage.getJobId().should('exist');
      registerPage.getRegisterButton().should('have.text', '注册').and('be.disabled');
    });
  });

  it('注册成功时显示成功消息', () => {
    RestService.interceptCroppedFaces(200,'Successfully detected and cropped face',VideoCapturePage.mockCorrectImageData);
    let registerResponse = RestService.interceptRegister(200,'注册成功');
    registerPage.mountComponent()
      .then(({fixture}) => {
        fixture.detectChanges();

        registerPage.setName('张三');
        registerPage.setJobId('1001');
        registerPage.getRegisterButton().click();

        registerPage.getMessage().should('eq', '注册成功');
      });
  });

  it('注册失败时显示失败消息', () => {
    RestService.interceptCroppedFaces(200,'Successfully detected and cropped face',VideoCapturePage.mockCorrectImageData);
    let registerResponse = RestService.interceptRegister(400,'注册失败');

    registerPage.mountComponent().then(({fixture}) => {
      fixture.detectChanges();

      registerPage.setName('李四');
      registerPage.setJobId('1002');
      registerPage.getRegisterButton().click();
      registerPage.getMessage().should('eq', '注册失败');
    })
  });

  it('图片base64解码失败时显示错误消息', () => {
      RestService.interceptCroppedFaces(200,'Successfully detected and cropped face',VideoCapturePage.mockWrongImageData);
      registerPage.mountComponent().then(
        ({fixture}) => {
        fixture.detectChanges();
        registerPage.setName('王五');
        registerPage.setJobId('1003');
        registerPage.getRegisterButton().click();
        registerPage.getMessage().should('eq', '图片base64解码失败');
      })
    });
});
