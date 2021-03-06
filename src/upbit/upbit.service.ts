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
      // ?????? ?????? ?????? ????????????
      const accounts = (await this.accounts()).accounts;

      // ?????? ????????? ?????????
      const currencys: Array<string> = [];
      // ????????????
      const orders: Array<Orders> = [];

      // ????????????
      let krw: number;

      // ?????? ????????? ????????? ??????
      accounts.forEach((o) => {
        if (o.currency !== 'KRW') {
          currencys.push(o.unit_currency + '-' + o.currency);
        } else {
          krw = +o.balance;
        }
      });

      // ???????????? ????????????
      const tickers = (await this.getTicker({ markets: currencys.join(',') })).tickers;

      // ?????? ?????? ??????
      const markets_all = (await this.marketList()).markets;

      let total_buying_amount = 0;
      let total_buy_price = 0;

      // ????????? ?????? ???????????? ??????
      tickers.forEach(async (ticker) => {
        const order: Orders = new Orders();
        const account: Account = accounts.find((acc) => acc.unit_currency + '-' + acc.currency === ticker.market);
        const market_info = markets_all.find((market) => market.market === ticker.market);

        // ????????????
        order.market = ticker.market;
        // ?????? ?????????
        order.korean_name = market_info.korean_name;
        // ?????? ?????????
        order.english_name = market_info.english_name;

        // ?????????
        order.trade_price = +ticker.trade_price;
        // ?????????
        order.avg_buy_price = +account.avg_buy_price;
        // ????????????
        order.balance = +account.balance;
        // ????????????
        order.amount = +account.balance * +ticker.trade_price;
        // ??? ????????????
        total_buying_amount += order.amount;
        // ????????? ?????? (???????????????)
        const buy_price = +account.balance * +account.avg_buy_price;
        // ????????? ??? ??????
        total_buy_price += buy_price;
        // ????????????
        order.valuation_pnl = +account.balance * ticker.trade_price - buy_price;
        // ?????????
        order.yield = ((order.amount - buy_price) / buy_price) * 100;

        // ???????????????
        order.trade_price = Math.round(order.trade_price);
        order.avg_buy_price = Math.round(order.avg_buy_price);
        //order.balance = this.SetRounds(order.balance);
        order.amount = Math.round(order.amount);
        order.valuation_pnl = Math.round(order.valuation_pnl);
        order.yield = this.SetRounds(order.yield);

        orders.push(order);
      });
      // ??? ?????? ??????
      const total_assets: number = Math.round(total_buying_amount + krw);

      // ???????????????
      krw = Math.round(krw);
      total_buying_amount = Math.round(total_buying_amount);
      total_buy_price = Math.round(total_buy_price);

      // ??? ?????????
      const total_yield = this.SetRounds((total_buying_amount / total_buy_price - 1) * 100);

      // ??? ????????????
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

  // ????????? ????????? ??????????????????
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
