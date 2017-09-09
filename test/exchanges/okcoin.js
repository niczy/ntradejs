var chai = require('chai');
var expect = chai.expect;

var proxyquire = require('proxyquire');
var util = require(__dirname + '/../../core/util');
var dirs = util.dirs();
var config = util.getConfig();

var PORTFOLIO = require('./data/okcoin_portfolio.json');
var TICKER = require('./data/okcoiin_ticker.json');
var OkCoin = function() {};
OkCoin.prototype = {
  getUserInfo : function(callback) { callback(null, PORTFOLIO); },
  getTicker: function(callback) { callback(null, TICKER); }
};

var stubs = {'okcoin-china' : OkCoin};

describe('exchange/okcoin', function() {
  const OkCoin = proxyquire(dirs.exchanges + 'okcoin', stubs);
  const okcoin = new OkCoin(config);
  it('Should correctly pars portfolio data', function(done) {
    var check = function(err, portfolio) {
      expect(err).to.equal(null);
      const expectedPortfolio = [
        {"name" : "BTC", "amount" : 0}, {"name" : "BCC", "amount" : 0},
        {"name" : "ETC", "amount" : 0}, {"name" : "ETH", "amount" : 0},
        {"name" : "LTC", "amount" : 0}, {"name" : "CNY", "amount" : 0}
      ];
      expect(portfolio).to.deep.equal(expectedPortfolio);
      done();
    };
    okcoin.getPortfolio(check);
  });

  it('Should correct parse ticker data', function(done) {
    var check = function(err, ticker) {
      expect(err).to.equal(null);
      const expectedTicker = {"buy":"24017.99","high":"29007.99","last":"24017.99","low":"22888.55","sell":"24020.0","vol":"40108.0735003","bid":24020,"ask":24017.99};
      expect(ticker).to.deep.equal(expectedTicker);
      done();
    };
    okcoin.getTicker(check);
  });
});
