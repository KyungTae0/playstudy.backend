import * as mysql from 'mysql2/promise';

import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { IDataBaseOptions } from './database.interfaces';

import { DataBaseExecuteInput } from './database.dto';

@Injectable()
export class DatabaseService {
  constructor(@Inject(CONFIG_OPTIONS) private readonly Options: IDataBaseOptions) {
    this.POOL = mysql.createPool(Options);
  }
  private readonly POOL;

  async execute({ sql, value }: DataBaseExecuteInput) {
    const [result] = await this.POOL.execute(sql, value);
    return result;
  }
}
