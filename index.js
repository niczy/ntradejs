var util = require('./core/util');
var logger = require('./core/log');
var config = util.getConfig();
var dirs = util.dirs();
var fmt = require('util').format;
var _ = require('lodash');
var oxr = require('open-exchange-rates');
var fx = require('money');
var Exchange = require('./exchanges/exchange');

oxr.set({app_id : 'cae3c57412144246a1280a0086be3460'});

const Gdax = require('./exchanges/gdax');
const Bitfinex = require('./exchanges/bitfinex');

class Task {

  constructor() {
    this.exchanges = [
      new Exchange('gdax', new Gdax(config), 'ETH', 'USD'),
      // TODO: implement getDepth of bitfinex.
      new Exchange('bitfinx', new Bitfinex(config), 'ETH', 'USD')
    ];
  }

  async run() {
    for (var i = 0; i < this.exchanges.length; i++) {
      for (var j = 0; j < this.exchanges.length; j++) {
        if (i != j) {
          this.tryTrade(this.exchanges[i], this.exchanges[j]);
        }
      }
    }
  }

  tryTrade(buy, sell) {
    logger.info('check buying from ' + buy.name + ' and sell to ' + sell.name);
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
            logger.info('Stop trading due to insufficent ETH balance in ' +
                        sell.name);
          }
        } else {
          logger.info('Stop trading due to insufficient currency balance in ' +
                      buy.name);
        }
      } else {
        logger.info('Stop trading since margin is too low.');
      }
    } else {
      logger.info('Stop trading since buy price is higher than sell price.');
    }
  }
};

var loop =
    function() {
  new Task().run();
  console.log('\n\n\n\n-----------------\nStart new task\n-----------');
  setTimeout(loop, 10000);
}

loop();
