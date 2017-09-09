var chai = require('chai');
var expect = chai.expect;

var proxyquire = require('proxyquire');
var util = require(__dirname + '/../../core/util');
var dirs = util.dirs();
var config = util.getConfig();

var PORTFOLIO = require('./data/okcoin_portfolio.json');
var TICKER = require('./data/okcoiin_ticker.json');
var DEPTH = require('./data/okcoin_depth.json');
var OkCoin = function() {};
OkCoin.prototype = {
  getUserInfo : function(callback) { callback(null, PORTFOLIO); },
  getTicker: function(callback) { callback(null, TICKER); },
  getDepth: function(callback) { callback(null, DEPTH); },
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
  it('Should correctly parse depth data', function(done) {
    var check = function(err, depth) {
      expect(err).to.equal(null);
      const expectedDepth = {"asks":[[1718,18.526],[1717.8,11.223],[1715.9,3.519],[1715.8,0.01],[1715,4.853],[1713,0.03],[1712,0.3],[1711,0.01],[1710,2],[1709,3.607]],"bids":[[1702,4.059],[1701,1.03],[1700,25.748],[1696,141.33],[1692.3,2.471],[1692.1,0.06],[1692,4.118],[1690,39.376],[1689,1.002],[1688.1,0.033]]};
      expect(depth).to.deep.equal(expectedDepth);
      done();
    };
    okcoin.getDepth(check);
  });
});
