import { config } from 'dotenv';
import { str, port, cleanEnv, host } from 'envalid';

const AppNotInProduction = process.env.NODE_ENV !== 'production';

if (AppNotInProduction) config();

export default cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'staging', 'production'] }),
  serverHost: host(),
  serverPort: port({ default: 5000 }),
  databaseConnectionUri: str(),
  appEmail: str(),
  emailHost: host(),
  jwtSecretKey: str(),
  oAuthClientId: str(),
  oAuthClientSecret: str(),
  oAuth2RefreshToken: str(),
  redisHost: host(),
  redisPort: port(),
  redisUserName: str(),
  redisPassWord: str(),
});
