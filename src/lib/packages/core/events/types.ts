export type SmartHandlerOptions<E extends Event> = {
	debounceDelay?: number;
	cooldownDelay?: number;
	context?: string;
	shouldPreventDefault?: boolean;
	shouldExecuteFunction?: (event: E) => boolean;
};
