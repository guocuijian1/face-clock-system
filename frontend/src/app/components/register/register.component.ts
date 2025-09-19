import {Component, ViewChild, OnDestroy} from '@angular/core';
import {VideoCaptureComponent} from '../vidio-capture/video-capture.component';
import {MessageComponent} from '../message/message.component';
import {environment} from '../../../environments/environment';
import {FormsModule} from '@angular/forms';
import {ResponseMessageInterface} from '../../interfaces/response-message-interface';
import {ResponseMessageTypeEnum} from '../../enums/response-message-type.enum';
import { Store } from '@ngrx/store';
import { selectImageData } from '../../store/image-data/image-data.selectors';
import { Observable, Subscription } from 'rxjs';
import {clearImageData} from '../../store/image-data/image-data.actions';
import {ResponseModel} from '../../rest-template/response-model';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [VideoCaptureComponent, MessageComponent, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export default class RegisterComponent implements OnDestroy {
  registerImageData: string | null = null;
  responseMessage: ResponseMessageInterface | null = null;
  name: string = '';
  job_id: string = '';
  imageData$: Observable<string | null>;
  private readonly imageDataSub?: Subscription;

  @ViewChild(VideoCaptureComponent) videoCapture!: VideoCaptureComponent;

  constructor(private readonly store: Store) {
    this.imageData$ = this.store.select(selectImageData);
    this.imageDataSub = this.imageData$.subscribe(data => {
      if (data) {
        this.registerImageData = data;
      }
    });
  }

  ngOnDestroy(): void {
    this.imageDataSub?.unsubscribe();
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
      } catch (err:any) {
        this.responseMessage = {
          type:ResponseMessageTypeEnum.Error,
          content:'图片base64解码失败'
        }
        console.log(err.error.message);
      }
    }

    try {
      const res = await fetch(`${environment.API_BASE_URL}/register`, {
        method: 'POST',
        body: formData
      });
      const status = res.status;
      const result:ResponseModel = await res.json();
      if (status === 200 && result.message) {
        this.responseMessage = {
          type:ResponseMessageTypeEnum.Success,
          content:result.message
        }
      } else {
        this.responseMessage = {
          type:ResponseMessageTypeEnum.Error,
          content:result.message
        };
      }
    } catch (err:any) {
      this.responseMessage = {
        type:ResponseMessageTypeEnum.Error,
        content:err.message
      };
    }
  }

  clearForm(): void {
    this.store.dispatch(clearImageData());
  }
}
