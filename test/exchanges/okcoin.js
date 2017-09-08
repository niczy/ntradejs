var chai = require('chai');
var expect = chai.expect;

var proxyquire = require('proxyquire');
var util = require(__dirname + '/../../core/util');
var dirs = util.dirs();
var config = util.getConfig();

var PORTFOLIO = require('./data/okcoin_portfolio.json');
var OkCoin = function() {};
OkCoin.prototype = {
  getUserInfo : function(callback) { callback(null, PORTFOLIO); }
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
});
