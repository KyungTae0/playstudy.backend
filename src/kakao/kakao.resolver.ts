import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { KaKaoAuthInput, KaKaoAuthOutput, KakaoInfoOutput } from './dtos/kakao-auth.dto';
import { KakaoInfoInput } from './dtos/kakao-info.dto';
import { KakaoService } from './kakao.service';

@Resolver()
export class KakaoResolver {
  constructor(private readonly kakaoService: KakaoService) {}

  @Mutation((returns) => KaKaoAuthOutput)
  async kakaoAuth(@Args('data') kaKaoAuthInput: KaKaoAuthInput): Promise<KaKaoAuthOutput> {
    try {
      return await this.kakaoService.kakaoAuth(kaKaoAuthInput);
    } catch (e) {
      return {
        success: false,
        error: e,
      };
    }
  }

  @Mutation((returns) => KakaoInfoOutput)
  async getKakaoInfo(@Args('data') kakaoInfoInput: KakaoInfoInput): Promise<KakaoInfoOutput> {
    try {
      return await this.kakaoService.getKakaoInfo(kakaoInfoInput);
    } catch (e) {
      return {
        success: false,
        error: e,
      };
    }
  }
}
