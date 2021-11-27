require('dotenv').config()

const env = process.env;

const config = {
  webSiteUser: env.WEB_SITE_USER,
  webSitePassword: env.WEB_SITE_PASSWORD,
  preferTime: env.BOOKING_PREFER_TIME,
};

module.exports = config;