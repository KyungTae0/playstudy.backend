import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/core.dto';
import { UsersModel } from '../models/users.model';

@InputType()
export class LoginInput extends PickType(UsersModel, [`email`, `password`]) {}

@InputType()
export class SocialLoginInput extends PickType(UsersModel, [`email`]) {
  @Field((type) => String, { nullable: true })
  accessToken?: string;
}

@ObjectType()
export class LoginOutput extends CoreOutput {
  @Field((type) => String, { nullable: true })
  token?: string;
}
