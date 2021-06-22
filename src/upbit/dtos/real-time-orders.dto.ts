import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/core.dto';

// @InputType()
// export class TickerOrdersInput {
//   @Field((types) => String)
//   markets: string;
// }

@ObjectType()
export class TickerOrdersOutput extends CoreOutput {
  // 주문정보
  @Field((type) => [Orders])
  orders?: Orders[];

  // 보유원화
  @Field((types) => Number)
  hold_krw?: number;

  // 총 평가
  @Field((types) => Number)
  total_price?: number;

  // 총 매수
  @Field((types) => Number)
  total_buying?: number;

  // 총 보유자산
  @Field((types) => Number)
  total_assets?: number;

  // 총 수익률
  @Field((type) => Number)
  total_yield?: number;

  // 총 평가손익
  @Field((type) => Number)
  total_valuation_pnl?: number;
}

@ObjectType()
export class Orders {
  // 종목명
  @Field((type) => String)
  market: string;

  // 화폐 한글명
  @Field((type) => String)
  korean_name: string;

  // 화폐 영문명
  @Field((type) => String)
  english_name: string;

  // 잔고수량
  @Field((type) => Number)
  balance: number;

  // 평균매입가
  @Field((type) => Number)
  avg_buy_price: number;

  // 현재가
  @Field((type) => Number)
  trade_price: number;

  // 평가금액
  @Field((type) => Number)
  amount: number;

  // 평가 손익
  @Field((type) => Number)
  valuation_pnl: number;

  // 수익률
  @Field((type) => Number)
  yield: number;
}
