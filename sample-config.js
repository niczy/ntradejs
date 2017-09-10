var config = {};

config.debug = true; // for additional logging / debugging

config.asset = 'ETH';
config.currency = 'USD';
config.minimalMargin = 0.01;

config.gdax = {
  key : '',
  secret : '',
  passphrase : '',
};

config.okcoin = {
  key : '',
  secret : '',
};

config.depthSize = 10;

module.exports = config;
