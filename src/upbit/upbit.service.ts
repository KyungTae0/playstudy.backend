import { Get, HttpService, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import * as querystring from 'querystring';
import { OrderOutput, SetOrdersInput } from './dtos/orders.dto';
import { Account, AccountOutput } from './dtos/accounts.dto';
import { TickersInput, TickersOutput } from './dtos/trickers.dto';
import { Orders, TickerOrdersOutput } from './dtos/real-time-orders.dto';
import { relocatedError } from '@graphql-tools/utils';
import { MarketListOutput } from './dtos/markets.dto';

interface IPayload {
  access_key;
  nonce;
  query_hash?;
  query_hash_alg?;
}

@Injectable()
export class UpbitService {
  constructor(private http: HttpService) {}
  private SERVICE_URL = 'https://api.upbit.com';

  async getToken(data?: any) {
    const payload: IPayload = {
      access_key: process.env.UPBIT_ACCESS_KEY,
      nonce: v4(),
    };

    if (data) {
      const query = querystring.encode(data);
      const hash = crypto.createHash('sha512');
      const queryHash = hash.update(query, 'utf-8').digest('hex');

      payload.query_hash = queryHash;
      payload.query_hash_alg = 'SHA512';
    }

    const token = jwt.sign(payload, process.env.UPBIT_SECRET_KEY);

    return token;
  }

  async accounts(): Promise<AccountOutput> {
    try {
      const result = await this.http
        .request({
          method: 'GET',
          url: this.SERVICE_URL + '/v1/accounts',
          headers: { Authorization: `Bearer ${await this.getToken()}` },
        })
        .toPromise();

      return { success: true, accounts: result.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.error?.message || err.message };
    }

    // .subscribe((data) => {
    //   console.log(data.data);
    // });
    // console.log('result', result);
  }

  async ordersChance(market) {
    try {
      const params = {
        market,
      };
      const result = await this.http
        .request({
          method: 'GET',
          url: this.SERVICE_URL + '/v1/orders/chance',
          headers: { Authorization: `Bearer ${await this.getToken(params)}` },
          params,
        })
        .toPromise();
      return { success: true, data: result.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.error?.message || err.message };
    }
  }

  async marketList(): Promise<MarketListOutput> {
    try {
      const result = await this.http
        .request({
          method: 'GET',
          url: this.SERVICE_URL + '/v1/market/all',
          headers: { Authorization: `Bearer ${await this.getToken()}` },
        })
        .toPromise();

      return { success: true, markets: result.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.error?.message || err.message };
    }
  }

  async setOrder(input: SetOrdersInput): Promise<OrderOutput> {
    // const params = {
    //   market: 'BTC-XRP',
    //   side: 'bid',
    //   volume: '2000',
    //   price: '2000',
    //   ord_type: 'price',
    //   identifier: '1000'
    // };
    try {
      // console.log({
      //   method: 'POST',
      //   url: this.SERVICE_URL + '/v1/orders',
      //   headers: { Authorization: `Bearer ${await this.getToken(input)}` },
      //   data: input,
      // });
      const result = await this.http
        .request({
          method: 'POST',
          url: this.SERVICE_URL + '/v1/orders',
          headers: { Authorization: `Bearer ${await this.getToken(input)}` },
          data: input,
        })
        .toPromise();

      return { success: true, uuid: result.data.uuid };
    } catch (err) {
      return { success: false, error: err.response?.data?.error?.message || err.message };
    }
  }
  // https://docs.upbit.com/reference#ticker%ED%98%84%EC%9E%AC%EA%B0%80-%EB%82%B4%EC%97%AD
  async getTicker({ markets }: TickersInput): Promise<TickersOutput> {
    try {
      const params = {
        markets: markets,
      };

      const result = await this.http
        .request({
          method: 'GET',
          url: this.SERVICE_URL + '/v1/ticker',
          headers: { Accept: 'application/json', Authorization: `Bearer ${await this.getToken(params)}` },
          params,
        })
        .toPromise();

      return { success: true, tickers: result.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.error?.message || err.message };
    }
  }

  async getRealTimeOrder(): Promise<TickerOrdersOutput> {
    try {
      // 회원 종목 매수 상세정보
      const accounts = (await this.accounts()).accounts;

      // 보유 종목명 리스트
      const currencys: Array<string> = [];
      // 주문정보
      const orders: Array<Orders> = [];

      // 보유원화
      let krw: number;

      // 보유 종목들 명칭만 추출
      accounts.forEach((o) => {
        if (o.currency !== 'KRW') {
          currencys.push(o.unit_currency + '-' + o.currency);
        } else {
          krw = +o.balance;
        }
      });

      // 보유종목 상세조회
      const tickers = (await this.getTicker({ markets: currencys.join(',') })).tickers;

      // 종목 코드 조회
      const markets_all = (await this.marketList()).markets;

      let total_buying_amount = 0;
      let total_buy_price = 0;

      // 실시간 주문 반환정보 가공
      tickers.forEach(async (ticker) => {
        const order: Orders = new Orders();
        const account: Account = accounts.find((acc) => acc.unit_currency + '-' + acc.currency === ticker.market);
        const market_info = markets_all.find((market) => market.market === ticker.market);

        // 종목코드
        order.market = ticker.market;
        // 종목 한글명
        order.korean_name = market_info.korean_name;
        // 종목 영문명
        order.english_name = market_info.english_name;

        // 현재가
        order.trade_price = +ticker.trade_price;
        // 평단가
        order.avg_buy_price = +account.avg_buy_price;
        // 잔고수량
        order.balance = +account.balance;
        // 평가금액
        order.amount = +account.balance * +ticker.trade_price;
        // 총 평가금액
        total_buying_amount += order.amount;
        // 매입시 가격 (변수선언만)
        const buy_price = +account.balance * +account.avg_buy_price;
        // 매입시 총 가격
        total_buy_price += buy_price;
        // 평가손익
        order.valuation_pnl = +account.balance * ticker.trade_price - buy_price;
        // 수익률
        order.yield = ((order.amount - buy_price) / buy_price) * 100;

        // 반올림처리
        order.trade_price = Math.round(order.trade_price);
        order.avg_buy_price = Math.round(order.avg_buy_price);
        //order.balance = this.SetRounds(order.balance);
        order.amount = Math.round(order.amount);
        order.valuation_pnl = Math.round(order.valuation_pnl);
        order.yield = this.SetRounds(order.yield);

        orders.push(order);
      });
      // 총 보유 원화
      const total_assets: number = Math.round(total_buying_amount + krw);

      // 반올림처리
      krw = Math.round(krw);
      total_buying_amount = Math.round(total_buying_amount);
      total_buy_price = Math.round(total_buy_price);

      // 총 수익률
      const total_yield = this.SetRounds((total_buying_amount / total_buy_price - 1) * 100);

      // 총 평가손익
      const total_valuation_pnl = Math.round(total_buying_amount - total_buy_price);
      return {
        success: true,
        orders: orders,
        hold_krw: krw,
        total_assets: total_assets,
        total_buying: total_buy_price,
        total_price: total_buying_amount,
        total_yield: total_yield,
        total_valuation_pnl: total_valuation_pnl,
      };
    } catch (err) {
      // console.log(err);
      return { success: false, error: err.response?.data?.error?.message || err.message };
    }
  }

  // 소수면 반올림 둘째자리까지
  SetRounds(num: number) {
    try {
      if (!Number.isInteger(num)) {
        num = Number(num.toFixed(2));
      }
      return num;
    } catch {
      return num;
    }
  }
}
