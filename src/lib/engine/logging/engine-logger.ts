import { DispatcherImpl, type Dispatcher, type DispatchHandler } from '../patterns/observer';

export type LogSeverity = 'debug' | 'info' | 'warn' | 'error';
export type LogContext = Record<string, unknown> & { scope: string };

export type LogEvent = { severity: LogSeverity; message: string; context: LogContext };

export class EngineLogger implements Dispatcher<LogEvent> {
	#dispatcher = new DispatcherImpl<LogEvent>();

	#logInternal(severity: LogSeverity, message: string, context: LogContext) {
		this.#dispatcher.signal({ severity, message, context });
	}

	log(message: string, context: LogContext) {
		this.#logInternal('info', message, context);
	}

	debug(message: string, context: LogContext) {
		this.#logInternal('debug', message, context);
	}

	warn(message: string, context: LogContext) {
		this.#logInternal('warn', message, context);
	}

	error(message: string, context: LogContext) {
		this.#logInternal('error', message, context);
	}

	register(handler: (logEvent: LogEvent) => void) {
		return this.#dispatcher.register(handler);
	}

	unregister(handler: DispatchHandler<LogEvent>): void {
		this.#dispatcher.unregister(handler);
	}
}
