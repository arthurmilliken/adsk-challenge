const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp, stack }) => {
  if (typeof message == 'object') {
    message = JSON.stringify(message);
  }
  let msg = `${timestamp} [${label}] ${level.toUpperCase()}: ${message}`
  if (stack) {
    msg += `\n${stack}`
  }
  return msg;
});

const logger = module.exports = createLogger({
  format: combine(
    label({ label: process.env.APP_NAME }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    myFormat,
  ),
  transports: [
    new transports.Console({
      format: combine(format.colorize()),
      level: 'debug'
    }),
    new transports.File({ filename: 'logs/combined.log' }),
  ]
});
