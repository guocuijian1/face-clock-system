import { Component, OnDestroy } from '@angular/core';
import { VideoCaptureComponent } from '../vidio-capture/video-capture.component';
import { environment } from '../../../environments/environment';
import { MessageComponent } from '../message/message.component';
import { ResponseMessageInterface } from '../../interfaces/response-message-interface';
import { ResponseMessageTypeEnum } from '../../enums/response-message-type.enum';
import { Store } from '@ngrx/store';
import { selectImageData } from '../../store/image-data/image-data.selectors';
import { clearImageData } from '../../store/image-data/image-data.actions';
import { Observable, Subscription } from 'rxjs';
import {ResponseModel} from '../../rest-template/response-model';

@Component({
  selector: 'app-attend',
  standalone: true,
  imports: [VideoCaptureComponent, MessageComponent],
  templateUrl: './attend.component.html',
  styleUrl: './attend.component.scss'
})
export default class AttendComponent implements OnDestroy {
  responseMessage: ResponseMessageInterface | null = null;
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

  async onSubmitAttendForm(e: Event) {
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
    try {
      const res: Response = await fetch(`${environment.API_BASE_URL}/attend`, {
        method: 'POST',
        body: formData
      });
      const status = res.status;
      const result: ResponseModel = await res.json();
      if (status === 200 && result.message) {
        this.responseMessage = {
          type: ResponseMessageTypeEnum.Success,
          content: result.message
        };
      } else {
        this.responseMessage = {
          type: ResponseMessageTypeEnum.Error,
          content: result.message || '未知错误'
        };
      }
    } catch (err: any) {
      this.responseMessage = {
        type: ResponseMessageTypeEnum.Error,
        content: err.message
      };
    }
  }

  clear() {
    this.store.dispatch(clearImageData());
    this.responseMessage = null;
  }

  get isSubmitDisabled(): boolean {
    return !this.registeredImageData;
  }
}
