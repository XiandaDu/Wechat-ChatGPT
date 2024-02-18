import { Injectable } from '@nestjs/common';
import { qrUrl } from './utils/wechaty_handle';

@Injectable()
export class AppService {
  getHello(): string {
    return qrUrl;
  }
}
