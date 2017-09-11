var _ = require('lodash');

/**
 * A snapshot of the state of certain exchange. It also wraps the following
 * opertionas on that exchange.
 */
class Exchange {
  constructor(name, trader, asset, currency) {
    this.name = name;
    this.trader = trader;
    this.asset = asset;
    this.currency = currency;
  }

  getBuyPrice() { return this._cacheGetDepth(this._getBuyPrice.bind(this)); }

  _getBuyPrice() { return this.depth.asks[0][0]; }

  getSellPrice() { return this._cacheGetDepth(this._getSellPrice.bind(this)); }

  _getSellPrice() { return this.depth.bids[0][0]; }

  _cacheGetDepth(getValue) {
    if (this.depth) {
      return new Promise((resolve) => {resolve(getValue())});
    } else {
      return new Promise(
          (resolve, reject) => {this.trader.getDepth((err, data) => {
            if (err) {
              reject(err);
            } else {
              this.depth = data;
              resolve(getValue());
            }
          })});
    }
  }

  getBalance() {
    return this._cacheGetPortfolio(this._getBalance(this.currency).bind(this));
  }

  getETHBalance() {
    return this._cacheGetPortfolio(this._getBalance(this.asset).bind(this));
  }

  _getBalance(symbol) {
    return function() {
      return _.filter(this.portfolio, {'name' : symbol})[0]['amount'];
    }
  }

  _cacheGetPortfolio(getValue) {
    if (this.portfolio) {
      return new Promise((resolve) => { resolve(getValue()); });
    } else {
      return new Promise((resolve, reject) => {
        this.trader.getPortfolio((err, data) => {
          if (err) {
            reject(err);
          } else {
            this.portfolio = data;
            resolve(getValue());
          }
        });
      });
    }
  }
}

module.exports = Exchange;
