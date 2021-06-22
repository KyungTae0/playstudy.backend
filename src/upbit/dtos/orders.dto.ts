import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/core.dto';

@InputType()
export class SetOrdersInput {
  @Field((types) => String)
  market: string;

  @Field((types) => String)
  side: string;

  @Field((types) => String, { nullable: true })
  volume?: string;

  @Field((types) => String, { nullable: true })
  price?: string;

  @Field((types) => String)
  ord_type: string;

  @Field((types) => String, { nullable: true })
  identifier?: string;
}

@ObjectType()
export class OrderOutput extends CoreOutput {
  @Field((types) => String, { nullable: true })
  uuid?: string;
}
// { bid_fee: '0.0005',
//   ask_fee: '0.0005',
//   maker_bid_fee: '0.0005',
//   maker_ask_fee: '0.0005',
//   market:
//    { id: 'KRW-XRP',
//      name: 'XRP/KRW',
//      order_types: [],
//      order_sides: [ 'ask', 'bid' ],
//      bid: { currency: 'KRW', price_unit: null, min_total: '5000.0' },
//      ask: { currency: 'XRP', price_unit: null, min_total: '5000.0' },
//      max_total: '1000000000.0',
//      state: 'active' },
//   bid_account:
//    { currency: 'KRW',
//      balance: '4997.5000042',
//      locked: '0.0',
//      avg_buy_price: '0',
//      avg_buy_price_modified: true,
//      unit_currency: 'KRW' },
//   ask_account:
//    { currency: 'XRP',
//      balance: '3.06748466',
//      locked: '0.0',
//      avg_buy_price: '1630',
//      avg_buy_price_modified: false,
//      unit_currency: 'KRW' } }

@ObjectType()
export class MarketData {
  @Field((types) => String)
  bid_fee: string;

  @Field((types) => String)
  ask_fee: string;

  @Field((types) => String, { nullable: true })
  maker_bid_fee?: string;

  @Field((types) => String, { nullable: true })
  maker_ask_fee?: string;
}

@ObjectType()
export class OrdersChanceOutput extends CoreOutput {
  @Field((types) => MarketData, { nullable: true })
  data?: any;
}
