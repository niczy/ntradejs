var chai = require('chai');
var expect = chai.expect;

var util = require(__dirname + '/../../core/util');
var dirs = util.dirs();
var Exchange = require(dirs.exchanges + 'exchange');

const fakeDepth = {
  "asks" : [ [ 307.81, 285.33956133 ], [ 309.28, 0.8 ] ],
  "bids" : [ [ 307.8, 0.01 ], [ 307.75, 0.9 ] ]
};

const fakePortfolio = [
  {name : 'USD', amount : 10000}, {name : 'LTC', amount : 0},
  {name : 'ETH', amount : 0.018}, {name : 'BTC', amount : 0.0140153}
];

const trader = {
  getDepth : function(callback) { callback(null, fakeDepth); },
  getPortfolio : function(callback) { callback(null, fakePortfolio); }
};

describe('exchanges/exchange', function() {
  const exchange = new Exchange('test', trader, "ETH", 'USD');
  it('Should get buy price correctly', function(done) {
    exchange.getBuyPrice().then((buyPrice) => {
      expect(buyPrice).to.equal(307.81);
      exchange.getBuyPrice().then((buyPrice) => {
        expect(buyPrice).to.equal(307.81);
        done();
      })
    });
  });
  it('Should get sell price correctly', function(done) {
    exchange.getSellPrice().then((sellPrice) => {
      expect(sellPrice).to.equal(307.8);
      exchange.getSellPrice().then((sellPrice) => {
        expect(sellPrice).to.equal(307.8);
        done();
      })
    });
  });
  it('Should get Balance correctly', function(done) {
    exchange.getBalance().then((balance) => {
      expect(balance).to.equal(10000);
      done();
    });
  });
  it('Should get ETH balance correctly', function(done) {
    exchange.getETHBalance().then((balance) => {
      expect(balance).to.equal(0.018);
      done();
    });
  });
});
