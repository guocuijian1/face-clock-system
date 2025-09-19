// rest-template/response-model.ts
export interface ResponseModel<T = any> {
  status: number;
  message: string;
  data?: T;
}
