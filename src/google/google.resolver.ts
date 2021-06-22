import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGoogleOutput } from './dtos/authGoogle.dto';
import { GoogleService } from './google.service';

@Resolver()
export class GoogleResolver {
  constructor(private readonly googleService: GoogleService) {}

  @Mutation((returns) => AuthGoogleOutput)
  async authGoogle(@Args('tokenId') tokenId: string) {
    try {
      return await this.googleService.authGoogle(tokenId);
    } catch (err) {
      return {
        success: false,
        error: err?.message || err,
      };
    }
  }
}
