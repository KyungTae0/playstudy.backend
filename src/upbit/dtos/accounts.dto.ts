import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/core.dto';

@ObjectType()
export class Account {
  @Field((type) => String)
  currency: string;

  @Field((type) => Number)
  balance: number;

  @Field((type) => String)
  locked: string;

  @Field((type) => Number)
  avg_buy_price: number;

  @Field((type) => Boolean)
  avg_buy_price_modified: boolean;

  @Field((type) => String)
  unit_currency: string;
}

@ObjectType()
export class AccountOutput extends CoreOutput {
  @Field((type) => [Account], { nullable: true })
  accounts?: Account[];
}
