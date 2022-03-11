import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { fetch } from 'undici';
import { ConfigService } from '@nestjs/config';

interface Currency {
  ask: string;
  bid: string;
  currency: string;
  pair: string;
}

// TODO - THESE VALUES SHOULD BE READ FROM .ENV
const FETCH_INTERVAL = 5000;
const PRICE_OSCILATION_PERCENTAGE = 0.01;

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);
  private currencies: Map<string, Currency> = new Map();

  constructor(configService: ConfigService) {}

  getHello(): string {
    return 'Hello World!';
  }

  getPercentageDifference(a: number, b: number): number {
    return 100 * Math.abs((a - b) / ((a + b) / 2));
  }

  @Interval(FETCH_INTERVAL)
  async handleInterval() {
    let data: Currency[];
    try {
      const res = await fetch('https://api.uphold.com/v0/ticker/USD');
      data = (await res.json()) as Currency[];
    } catch (ex) {
      // try again in 5 second
      return;
    }
    const date = new Date();

    const alerts: string[] = [];

    for (const obj of data) {
      if (obj?.pair && !this.currencies.has(obj?.pair)) {
        this.currencies.set(obj.pair, obj);
        continue;
      }

      const askingOld = Number(this.currencies.get(obj.pair).ask);
      const askingNew = Number(obj.ask);
      const biddingOld = Number(this.currencies.get(obj.pair).bid);
      const biddingNew = Number(obj.bid);
      const askDiff = this.getPercentageDifference(askingOld, askingNew);
      const bidDiff = this.getPercentageDifference(biddingOld, biddingNew);

      if (askDiff >= PRICE_OSCILATION_PERCENTAGE) {
        alerts.push(
          `${date.toLocaleTimeString('en-US')} - ${
            obj.pair
          } has changed asking value for ${askDiff.toFixed(
            3,
          )} percent(s) - from ${askingOld.toFixed(5)} to ${askingNew.toFixed(
            5,
          )}`,
        );
      }

      if (bidDiff >= PRICE_OSCILATION_PERCENTAGE) {
        alerts.push(
          `${date.toLocaleTimeString('en-US')} - ${
            obj.pair
          } has changed bidding value for ${bidDiff.toFixed(
            3,
          )} percent(s) - from ${biddingOld.toFixed(5)} to ${biddingNew.toFixed(
            5,
          )}`,
        );
      }

      // overwrite old value with new
      this.currencies.set(obj.pair, obj);
    }

    await this.alert(alerts);
  }

  async alert(alerts: string[]) {
    for (const alert of alerts) {
      // TODO - write this to dockerized DB
      this.logger.log(alert);
    }
  }
}
