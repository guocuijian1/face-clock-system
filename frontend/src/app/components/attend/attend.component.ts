import { Component, OnDestroy } from '@angular/core';
import { VideoCaptureComponent } from '../vidio-capture/video-capture.component';
import { environment } from '../../../environments/environment';
import { ErrorMessageComponent } from '../error-message/error-message.component';
import { ResponseMessage } from '../../interfaces/response-message';
import { ResponseMessageTypeEnum } from '../../enums/response-message-type.enum';
import { Store } from '@ngrx/store';
import { selectImageData } from '../../store/image-data.selectors';
import { clearImageData } from '../../store/image-data.actions';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-attend',
  standalone: true,
  imports: [VideoCaptureComponent, ErrorMessageComponent],
  templateUrl: './attend.component.html',
  styleUrl: './attend.component.scss'
})
export default class AttendComponent implements OnDestroy {
  responseMessage: ResponseMessage | null = null;
  imageData$: Observable<string | null>;
  registeredImageData: string | null = null;
  private readonly imageDataSub?: Subscription;

  constructor(private readonly store: Store) {
    this.imageData$ = this.store.select(selectImageData);
    this.imageDataSub = this.imageData$.subscribe(imageData => {
      if (imageData) {
        let base64Data = imageData;
        if (base64Data.includes(',')) {
          base64Data = base64Data.split(',')[1];
        }
        this.registeredImageData = base64Data.replace(/\s/g, '');
      }
    });
  }

  ngOnDestroy(): void {
    this.imageDataSub?.unsubscribe();
  }

  onSubmitAttendForm(e: Event): void {
    e.preventDefault();
    if (!this.registeredImageData) {
      this.responseMessage = {
        type: ResponseMessageTypeEnum.Error,
        content: '请先拍摄或上传人脸照片'
      };
      return;
    }
    const formData = new FormData();
    formData.append('image_path', this.registeredImageData);
    fetch(`${environment.API_BASE_URL}/attend`, {
      method: 'POST',
      body: formData
    })
      .then(res => res.json().then(result => {
        this.responseMessage = {
          type: res.ok ? ResponseMessageTypeEnum.Success : ResponseMessageTypeEnum.Error,
          content: result.message || result.error || ''
        };
      }))
      .catch(() => {
        this.responseMessage = {
          type: ResponseMessageTypeEnum.Error,
          content: '签到失败，请重试！'
        };
      });
  }

  clear() {
    this.store.dispatch(clearImageData());
    this.responseMessage = null;
  }
}
