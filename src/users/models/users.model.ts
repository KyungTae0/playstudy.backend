import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CoreModel } from 'src/common/models/core.model';

export enum AuthType {
  Normal = 'normal',
  Google = 'google',
  Kakao = 'kakao',
}

registerEnumType(AuthType, { name: `authType` });

@InputType({ isAbstract: true })
@ObjectType()
export class UsersModel extends CoreModel {
  @Field((type) => String)
  @IsString()
  email: string;

  @Field((type) => String)
  @IsString()
  password: string;

  @Field((type) => String, { nullable: true })
  @IsString()
  role?: string;

  @Field((type) => AuthType, { defaultValue: AuthType.Normal })
  authType: AuthType;

  @Field((type) => String, { nullable: true })
  @IsString()
  Introduce?: string;

  @Field((type) => String, { nullable: true })
  @IsString()
  nick_name?: string;

  @Field((type) => String, { nullable: true })
  @IsString()
  profile_picture?: string;

  @Field((type) => String, { nullable: true })
  @IsString()
  maner_score?: string;

  @Field((type) => String, { nullable: true })
  @IsString()
  social_url?: string;
}
