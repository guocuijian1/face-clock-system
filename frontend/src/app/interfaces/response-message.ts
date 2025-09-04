import {ResponseMessageTypeEnum} from '../enums/response-message-type.enum';

export interface ResponseMessage {
  type: ResponseMessageTypeEnum;
  content: string;
}

