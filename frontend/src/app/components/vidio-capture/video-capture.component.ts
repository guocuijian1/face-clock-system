import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {firstValueFrom, Observable, Subscription, take} from 'rxjs';
import {Store} from '@ngrx/store';
import {clearImageData, setImageData} from '../../store/image-data/image-data.actions';
import {selectImageData} from '../../store/image-data/image-data.selectors';
import {AsyncPipe, NgClass} from '@angular/common';
import {MessageComponent} from '../message/message.component';
import {ResponseMessageInterface} from '../../interfaces/response-message-interface';
import {ResponseMessageTypeEnum} from '../../enums/response-message-type.enum';
import {ResponseModel} from '../../rest-template/response-model';

@Component({
  selector: 'app-video-capture',
  imports: [
    AsyncPipe,
    NgClass,
    MessageComponent
  ],
  templateUrl: './video-capture.component.html',
  standalone: true,
  styleUrl: './video-capture.component.scss'
})
export class VideoCaptureComponent implements AfterViewInit, OnDestroy {
  @ViewChild('video', { static: false }) video!: ElementRef<HTMLVideoElement>;
  @ViewChild('image', { static: false }) image!: ElementRef<HTMLImageElement>;
  @ViewChild('cameraContainer', { static: false }) cameraContainer!: ElementRef<HTMLElement>;

  imageData$: Observable<string | null>;
  responseMessage: ResponseMessageInterface | null = null;
  imageDataSubscription: Subscription | undefined;

  constructor(private readonly http: HttpClient, private readonly store: Store) {
    this.imageData$ = this.store.select(selectImageData);
    this.imageDataSubscription = this.imageData$.subscribe(imageData => {
      console.log('imageData updated:', imageData);
      if (!imageData?.trim() && this.video) {
        this.handleCaptureClick().then();
      }
    });
  }

  async captureImage(): Promise<void> {
    const video = this.video.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      console.error('无法获取canvas 2d context');
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imgData = canvas.toDataURL('image/png',0.9);
    const img64 = imgData.split(',')[1];
    console.log('Captured image base64:', imgData);

    try {
      const response:ResponseModel = await firstValueFrom(this.http.post<any>(
        `${environment.API_BASE_URL}/cropped_faces`,
        { imageData: img64 }
      ));

      if (response.status === 200) {
        this.store.dispatch(setImageData({ imageData: `data:image/png;base64,${response.data.face_image}` }));
        let mediaStream = video.srcObject as MediaStream | null;
        mediaStream?.getTracks().forEach(track => track.stop());
        video.srcObject = null;
      } else {
        console.error('后端返回异常:', response);
        this.responseMessage = {
          type: ResponseMessageTypeEnum.Error,
          content: response.message || '后端返回异常'
        };
      }
    } catch (error: any) {
      console.error('请求cropped_faces接口失败:', error);
      this.responseMessage = {
        type: ResponseMessageTypeEnum.Error,
        content: error?.error?.message || '请求失败'
      };
    }
  }


  async showCountDownAnimation(): Promise<void> {
    const countdownContainer = this.cameraContainer.nativeElement;
    const countdownDiv = document.createElement('div');
    countdownDiv.className = 'countdown-style';
    countdownContainer.appendChild(countdownDiv);

    let i = 2;
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        countdownDiv.textContent = i.toString();
        i--;
        if (i === 0) {
          clearInterval(interval);
          countdownDiv.remove();
          resolve();
        }
      }, 1000);
    });
  }


  async handleCaptureClick(): Promise<void> {
    await this.startCamera();
    await this.showCountDownAnimation();
    await this.captureImage();
  }

  async startCamera() {
    const constraints: MediaStreamConstraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'environment',
        advanced: [{ exposureMode: 'continuous' } as any]
      }
    };

    this.video.nativeElement.srcObject = await navigator.mediaDevices.getUserMedia(constraints);
  }

  onClose(): void {
    this.imageData$.pipe(take(1)).subscribe(imageData => {
      if (imageData?.trim()) {
        this.store.dispatch(clearImageData());
      } else {
        this.handleCaptureClick().then();
      }
    })
  }

  ngAfterViewInit(): void {
    if (this.video) {
      this.handleCaptureClick().then();
    }
  }

  ngOnDestroy(): void {
    this.imageDataSubscription?.unsubscribe();
  }
}
