import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/core.dto';

@ObjectType()
export class AuthGoogleOutput extends CoreOutput {
  @Field((type) => String, { nullable: true })
  token?: string;
}
