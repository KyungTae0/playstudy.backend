import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/core.dto';

@ObjectType()
export class Market {
  @Field((type) => String)
  market: string;

  @Field((type) => String)
  korean_name: string;

  @Field((type) => String)
  english_name: string;

  @Field((type) => String)
  market_warning: string;
}

@ObjectType()
export class MarketListOutput extends CoreOutput {
  @Field((type) => [Market], { nullable: true })
  markets?: Market[];
}
