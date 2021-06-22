import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UsersService } from 'src/users/users.service';
import { JwtService } from 'src/jwt/jwt.service';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly usersService: UsersService, private readonly jwtwervice: JwtService) {}
  async canActivate(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const token = gqlContext.token;
    if (token) {
      const decoded = await this.jwtwervice.verify(token.toString());

      if (typeof decoded === 'object' && decoded['email']) {
        const user = await this.usersService.findAccount({ email: decoded['email'], authType: decoded['authType'] });
        if (user.success) {
          gqlContext['user'] = decoded;

          return true;
          //   if (roles.includes('Any')) {
          //     return true;
          //   }
          //   return roles.includes(user.role);
          // }
        }
      }
    } else {
      console.log('token not found');
    }
    return false;
  }
}
