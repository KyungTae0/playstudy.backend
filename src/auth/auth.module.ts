import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],

  //   providers: [
  //     {
  //       provide: APP_GUARD,
  //       useClass: AuthGuard,
  //     },
  //     AuthGuard,
  //   ],
})
export class AuthModule {}
