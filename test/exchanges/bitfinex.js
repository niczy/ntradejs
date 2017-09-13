var chai = require('chai');
var expect = chai.expect;

var proxyquire = require('proxyquire');
var util = require(__dirname + '/../../core/util');
var dirs = util.dirs();
var config = util.getConfig();
var DEPTH = require('./data/bitfinex_depth.json');
var FakeExchange = function() {
  this.rest = {
    orderbook : function(pair, options, callback) {
      callback(null, DEPTH, null);
    }
  }
};

var stubs = {'bitfinex-api-node' : FakeExchange};

const Bitfinex = proxyquire(dirs.exchanges + 'bitfinex', stubs);

describe('exchanges/bitfinex', function() {
  const bitfinex = new Bitfinex(config);

  it('Should correctly parse depth data', function(done) {
    var check = function(err, depth) {
      expect(err).to.equal(null);
      const expectedDepth = {
        "asks" : [ [ 307.81, 285.33956133 ], [ 309.28, 0.8 ] ],
        "bids" : [ [ 307.8, 0.01 ], [ 307.75, 0.9 ] ]
      };
      expect(depth).to.deep.equal(expectedDepth);
      done();
    };
    bitfinex.getDepth(check);
  });

});
