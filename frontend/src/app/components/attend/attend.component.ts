import { Component } from '@angular/core';
import { VidioCaptureComponent } from '../vidio-capture/vidio-capture.component';
import { environment } from '../../../environments/environment';
import { ErrorMessageComponent } from '../error-message/error-message.component';
import { ResponseMessage } from '../../interfaces/response-message';
import { ResponseMessageTypeEnum } from '../../enums/response-message-type.enum';

@Component({
  selector: 'app-attend',
  standalone: true,
  imports: [VidioCaptureComponent, ErrorMessageComponent],
  templateUrl: './attend.component.html',
  styleUrl: './attend.component.scss'
})
export default class AttendComponent {
  responseMessage: ResponseMessage | null = null;
  imageData: string | null = null;

  registerCaptureReady(imageData: string) {
    this.imageData = imageData;
  }

  async onSubmitAttendForm(e: Event): Promise<void> {
    e.preventDefault();
    const formData = new FormData();
    if (this.imageData) {
      let base64Data = this.imageData;
      if (base64Data.includes(',')) {
        base64Data = base64Data.split(',')[1];
      }
      base64Data = base64Data.replace(/\s/g, '');
      formData.append('image_path', base64Data);
    }
    try {
      const res = await fetch(`${environment.API_BASE_URL}/attend`, {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      this.responseMessage = {
        type: res.ok ? ResponseMessageTypeEnum.Success : ResponseMessageTypeEnum.Error,
        content: result.message || result.error || ''
      };
    } catch (err) {
      this.responseMessage = {
        type: ResponseMessageTypeEnum.Error,
        content: '签到失败，请重试！'
      };
    }
  }
}
