import {Component, OnInit,Output, EventEmitter} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-vidio-capture',
  imports: [],
  templateUrl: './vidio-capture.component.html',
  standalone: true,
  styleUrl: './vidio-capture.component.scss'
})
export class VidioCaptureComponent implements OnInit {
  @Output() onCaptureReady = new EventEmitter<string>();
  faceLocations: Array<[number, number, number, number]> = [];
  faceImages: string[] = [];
  apiUrl = environment.API_BASE_URL;

  constructor(private http: HttpClient) { }

  displayFaceImages() {
    const container = document.querySelector('.face-images-container');
    if (!container) return;

    // 清除现有的图片
    container.innerHTML = '';

    // 显示所有检测到的人脸
    this.faceImages.forEach((base64Image, index) => {
      const img = document.createElement('img');
      img.src = `data:image/png;base64,${base64Image}`;
      img.classList.add('face-image');
      img.style.display = 'block';
      container.appendChild(img);
    });
  }

  async captureImage(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    image: HTMLImageElement
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

    try {
      const response = await firstValueFrom(
        this.http.post<any>(`${environment.API_BASE_URL}/cropped_faces`, {
          imageData: img64  // 只发送base64数据部分
        })
      );
      // 处理后端返回的数据结构
      if (response && response.status === 200) {
        const faceImageBase64 = response.data.face_image;
        console.log('Face image (base64):', faceImageBase64);

        image.src = `data:image/png;base64,${faceImageBase64}`;
        image.style.display = 'block';

        return faceImageBase64;
      } else {
        console.error('后端返回异常:', response);
        return '';
      }
    } catch (error) {
      console.error('请求cropped_faces接口失败:', error);
      image.src = imgData;
      image.style.display = 'block';
      return '';
    }
  }

  async showCountDownAnimation(countdownContainer: HTMLElement): Promise<void> {
    const countdownDiv = document.createElement('div');
    countdownDiv.style.position = 'absolute';
    countdownDiv.style.top = '50%';
    countdownDiv.style.left = '50%';
    countdownDiv.style.transform = 'translate(-50%, -50%)';
    countdownDiv.style.fontSize = '48px';
    countdownDiv.style.color = 'white';
    countdownDiv.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.7)';
    countdownDiv.style.zIndex = '10';
    countdownDiv.style.pointerEvents = 'none';
    countdownContainer.appendChild(countdownDiv);

    for (let i = 5; i > 0; i--) {
      countdownDiv.textContent = i.toString();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    countdownDiv.remove();
  }


  async handleCaptureClick(): Promise<void> {
    try {
      const video = document.getElementById('video') as HTMLVideoElement;
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      const image = document.getElementById('image') as HTMLImageElement;
      const cameraContainer = document.getElementById('cameraContainer') as HTMLElement;
      cameraContainer.style.display = 'block';
      cameraContainer.style.width = '100%';
      cameraContainer.style.height = '320px';
      cameraContainer.style.position = 'relative';
      video.style.display = 'block';
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      video.setAttribute('autoplay', 'true');
      video.setAttribute('muted', 'true');
      video.setAttribute('playsinline', 'true');
      if (canvas) {
        canvas.style.display = 'block';
        canvas.width = 320;
        canvas.height = 240;
      }
      if (image) {
        image.style.display = 'none';
        image.style.width = '100%';
        image.style.height = '100%';
        image.style.objectFit = 'contain';
      }
      console.log('打开摄像头...');
      video.srcObject = await navigator.mediaDevices.getUserMedia({video: true});
      await new Promise<void>(resolve => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
      });
      console.log('摄像头已打开，画面应显示在SVG头骨区域');
      await this.showCountDownAnimation(cameraContainer);
      let imgData: string | null = null;
      if (image) {
        imgData = await this.captureImage(video, canvas, image);
        image.style.display = 'block';
        this.onCaptureReady.emit(imgData);
      }
      if (video.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        video.srcObject = null;
      }
      video.style.display = 'none';
      if (canvas) canvas.style.display = 'none';
    } catch (err) {
      console.error('摄像头打开失败:', err);
      alert('摄像头打开失败，请检查权限或设备！');
    }
  }

  ngOnInit() {
    this.handleCaptureClick().then(() => {});
  }
}
