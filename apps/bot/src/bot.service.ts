import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { fetch } from 'undici';

interface Currency {
  ask: string;
  bid: string;
  currency: string;
  pair: string;
}

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);
  private btcToUsd: Currency = null;
  getHello(): string {
    return 'Hello World!';
  }

  getPercentageDifference(a: number, b: number): number {
    const percentage = 100 * Math.abs((a - b) / ((a + b) / 2));
    return percentage;
  }

  @Interval(5000)
  async handleInterval() {
    let data;
    try {
      const res = await fetch('https://api.uphold.com/v0/ticker/USD');
      data = await res.json();
    } catch (ex) {
      // try again in 5 second
      return;
    }

    const btcToUsd: Currency = data?.find((el) => el?.pair === 'BTCUSD');

    if (!btcToUsd) {
      // try again in 5 second
      return;
    }

    if (this.btcToUsd === null) {
      this.btcToUsd = btcToUsd;
      return;
    }

    const askDiff = this.getPercentageDifference(
      Number(btcToUsd.ask),
      Number(this.btcToUsd.ask),
    );

    const bidDiff = this.getPercentageDifference(
      Number(btcToUsd.bid),
      Number(this.btcToUsd.bid),
    );

    if (askDiff >= 0.01 || bidDiff >= 0.01) {
      await this.alert(btcToUsd, this.btcToUsd, askDiff, bidDiff);
    }

    this.btcToUsd = btcToUsd;
  }

  async alert(a: Currency, b: Currency, askDiff: number, bidDiff: number) {
    this.logger.log(a.ask, b.ask, a.bid, b.bid, askDiff, bidDiff);
  }
}
