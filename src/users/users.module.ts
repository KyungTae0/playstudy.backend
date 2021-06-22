import { Module } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [],
  providers: [UsersResolver, UsersService, AuthGuard],
})
export class UsersModule {}
