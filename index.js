var util = require('./core/util');
var logger = require('./core/log');
var config = util.getConfig();
var dirs = util.dirs();
var fmt = require('util').format;
var _ = require('lodash');
var oxr = require('open-exchange-rates');
var fx = require('money');

oxr.set({app_id : 'cae3c57412144246a1280a0086be3460'});

const Gdax = require(dirs.exchanges + 'gdax');
const OkCoin = require(dirs.exchanges + 'okcoin');

class Exchange {
  constructor(name, trader, depth, portfolio, currency) {
    this.name = name;
    this.trader = trader;
    this.depth = depth;
    this.portfolio = portfolio;
    this.currency = currency;
  }

  getBuyPrice() {
    return this.depth.asks[0][0];
  }

  getSellPrice() {
    return this.depth.bids[0][0];
  }

  getBalance() {
    return this._getBalance(this.currency);
  }

  getETHBalance() {
    return this._getBalance('ETH');
  }

  _getBalance(symbol) {
    return _.filter(this.portfolio, {'name': symbol})[0]['amount'];
  }
}

class Task {

  constructor(gdax, okcoin) {
    this.gdax = gdax;
    this.okcoin = okcoin;
  }

  async run() {
    const state = await this.getState();
    const exchange1 = new Exchange('gdax',
      gdax,
      state.gdaxDepth,
      state.gdaxPortfolio,
      'USD');
    const exchange2 = new Exchange('okcoin',
      okcoin,
      state.okcoinDepth,
      state.okcoinPortfolio,
      'CNY');
    this.tryTrade(exchange1, exchange2);
    this.tryTrade(exchange2, exchange1)
    return state;
  }

  tryTrade(buy, sell) {
    logger.info('check buying from ' + buy.name 
        + ' and sell to ' + sell.name);
    logger.info("Best buy price: " + buy.getBuyPrice());
    logger.info('Best sell price: ' + sell.getSellPrice());
    const priceDiff = sell.getSellPrice() - buy.getBuyPrice();
    if (priceDiff > 0) {
      const margin = priceDiff / buy.getBuyPrice();
      logger.info('Margin is: ' + (margin * 100).toFixed(2) + '%');
      if (margin > config.minimalMargin) {
        logger.info('Opportunity found!');
        logger.info('Balance in ' + buy.name + ' is $' + buy.getBalance());
        if (buy.getBalance() > 0) {
          logger.info('Check ETH balance in ' + sell.name);
          if (sell.getETHBalance() > 0) {
            logger.info('Start trading something ');
          } else {
            logger.info('Stop trading due to insufficent ETH balance in ' + sell.name);
          }
        } else {
          logger.info('Stop trading due to insufficient currency balance in ' + buy.name);
        }
      } else {
        logger.info('Stop trading since margin is too low.');
      }
    } else {
      logger.info('Stop trading since buy price is higher than sell price.');
    }
  }

  getState() {
    return new Promise((resolve, reject) => {
      var state = {};
      var checkState = function() {
        if (state.gdaxPortfolio && state.okcoinPortfolio && state.gdaxDepth &&
            state.okcoinDepth && state.usdToCny) {
          state.okcoinDepth.bids =
              _.map(state.okcoinDepth.bids,
                    item => [item[0] / state.usdToCny, item[1]]);
          state.okcoinDepth.asks =
              _.map(state.okcoinDepth.asks,
                    item => [item[0] / state.usdToCny, item[1]]);
          resolve(state);
        };
      };
      gdax.getPortfolio((err, data) => {
        if (err) {
          reject(err);
        }
        state.gdaxPortfolio = data;
        checkState();
      });
      gdax.getDepth((err, data) => {
        if (err) {
          reject(err);
        }
        state.gdaxDepth = data;
        checkState();
      });
      okcoin.getPortfolio((err, data) => {
        if (err) {
          reject(err);
        }
        state.okcoinPortfolio = data;
        checkState();
      });
      okcoin.getDepth((err, data) => {
        if (err) {
          reject(err);
        }
        state.okcoinDepth = data;
        checkState();
      });
      oxr.latest(function() {
        // Apply exchange rates and base rate to `fx` library object:
        fx.rates = oxr.rates;
        fx.base = oxr.base;

        // money.js is ready to use:
        const usdToCny = fx(1).from('USD').to('CNY'); // ~8.0424
        state.usdToCny = usdToCny;
      });

    });
  }
};
const gdax = new Gdax(config);
const okcoin = new OkCoin(config);

var loop = function() {
  new Task(gdax, okcoin).run();
  console.log('\n\n\n\n-----------------\nStart new task\n-----------');
  setTimeout(loop, 10000);
}

loop();
