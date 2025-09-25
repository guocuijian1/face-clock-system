/// <reference types="cypress" />
import {VideoCapturePage} from '../page-objects/video-capture/video-capture-page';
import {RestService} from '../rest-services/RestService';
import 'cypress-real-events';

const videoCapturePage = new VideoCapturePage();
describe('VideoCaptureComponent', () => {
  it('should mount and display video ', () => {
    videoCapturePage.mountComponent().then(()=>{
      videoCapturePage.getVideo().should('exist').and('be.visible');
      videoCapturePage.getImg().should('exist').and('not.be.visible');
    });

  });

  it('should close video and show image when imagedata is set ', () => {
    RestService.interceptCroppedFaces(200,'Successfully detected and cropped face',VideoCapturePage.mockCorrectImageData);
    videoCapturePage.mountComponent().then(({fixture})=>{
      fixture.detectChanges();
      videoCapturePage.getVideo().should('exist').and('not.visible');
      videoCapturePage.getImg().should('exist').and('be.visible');
    });
  });

  it('should display video when clear the contents ', () => {
    const response = RestService.interceptCroppedFaces(200,'Successfully detected and cropped face',VideoCapturePage.mockCorrectImageData);
    videoCapturePage.mountComponent().then(({fixture})=>{
      response.then(()=>{
        videoCapturePage.getImg().should('be.visible');
        cy.get('#cameraContainer').realHover();
        videoCapturePage.getCloseButton().should('be.visible').click();
        videoCapturePage.getVideo().should('exist').and('be.visible');
        videoCapturePage.getImg().should('exist').and('not.be.visible');
      });

    })
  });
});
