import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtService } from './jwt.service';

@Module({})
@Global()
export class JwtModule {
  static forRoot(options): DynamicModule {
    return {
      module: JwtModule,
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
      ],
      exports: [JwtService],
    };
  }
}
