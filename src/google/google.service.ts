import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { DatabaseService } from 'src/database/database.service';
import { JwtService } from 'src/jwt/jwt.service';
import { AuthType } from 'src/users/models/users.model';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GoogleService {
  constructor(private readonly db: DatabaseService, private readonly usersService: UsersService, private readonly jwt: JwtService) {}

  async authGoogle(tokenId: string) {
    const oAuth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokenId,
    });

    const payload = ticket.getPayload();
    const userCheck = await this.usersService.findAccount({ email: payload.email, authType: AuthType.Google });

    // 회원이 없는경우
    if (!userCheck.success) {
      const accountUser = await this.usersService.createSocialAccount({ email: payload.email, authType: AuthType.Google });

      if (!accountUser.success) {
        return accountUser;
      }
    }

    const token = this.jwt.sign({ email: payload.email, authType: AuthType.Google });

    return {
      success: true,
      token,
    };
  }
}
