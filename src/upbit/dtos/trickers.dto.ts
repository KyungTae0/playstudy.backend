import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/core.dto';

@InputType()
export class TickersInput {
  @Field((types) => String)
  markets: string;
}

@ObjectType()
export class TickersOutput extends CoreOutput {
  @Field((type) => [Tickers], { nullable: true })
  tickers?: Tickers[];
}

@ObjectType()
export class Tickers {
  @Field((type) => String)
  market: string;

  @Field((type) => String)
  trade_price: number;
}
