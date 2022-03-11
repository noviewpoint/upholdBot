# Uphold Bot

bot that is able to alert you about price oscillations on a given currency pair using Uphold API

## What does it do?

It logs all the currency pairs every FETCH_INTERVAL milliseconds and logs changes between old and new prices if the difference was at least PRICE_OSCILATION_PERCENTAGE (see .env)

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
