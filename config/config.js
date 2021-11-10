require('dotenv').config({ silent: true });

const joi = require('joi');

const envVarsSchema = joi.object({
  MAX_PLAYERS: joi.number().integer().positive().required(),
  MIN_PLAYERS: joi.number().integer().positive().required(),
  MAX_GAMES_PUBLIC: joi.number().integer().positive().required(),
  MAX_GAMES_PRIVATE: joi.number().integer().positive().required(),
  MATCH_DURATION: joi.number().integer().positive().required(),
  MATCHES_INTERVAL: joi.number().integer().positive().required(),
  HOSTNAME: joi.string().required(),
  PORT: joi.number().integer().positive().required(),
  MOVECARE_SECRET: joi.string().required(),
  COOKIE_SECRET: joi.string().required(),
  USE_HTTPS: joi.boolean().required(),
  MONGOURL: joi.string().required(),
  HTTPSKEYFILE: joi.string(),
  HTTPSCERTFILE: joi.string(),
  LAN: joi.string().allow('en', 'ita', 'es').required(),
  CBAC_HOSTNAME: joi.string().required(),
  CBAC_PORT: joi.string().required(),
  BASE_PATH: joi.string(),
  INSTANCE: joi.string(),
  IMAGE_FOLDER: joi.string(),
  JITSI_INSTANCE: joi.string(),
  TLS_REJECT_UNAUTHORIZED: joi.boolean(),
}).unknown().required();

const res = envVarsSchema.validate(process.env);

if (res.error) {throw new Error('Config validation error: ' + res.error.message);}

const config = {
  MAX_PLAYERS: res.value.MAX_PLAYERS,
  MIN_PLAYERS: res.value.MIN_PLAYERS,
  MAX_GAMES_PUBLIC: res.value.MAX_GAMES_PUBLIC,
  MAX_GAMES_PRIVATE: res.value.MAX_GAMES_PRIVATE,
  MATCH_DURATION: res.value.MATCH_DURATION,
  MATCHES_INTERVAL: res.value.MATCHES_INTERVAL,
  HOSTNAME: res.value.HOSTNAME,
  PORT: res.value.PORT,
  MOVECARE_SECRET: res.value.MOVECARE_SECRET,
  COOKIE_SECRET: res.value.COOKIE_SECRET,
  USE_HTTPS: res.value.USE_HTTPS,
  MONGOURL: res.value.MONGOURL,
  HTTPSKEYFILE: res.value.HTTPSKEYFILE,
  HTTPSCERTFILE: res.value.HTTPSCERTFILE,
  LAN: res.value.LAN,
  CBAC_HOSTNAME: res.value.CBAC_HOSTNAME,
  CBAC_PORT: res.value.CBAC_PORT,
  BASE_PATH: res.value.BASE_PATH || '',
  INSTANCE: res.value.INSTANCE || 'CBAC1',
  IMAGE_FOLDER: res.value.IMAGE_FOLDER || '',
  JITSI_INSTANCE: res.value.JITSI_INSTANCE,
  TLS_REJECT_UNAUTHORIZED: res.value.TLS_REJECT_UNAUTHORIZED,
};

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = (config.TLS_REJECT_UNAUTHORIZED) ? '1' : '0';

module.exports = config;