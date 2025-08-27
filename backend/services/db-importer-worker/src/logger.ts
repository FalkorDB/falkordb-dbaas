import { pino } from 'pino';

const isPretty = process.env.LOG_PRETTY === 'true' || process.env.NODE_ENV !== 'production';  

export default pino({  
  level: process.env.LOG_LEVEL || 'info',  
  transport: isPretty  
    ? {  
        target: 'pino-pretty',  
        options: {  
          colorize: true,  
          translateTime: 'SYS:standard',  
          ignore: 'pid,hostname',  
        },  
      }  
    : undefined,  
}).child({  
  service: process.env.SERVICE_NAME || 'db-importer-worker',  
});  