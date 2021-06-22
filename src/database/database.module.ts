import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { IDataBaseOptions } from './database.interfaces';
import { DatabaseService } from './database.service';

@Module({})
@Global()
export class DatabaseModule {
  static forRoot(options: IDataBaseOptions): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        DatabaseService,
      ],
      exports: [DatabaseService],
    };
  }
}
