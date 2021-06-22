import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { query } from 'express';
import { CoreOutput } from 'src/common/dtos/core.dto';
import { AccountOutput } from './dtos/accounts.dto';
import { MarketListOutput } from './dtos/markets.dto';
import { OrderOutput, OrdersChanceOutput, SetOrdersInput } from './dtos/orders.dto';
import { TickerOrdersOutput } from './dtos/real-time-orders.dto';
import { TickersInput, TickersOutput } from './dtos/trickers.dto';
import { UpbitService } from './upbit.service';

@Resolver()
export class UpbitResolver {
  constructor(private readonly upbitService: UpbitService) {}

  // query{
  //   marketList{
  //     ok,
  //     markets {
  //       market,
  //       korean_name
  //     }
  //   }
  // }
  @Query((returns) => MarketListOutput)
  async marketList(): Promise<MarketListOutput> {
    return await this.upbitService.marketList();
  }

  // query{
  //   ordersChance(market:"KRW-XRP"){
  //     ok,
  //     error,
  //     data{
  //       bid_fee,
  //       ask_fee,
  //       maker_bid_fee,
  //       maker_ask_fee
  //     }
  //   }
  // }
  // @Query((returns) => OrdersChanceOutput)
  // async ordersChance(@Args('market') market: string): Promise<OrdersChanceOutput> {
  //   return await this.upbitService.ordersChance(market);
  // }

  // query{
  //   accounts{
  //     ok,
  //     error,
  //     accounts{
  //       currency,
  //       balance,
  //       locked,
  //       avg_buy_price,
  //       avg_buy_price_modified,
  //       unit_currency
  //     }
  //   }
  // }
  @Query((returns) => AccountOutput)
  async accounts(): Promise<AccountOutput> {
    return await this.upbitService.accounts();
  }

  // mutation{
  //   setOrders(input:{
  //       market: "KRW-XRP",
  //       side: "bid",
  //       price: "5000",
  //       ord_type: "price",
  //   })
  //   {
  //     ok,
  //     uuid,
  //     error
  //   }
  // }
  @Mutation((returns) => OrderOutput)
  async setOrders(@Args('input') input: SetOrdersInput): Promise<OrderOutput> {
    return await this.upbitService.setOrder(input);
  }

  // query{
  //   getTicker(input:{
  //     markets:"KRW-XRP,KRW-BTC"
  //   }){
  //     success,
  //     tickers{
  //       market,opening_price
  //     }
  //     ,error
  //  }
  // }
  @Query((returns) => TickersOutput)
  async getTicker(@Args('input') input: TickersInput): Promise<TickersOutput> {
    return await this.upbitService.getTicker(input);
  }

  // query{
  //   getRealTimeOrder{
  //     success,
  //     hold_krw,
  //     orders{
  //       market,
  //       korean_name,
  //       english_name,
  //       amount,
  //       avg_buy_price,
  //       balance,
  //       opening_price,
  //       valuation_pnl,
  //       yield
  //     },
  //     success
  //     ,error
  //   }
  // }
  @Query((returns) => TickerOrdersOutput)
  async getRealTimeOrder(): Promise<TickerOrdersOutput> {
    return await this.upbitService.getRealTimeOrder();
  }
}
