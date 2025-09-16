import {ResponseMessageTypeEnum} from '../enums/response-message-type.enum';

export interface ResponseMessageInterface {
  type: ResponseMessageTypeEnum;
  content: string;
}



