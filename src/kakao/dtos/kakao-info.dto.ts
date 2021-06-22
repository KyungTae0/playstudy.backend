import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/core.dto';

@InputType()
export class KakaoInfoInput {
  @Field((type) => String)
  accessToken: string;
}

@ObjectType()
export class KakaoInfoOutput extends CoreOutput {
  @Field((type) => String, { nullable: true })
  email?: string;
}
