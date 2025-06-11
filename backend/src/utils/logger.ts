import winston from 'winston'
import path from 'path'

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs')

// Define log levels and colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

winston.addColors(logColors)

// Create custom format
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
)

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    return `${timestamp} [${level}]: ${message} ${metaStr}`
  })
)

// Define which transports to use based on environment
const transports = []

// Console transport for development
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      level: 'debug',
      format: consoleFormat
    })
  )
}

// File transports for all environments
transports.push(
  // Error log file
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: customFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),

  // Combined log file
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: customFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),

  // Application specific logs
  new winston.transports.File({
    filename: path.join(logsDir, 'app.log'),
    level: 'info',
    format: customFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 10,
  })
)

// Create logger instance with extended interface
interface ExtendedLogger extends winston.Logger {
  logRequest: (req: any, res: any, responseTime: number) => void
  logPerformance: (operation: string, duration: number, metadata?: any) => void
  logBlockchainEvent: (event: string, data: any) => void
  logMetrics: (metrics: any) => void
  logError: (error: Error, context?: any) => void
}

const baseLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  format: customFormat,
  transports,
  exitOnError: false,
}) as ExtendedLogger

// Add request logging method
baseLogger.logRequest = (req: any, res: any, responseTime: number) => {
  const logData = {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  }

  if (res.statusCode >= 400) {
    baseLogger.error('HTTP Request Error', logData)
  } else {
    baseLogger.http('HTTP Request', logData)
  }
}

// Add performance logging
baseLogger.logPerformance = (operation: string, duration: number, metadata?: any) => {
  baseLogger.info('Performance Metric', {
    operation,
    duration: `${duration}ms`,
    ...metadata,
    timestamp: new Date().toISOString()
  })
}

// Add blockchain event logging
baseLogger.logBlockchainEvent = (event: string, data: any) => {
  baseLogger.info('Blockchain Event', {
    event,
    data,
    timestamp: new Date().toISOString()
  })
}

// Add metrics logging
baseLogger.logMetrics = (metrics: any) => {
  baseLogger.info('Metrics Collection', {
    metrics,
    timestamp: new Date().toISOString()
  })
}

// Add error tracking
baseLogger.logError = (error: Error, context?: any) => {
  baseLogger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  })
}

// Handle uncaught exceptions
baseLogger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(logsDir, 'exceptions.log'),
    format: customFormat
  })
)

// Handle unhandled promise rejections
baseLogger.rejections.handle(
  new winston.transports.File({
    filename: path.join(logsDir, 'rejections.log'),
    format: customFormat
  })
)

export default baseLogger 