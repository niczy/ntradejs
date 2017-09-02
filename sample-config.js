var config = {};

config.debug = true; // for additional logging / debugging

config.watch = {
  exchange: 'poloniex',
  currency: 'USD',
  asset: 'BTC',

};

config.gdax = {
  key: '',
  secret: '',
  passphrase: '',
  asset: 'ETH',
  currency: 'USD'
};

module.exports = config;
