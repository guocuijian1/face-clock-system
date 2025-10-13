import {AttendPage} from '../page-objects/attend/attend-page';
import {RestService} from '../rest-services/RestService';
import {VideoCapturePage} from '../page-objects/video-capture/video-capture-page';

const attendPage = new AttendPage();
describe('AttendComponent', () => {
  it('when no face is detected,the disable attend button', () => {
    RestService.interceptCroppedFaces(400,'Error occurred',VideoCapturePage.mockWrongImageData);
    attendPage.mountComponent().then(() => {
      attendPage.getTitle().should('have.text', '考勤');
      attendPage.getAttendButton().should('be.disabled');
    })
  });

  it('when faces is detected, then enable attend button', () => {
    RestService.interceptCroppedFaces(200,'Success',VideoCapturePage.mockCorrectImageData);

    attendPage.mountComponent().then(() => {
      attendPage.getTitle().should('have.text', '考勤');
      attendPage.getAttendButton().should('be.enabled');
    });
  });
});
