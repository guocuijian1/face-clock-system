import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {firstValueFrom, Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {clearImageData, setImageData} from '../../store/image-data.actions';
import {selectImageData} from '../../store/image-data.selectors';
import {AsyncPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-video-capture',
  imports: [
    AsyncPipe,
    NgClass
  ],
  templateUrl: './video-capture.component.html',
  standalone: true,
  styleUrl: './video-capture.component.scss'
})
export class VideoCaptureComponent implements AfterViewInit {
  @ViewChild('video', { static: false }) video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('image', { static: false }) image!: ElementRef<HTMLImageElement>;
  @ViewChild('cameraContainer', { static: false }) cameraContainer!: ElementRef<HTMLElement>;

  imageData$: Observable<string | null>;

  constructor(private readonly http: HttpClient, private readonly store: Store) {
    this.imageData$ = this.store.select(selectImageData);
    this.imageData$.subscribe(imageData => {
      console.log('imageData updated:', imageData);
      if (!imageData?.trim() && this.video) {
        this.handleCaptureClick().then(() => {});
      }
    });
  }

  async captureImage(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement
  ): Promise<string> {
    const targetWidth = video.width || video.videoWidth;
    const targetHeight = video.height || video.videoHeight;
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('无法获取canvas上下文');
    }

    // 确保视频帧被正确绘制
    context.drawImage(video, 0, 0, targetWidth, targetHeight);

    // 获取base64格式的图像数据
    const imgData = canvas.toDataURL('image/png');
    const img64 = imgData.split(',')[1];

    console.log('Image captured, size:', targetWidth, 'x', targetHeight);

    return firstValueFrom(
      this.http.post<any>(`${environment.API_BASE_URL}/cropped_faces`, {
        imageData: img64  // 只发送base64���据部分
      })
    ).then(response => {
      if (response?.status === 200) {
        // 不再直接设置 image.src，由 NgRx 状态驱动
        return response.data.face_image;
      } else {
        console.error('后端返回异常:', response);
        return '';
      }
    }).catch(error => {
      console.error('请求cropped_faces接口失败:', error);
      // 失败时返回原始 img64
      return img64;
    });
  }

  async showCountDownAnimation(countdownContainer: HTMLElement): Promise<void> {
    const countdownDiv = document.createElement('div');
    countdownDiv.className = 'countdown-style';
    countdownContainer.appendChild(countdownDiv);

    for (let i = 2; i > 0; i--) {
      countdownDiv.textContent = i.toString();
      await new Promise<void>((resolve: () => void) => setTimeout(resolve, 1000));
    }

    countdownDiv.remove();
  }

  async handleCaptureClick(): Promise<void> {
    let mediaStream: MediaStream | null = null;
    try {
      const video = this.video.nativeElement;
      const canvas = this.canvas.nativeElement;
      const cameraContainer = this.cameraContainer.nativeElement;

      // 打开摄像头
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({video: true});
      } catch (mediaErr) {
        console.error('getUserMedia失败:', mediaErr);
        alert('无法访问摄像头，请检查浏��器权限设置或设备是否连接。');
        return;
      }
      video.srcObject = mediaStream;
      await new Promise<void>((resolve: () => void) => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
      });
      console.log('摄像头已打开，画面应显示在SVG头骨区域');
      await this.showCountDownAnimation(cameraContainer);
      let imgData: string | null = null;
      imgData = await this.captureImage(video, canvas);
      let img64 = imgData?.trim() ? `data:image/png;base64,${imgData}`: '';
      this.store.dispatch(setImageData({ imageData: img64 }));
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
      }
    } catch (err) {
      console.error('摄像头打开失败:', err);
      alert('摄像头打开失败，请检查权限或设备！');
    }
  }

  clearFaceImage(): void {
    this.store.dispatch(clearImageData());
  }


  ngAfterViewInit(): void {
    if (this.video) {
      this.handleCaptureClick().then(() => {});
    }
  }
}
