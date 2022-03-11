import { Module } from '@nestjs/common';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        FETCH_INTERVAL: Joi.string().required(),
        PRICE_OSCILATION_PERCENTAGE: Joi.string().required(),
      }),
      validationOptions: {
        allowUnknown: true, // must be true or NVM internal env variables break code
        abortEarly: false, // set to false to see all missing variables at once
      },
      envFilePath: ['.env'], // https://docs.nestjs.com/techniques/configuration#custom-env-file-path
      isGlobal: true, // https://docs.nestjs.com/techniques/configuration#use-module-globally
      cache: true, // https://docs.nestjs.com/techniques/configuration#cache-environment-variables
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [BotController],
  providers: [BotService],
})
export class BotModule {}
