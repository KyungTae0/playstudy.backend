import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/core.dto';

@InputType()
export class KaKaoAuthInput {
  @Field((type) => String)
  code: string;

  @Field((type) => String)
  redirectUri: string;
}

@ObjectType()
export class KaKaoAuthOutput extends CoreOutput {
  @Field((type) => String, { nullable: true })
  token?: string;
}

@ObjectType()
export class KakaoInfoOutput extends CoreOutput {
  @Field((type) => String, { nullable: true })
  email?: string;
}
