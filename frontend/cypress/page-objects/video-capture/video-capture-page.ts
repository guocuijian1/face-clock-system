/// <reference types="cypress" />

import {ComponentInterface} from '../../interfaces/component-interface';
import {VideoCaptureComponent} from '../../../src/app/components/vidio-capture/video-capture.component';
import {mount, MountResponse} from 'cypress/angular';
import {provideHttpClient} from '@angular/common/http';
import {provideStore} from '@ngrx/store';
import {imageDataReducer} from '../../../src/app/store/image-data/image-data.reducer';

export class VideoCapturePage implements ComponentInterface<VideoCaptureComponent> {
  public static readonly mockWrongImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA';
  public static readonly mockCorrectImageData = 'aW1wb3J0IGJhc2U2NAoKaW1hZ2VfcGF0aCA9ICcvVXNlcnMvZ3VvY3Vpamlhbi9Qcm9qZWN0cy9mYWNlLWNsb2NrLXN5c3RlbS9iYWNrZW5kL3Rlc3QucHknCndpdGggb3BlbihpbWFnZV9wYXRoLCAncmInKSBhcyBpbWFnZV9maWxlOgogICAgYmFzZTY0X3N0ciA9IGJhc2U2NC5iNjRlbmNvZGUoaW1hZ2VfZmlsZS5yZWFkKCkpLmRlY29kZSgndXRmLTgnKQogICAgcHJpbnQoYmFzZTY0X3N0cikK';
  private readonly videoSelector = 'video';
  private readonly imgSelector = 'img';
  private readonly closeButtonSelector = 'button[test-id="video-close-button"]';

  mountComponent(): Cypress.Chainable<MountResponse<VideoCaptureComponent>> {
    return mount(VideoCaptureComponent, {
      providers: [
        provideHttpClient(),
        provideStore({ imageData: imageDataReducer })
      ]
    });
  }

  getVideo() {
    return cy.get(this.videoSelector);
  }

  getImg() {
    return cy.get(this.imgSelector);
  }

  getCloseButton() {
    return cy.get(this.closeButtonSelector);
  }

}
