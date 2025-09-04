import {Component} from '@angular/core';
import {VidioCaptureComponent} from '../vidio-capture/vidio-capture.component';
import {ErrorMessageComponent} from '../error-message/error-message.component';
import {environment} from '../../../environments/environment';
import {FormsModule} from '@angular/forms';
import {ResponseMessage} from '../../interfaces/response-message';
import {ResponseMessageTypeEnum} from '../../enums/response-message-type.enum';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [VidioCaptureComponent, ErrorMessageComponent, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export default class RegisterComponent {
  registerImageData: string | null = null;
  responseMessage: ResponseMessage | null = null;
  name: string = '';
  job_id: string = '';

  registerCaptureReady(imageData: string) {
    this.registerImageData = imageData;
  }

  async onSubmitRegisterForm(e: Event): Promise<void> {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('job_id', this.job_id);

    if (this.registerImageData) {
      // 只取base64部分，去掉前缀
      let base64Data = this.registerImageData;
      if (base64Data.includes(',')) {
        base64Data = base64Data.split(',')[1];
      }
      // base64字符串可能有空格或换行，需清理
      base64Data = base64Data.replace(/\s/g, '');
      this.responseMessage = null;
      // 转为二进制
      try {
        const bstr = atob(base64Data);
        const n = bstr.length;
        const u8arr = new Uint8Array(n);
        for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
        const imageBlob = new Blob([u8arr], { type: 'image/png' });
        formData.append('image_path', imageBlob, 'captured.png');
      } catch (err) {
        this.responseMessage = {
          type:ResponseMessageTypeEnum.Error,
          content:'图片base64解码失败'
        }
        return;
      }
    }

    try {
      const res = await fetch(`${environment.API_BASE_URL}/register`, {
        method: 'POST',
        body: formData
      });
      const status = res.status;
      const result = await res.json();
      if (status === 200 && result.message) {
        //.this.responseMessage = result.message;
        this.responseMessage = {
          type:ResponseMessageTypeEnum.Success,
          content:result.message
        }
      } else {
        this.responseMessage = {
          type:ResponseMessageTypeEnum.Error,
          content:'注册失败，请重试！'
        };
      }
    } catch (err:any) {
      this.responseMessage = {
        type:ResponseMessageTypeEnum.Error,
        content:err.message
      };
    }
  }
}
