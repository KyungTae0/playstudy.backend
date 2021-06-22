import { Injectable } from '@nestjs/common';
import { JwtService } from 'src/jwt/jwt.service';
import * as Jwt from 'jsonwebtoken';
import * as Crypto from 'crypto';
import { DatabaseService } from 'src/database/database.service';
import { CheckUserInput, CheckOutput } from './dtos/check-user.dto';

import { CreateAccountInput, CreateAccountOutput, CreateSocialAccountInput } from './dtos/create-account.dto';
import { SocialLoginInput, LoginInput, LoginOutput } from './dtos/login.dto';

export enum AuthType {
  Normal = 'normal',
  Google = 'google',
  Kakao = 'kakao',
}
@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService, private readonly jwtservice: JwtService) {}
  async createAccount({ email, password }: CreateAccountInput): Promise<CreateAccountOutput> {
    console.log(`Create Account Start : ${email}, ${password}`);
    try {
      const user = await this.findAccount({ email: email, authType: AuthType.Normal });
      if (user.success) {
        //Go는 Error를 Throw하지 않고 Return한다. 이럴 경우 Error를 조종하는게 가능하다
        return {
          success: false,
          error: `이미 등록된 회원입니다.`,
        };
      }
      const salt = process.env.SALT;
      const hashPassword = Crypto.createHash('sha512') //(algorithm)
        .update(password + salt)
        .digest('base64'); //(Encoding method)

      await this.databaseService.execute({
        sql: `INSERT INTO user (email, createdAt, password, auth_type)
              VALUES (?,now(),?,?)`,
        value: [email, hashPassword, AuthType.Normal],
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: e };
    }
  }

  //로그인
  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    console.log(`Login Start : ${email}`);
    const user = await this.findAccount({ email: email, authType: AuthType.Normal });
    if (!user.success) {
      return {
        success: false,
        error: `등록되지 않은 회원입니다. \n\ ID 확인 후 다시 시도해 주시기 바랍니다.`,
      };
    }

    const salt = process.env.SALT;
    const hashPassword = Crypto.createHash('sha512') //(algorithm)
      .update(password + salt)
      .digest('base64'); //(Encoding method)

    const passwordCheck = await this.databaseService.execute({ sql: `SELECT email FROM user WHERE password=? `, value: [hashPassword] });
    if (passwordCheck.length === 0) {
      return {
        success: false,
        error: `비밀번호가 일치하지 않습니다. \n\ 확인 후 다시 시도해 주시기 바랍니다.`,
      };
    }

    //jwt시작
    const payLoad = {
      email: email,
      authType: AuthType.Normal,
    };
    const token = this.jwtservice.sign(payLoad);

    return { success: true, token: token[0] };
  }

  // 카카오 계정 생성
  async createSocialAccount({ email, authType }: CreateSocialAccountInput): Promise<CreateAccountOutput> {
    console.log(`Create Kakao Account Start : ${email}`);
    try {
      const user = await this.findAccount({ email: email, authType: AuthType.Normal });
      if (user.success) {
        //Go는 Error를 Throw하지 않고 Return한다. 이럴 경우 Error를 조종하는게 가능하다
        return {
          success: false,
          error: `이미 등록된 회원입니다.`,
        };
      }

      await this.databaseService.execute({
        sql: `INSERT INTO user (email, createdAt, auth_type)
              VALUES (?,now(),?)`,
        value: [email, authType],
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: e };
    }
  }

  // 카카오 로그인
  async kakaoLogin({ email }: SocialLoginInput): Promise<LoginOutput> {
    console.log(`kakao Login Start : ${email}`);
    const user = await this.findAccount({ email: email, authType: AuthType.Kakao });
    if (!user.success) {
      return {
        success: false,
        error: `등록되지 않은 회원입니다. \n\ ID 확인 후 다시 시도해 주시기 바랍니다.`,
      };
    }

    //jwt시작
    const payLoad = {
      email: email,
      authType: AuthType.Normal,
    };
    const token = this.jwtservice.sign(payLoad);

    return { success: true, token: token[0] };
  }

  //회원존재여부 검수 함수
  async findAccount({ email, authType }: CheckUserInput): Promise<CheckOutput> {
    console.log(`이메일 : ${email}, 타입 : ${authType}`);
    const rows = await this.databaseService.execute({ sql: `SELECT email FROM user WHERE email = ? AND auth_type = ?`, value: [email, authType] });
    if (rows.length === 0) {
      return { success: false };
    }
    return { success: true };
  }
}
