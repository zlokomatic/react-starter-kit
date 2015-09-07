import  * as diskAdapter from 'sails-disk';
import  * as redisAdapter from 'sails-redis';

export const ServerConfig = {};

export const DatabaseConfig = {
  adapters: {
    'default': redisAdapter,
    disk: diskAdapter,
    redis: redisAdapter
  },
  connections: {
    myLocalDisk: {
      adapter: 'disk'
    },
    myLocalRedis: {
      adapter: 'redis'
    }
  },
  defaults: {
    migrate: 'alter'
  }
};

export const AuthConfig = {
  providers: {
    local: {
      strategy: require('passport-local').Strategy
    }
  }
};

export const Config = {
  server: ServerConfig,
  db: DatabaseConfig,
  auth: AuthConfig
};

export default Config;
