import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { Algorithm } from 'jsonwebtoken';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtModuleOptions } from './jwt.interface';

const algorithm: Algorithm = 'HS512';
const expiresIn: number | string = '1 days';

const JWTCONFIG = {
  option: {
    algorithm,
    expiresIn,
  },
};

@Injectable()
export class JwtService {
  constructor(@Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions) {}
  async sign(data: any): Promise<string> {
    const payLoad = {
      ...data,
    };
    const token = jwt.sign(payLoad, this.options.privateKey, JWTCONFIG.option);

    return token;
  }

  async verify(token: string): Promise<any> {
    try {
      const decodeData = jwt.verify(token, this.options.privateKey);
      const a = JSON.stringify(decodeData);
      const b = JSON.parse(a);

      return b;
    } catch (e) {
      // throw e;
      throw {
        error: '이메일 또는 비밀번호를 확인하여 주시기 바랍니다.',
        status: 403,
        notify: 'alert',
      };
    }
  }
}
