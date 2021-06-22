import { HttpModule, Module } from '@nestjs/common';
import { UsersModel } from 'src/users/models/users.model';
import { UsersService } from 'src/users/users.service';
import { KakaoResolver } from './kakao.resolver';
import { KakaoService } from './kakao.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  providers: [KakaoResolver, KakaoService, UsersService],
})
export class KakaoModule {}
