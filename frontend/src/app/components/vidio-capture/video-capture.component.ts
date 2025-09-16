import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {clearImageData, setImageData} from '../../store/image-data/image-data.actions';
import {selectImageData} from '../../store/image-data/image-data.selectors';
import {AsyncPipe, NgClass } from '@angular/common';
import {MessageComponent} from '../message/message.component';
import {ResponseMessageInterface} from '../../interfaces/response-message-interface';
import {ResponseMessageTypeEnum} from '../../enums/response-message-type.enum';

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
export class VideoCaptureComponent implements AfterViewInit {
  @ViewChild('video', { static: false }) video!: ElementRef<HTMLVideoElement>;
  @ViewChild('image', { static: false }) image!: ElementRef<HTMLImageElement>;
  @ViewChild('cameraContainer', { static: false }) cameraContainer!: ElementRef<HTMLElement>;

  imageData$: Observable<string | null>;
  responseMessage: ResponseMessageInterface | null = null;

  constructor(private readonly http: HttpClient, private readonly store: Store) {
    this.imageData$ = this.store.select(selectImageData);
    this.imageData$.subscribe(imageData => {
      console.log('imageData updated:', imageData);
      if (!imageData?.trim() && this.video) {
        this.handleCaptureClick();
      }
    });
  }

  captureImage(): void {
    const video = this.video.nativeElement;
    // 始终使用视频流的真实分辨率，避免模糊
    const targetWidth = video.videoWidth;
    const targetHeight = video.videoHeight;
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      console.error('无法获取canvas 2d context');
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 直接导出截图 base64
    const imgData = canvas.toDataURL('image/png');
    const img64 = imgData.split(',')[1];
    console.log('Captured image base64:', imgData);

    let subscription = this.http.post<any>(`${environment.API_BASE_URL}/cropped_faces`, {
      imageData: img64  // 只发送base64数据部分
    }).subscribe({
      next: (response) => {
        if (response?.status === 200) {
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
      },
      error: (error) => {
        console.error('请求cropped_faces接口失败:', error);
        this.responseMessage = {
          type: ResponseMessageTypeEnum.Error,
          content: error.error?.message || '请求失败'
        };
      },
      complete: () => {
        subscription.unsubscribe();
      }
    })
  }

  showCountDownAnimation(): void {
    const countdownContainer = this.cameraContainer.nativeElement;
    const countdownDiv = document.createElement('div');
    countdownDiv.className = 'countdown-style';
    countdownContainer.appendChild(countdownDiv);

    let i = 2;
    const interval = setInterval(() => {
      countdownDiv.textContent = i.toString();
      i--;
      if (i === 0) {
        clearInterval(interval);
        countdownDiv.remove();
      }
    }, 1000);
  }

  handleCaptureClick(): void {
    let mediaStream: MediaStream | null = null;
    const video = this.video.nativeElement;
    navigator.mediaDevices.getUserMedia({video: true})
      .then(stream => {
        mediaStream = stream;
        video.srcObject = mediaStream;
        return new Promise<void>((resolve) => {
          video.onloadedmetadata = () => {
            video.play().then(resolve);
          };
        });
      })
      .then(() => {
        return this.showCountDownAnimation();
      })
      .then(() => this.captureImage())
      .catch(err => {
        console.error('摄像头打开失败:', err);
        alert('摄像头打开失败，请检查权限或设备！');
        if (mediaStream) {
          mediaStream.getTracks().forEach(track => track.stop());
          video.srcObject = null;
        }
      });
  }

  onClose(): void {
    const subscription = this.store.select(selectImageData).subscribe({
      next: (imageData) => {
        if (imageData?.trim()) {
          this.store.dispatch(clearImageData());
        } else {
          this.handleCaptureClick();
        }
      },
      complete: () => {
        subscription.unsubscribe();
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.video) {
      this.handleCaptureClick();
    }
  }
}
