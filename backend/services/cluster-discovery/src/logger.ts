import { pino } from 'pino';

// Initialize the logger
export default pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
}).child({ service: process.env.SERVICE_NAME || 'cluster-discovery' });