import { HttpModule, Module } from '@nestjs/common';
import { UpbitService } from './upbit.service';
import { UpbitResolver } from './upbit.resolver';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  providers: [UpbitService, UpbitResolver],
})
export class UpbitModule {}
