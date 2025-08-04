
type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data
    }
  }

  info(message: string, data?: any) {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, data || '')
    }
  }

  warn(message: string, data?: any) {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, data || '')
    }
  }

  error(message: string, error?: Error | any) {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error || '')
    }
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data || '')
    }
  }

  // API route logger
  apiRequest(method: string, path: string, userId?: string) {
    this.info(`${method} ${path}`, { userId })
  }

  apiResponse(method: string, path: string, status: number, duration: number) {
    this.info(`${method} ${path} - ${status}`, { duration: `${duration}ms` })
  }

  apiError(method: string, path: string, error: Error) {
    this.error(`${method} ${path} - ERROR`, error)
  }
}

export const logger = new Logger()
