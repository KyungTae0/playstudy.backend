import { Module } from '@nestjs/common';
import { GoogleService } from './google.service';
import { GoogleResolver } from './google.resolver';
import { UsersService } from 'src/users/users.service';

@Module({
  providers: [GoogleService, GoogleResolver, UsersService],
})
export class GoogleModule {}
