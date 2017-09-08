var chai = require('chai');
var expect = chai.expect;

var proxyquire = require('proxyquire');
var util = require(__dirname + '/../../core/util');
var dirs = util.dirs();
var config = util.getConfig();

var TRADES = require('./data/gdax_trades.json');
var PORTFOLIO = require('./data/gdax_portfolio.json');
var FakePublicClient = function() {};
FakePublicClient.prototype = {
  getProductTrades : function(option, callback) {
    callback(null, null, TRADES);
  },
};

var FakeAuthenticatedClient = function() {};
FakeAuthenticatedClient.prototype = {
  getAccounts : function(callback) { callback(null, null, PORTFOLIO); },
};

var FakeExchange = {
  PublicClient : FakePublicClient,
  AuthenticatedClient : FakeAuthenticatedClient,
  '@noCallThru' : true
};

var stubs = {'gdax' : FakeExchange};

describe('exchange/gdax', function() {
  const Gdax = proxyquire(dirs.exchanges + 'gdax', stubs);
  // const Gdax = require(dirs.exchanges + 'gdax');
  const gdax = new Gdax(config);

  it('should correctly parse historical trades', function(done) {
    var check = function(err, trades) {
      expect(err).to.equal(null);
      expect(trades.length).to.equal(3);
      done();
    };
    gdax.getTrades(null, check, false);
  });

  it('should correctly parse portfolio data', function(done) {
    var check = function(err, portfolio) {
      expect(err).to.equal(null);
      const expectedPortfolio = [
        {name : 'USD', amount : 0}, {name : 'LTC', amount : 0},
        {name : 'ETH', amount : 0.018}, {name : 'BTC', amount : 0.0140153}
      ];
      expect(portfolio).to.deep.equal(expectedPortfolio);
      done();
    };
    gdax.getPortfolio(check);
  });
});
