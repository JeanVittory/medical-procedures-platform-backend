import * as dotenv from 'dotenv';

dotenv.config();

export const ENV_VARIABLES = {
  AWS_REGION: process.env.AWS_REGION,
};
