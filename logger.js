const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

// log format: timestamp [label] LEVEL: message
//               at [stack frame] (if applicable)
const logFormat = printf(({ level, message, label, timestamp, stack }) => {
  if (typeof message == 'object') {
    message = JSON.stringify(message);
  }
  let msg = `${timestamp} [${label}] ${level.toUpperCase()}: ${message}`
  if (stack) {
    msg += `\n${stack}`
  }
  return msg;
});

// logger object logs: DEBUG and higher to console, and
//                     INFO and higher to log file: /logs/combined.log
const logger = createLogger({
  format: combine(
    label({ label: process.env.APP_NAME }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    logFormat,
  ),
  transports: [
    new transports.Console({
      format: combine(format.colorize()),
      level: 'debug',
    }),
    new transports.File({
      filename: 'logs/combined.log',
      level: 'info',
    }),
  ]
});

module.exports = logger;
