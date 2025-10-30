/**
 * Logging utilities that wrap console methods with custom prefixes
 */
export class Logger {
    private logPrefix: string;

    /**
     * Creates a new Logger instance
     * @param {string} logPrefix - Prefix to add before all log messages (default: '[LOGGER]')
     */
    constructor(logPrefix: string = '[LOGGER]') {
        this.logPrefix = logPrefix;
    }

    /**
     * Wrapper for console.log that adds custom prefix
     * @param {...any} args - Arguments to pass to console.log
     */
    log(...args: any[]) {
        console.log(this.logPrefix, ...args);
    }

    /**
     * Wrapper for console.info that adds custom prefix
     * @param {...any} args - Arguments to pass to console.info
     */
    info(...args: any[]) {
        console.info(this.logPrefix, ...args);
    }

    /**
     * Wrapper for console.warn that adds custom prefix
     * @param {...any} args - Arguments to pass to console.warn
     */
    warn(...args: any[]) {
        console.warn(this.logPrefix, ...args);
    }

    /**
     * Wrapper for console.error that adds custom prefix
     * @param {...any} args - Arguments to pass to console.error
     */
    error(...args: any[]) {
        console.error(this.logPrefix, ...args);
    }

    /**
     * Wrapper for console.debug that adds custom prefix
     * @param {...any} args - Arguments to pass to console.debug
     */
    debug(...args: any[]) {
        console.debug(this.logPrefix, ...args);
    }
}
