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

  @Field((type) => AuthType, { defaultValue: AuthType.Normal })
  authType: AuthType;
}
