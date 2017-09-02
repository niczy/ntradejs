var chai = require('chai');
var expect = chai.expect;

var proxyquire = require('proxyquire');
var util = require(__dirname + '/../../core/util');
var dirs = util.dirs();
var config = util.getConfig();

var TRADES = require('./data/gdax_trades.json');
var FakePublicClient = function() {};
FakePublicClient.prototype = {
 getProductTrades: function(option, callback){
    callback(null, null, TRADES);
  }
};

var FakeAuthenticatedClient = function() {};
FakeAuthenticatedClient.prototype = {
};

var FakeExchange = {
  PublicClient: FakePublicClient,
  AuthenticatedClient: FakeAuthenticatedClient,
  '@noCallThru': true
};

var stubs = {
  'gdax': FakeExchange
};

describe('exchange/gdax', function() {
  const Gdax = proxyquire(dirs.exchanges + 'gdax', stubs);
  const gdax = new Gdax(config);

  it('should correctly parse historical trades', function(done) {
    var check = function(err, trades) {
      expect(err).to.equal(null);
      expect(trades.length).to.equal(3);
      done();
    };
    gdax.getTrades(null, check, false);
  });
});
