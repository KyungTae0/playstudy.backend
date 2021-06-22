import { HttpService, Injectable } from '@nestjs/common';
import { KaKaoAuthInput, KaKaoAuthOutput, KakaoInfoOutput } from './dtos/kakao-auth.dto';
import * as qs from 'qs';
import { KakaoInfoInput } from './dtos/kakao-info.dto';
import { UsersService } from 'src/users/users.service';
import { AuthType } from 'src/users/models/users.model';

@Injectable()
export class KakaoService {
  constructor(private http: HttpService, private users: UsersService) {}

  private SERVICE_URL_KAUTH = 'https://kauth.kakao.com';
  private SERVICE_URL_KAPI = 'https://kapi.kakao.com';

  // 카카오 검증
  // 인가코드로 엑세스토큰 조회 -> 엑세스토큰으로 카카오 계정정보 조회
  // -> 카카오 계정정보 회원여부 확인 -> 여부에 따라 로그인 또는 회원가입 후 로그인
  async kakaoAuth({ code, redirectUri }: KaKaoAuthInput): Promise<KaKaoAuthOutput> {
    let error;
    try {
      const params = {
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_ACCESS_KEY,
        redirect_uri: redirectUri,
        code: code,
      };

      const result = await this.http
        .request({
          method: 'POST',
          url: this.SERVICE_URL_KAUTH + '/oauth/token',
          headers: { 'Content-type': 'application/x-www-form-urlencoded;charset=utf-8' },
          data: qs.stringify(params),
        })
        .toPromise();

      const accessToken = result.data.access_token;

      const kakaoEmail = (await this.getKakaoInfo({ accessToken: accessToken })).email;

      const checkMember = await this.users.findAccount({ email: kakaoEmail, authType: AuthType.Kakao });

      if (checkMember.success) {
        const tokenInfo = await this.users.kakaoLogin({ email: kakaoEmail, accessToken: accessToken });

        if (tokenInfo.success) {
          return { success: true, token: accessToken };
        } else {
          return { success: false, error: tokenInfo.error };
        }
      } else {
        const createInfo = await this.users.createSocialAccount({ email: kakaoEmail, authType: AuthType.Kakao });
        if (createInfo.success) {
          const tokenInfo = await this.users.kakaoLogin({ email: kakaoEmail, accessToken: accessToken });

          if (tokenInfo.success) {
            return { success: true, token: accessToken };
          } else {
            return { success: false, error: tokenInfo.error };
          }
        } else {
          return { success: false, error: createInfo.error };
        }
      }
    } catch (e) {
      //console.log(e);
      if (e.response?.data?.error_code === 'KOE320') {
        error = '사용이 불가한 인가코드입니다.';
      }
      return { success: false, error: `카카오 토큰 조회중 에러!  ${error}` };
    }
  }

  // 카카오 계정정보 조회
  async getKakaoInfo({ accessToken }: KakaoInfoInput): Promise<KakaoInfoOutput> {
    try {
      // const params = {
      //   property_keys: '["kakao_account.email"]',
      // };

      // const result = await this.http
      //   .request({
      //     method: 'POST',
      //     url: this.SERVICE_URL_KAPI + '/v2/user/me',
      //     headers: { Authorization: `Bearer ${accessToken}` },
      //     data: qs.stringify(params),
      //   })
      //   .toPromise();

      const result = await this.http
        .request({
          method: 'GET',
          url: this.SERVICE_URL_KAPI + '/v2/user/me',
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .toPromise();

      if (result.data.kakao_account.email == '') {
        return {
          success: false,
          error: '엑세스토큰 정보가 올바르지 않습니다.',
        };
      }

      return {
        success: true,
        email: result.data.kakao_account.email,
      };
    } catch (e) {
      return {
        success: false,
        error: e,
      };
    }
  }
}
