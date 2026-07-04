export interface EnhancedEmojisDebugContext {
    adminDeveloperModeEnabled: boolean;
}

interface EnhancedEmojisDebugErrorDetails {
    message: string;
    responseBody?: unknown;
    status?: number;
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

export function isEnhancedEmojisDebugEnabled(context: EnhancedEmojisDebugContext): boolean {
    // Debug logging is enabled exclusively by the admin "Enable Developer Mode" setting.
    return context.adminDeveloperModeEnabled;
}

export function debugLog(eventName: string, data: unknown, context: EnhancedEmojisDebugContext): void {
    if (!isEnhancedEmojisDebugEnabled(context)) {
        return;
    }

    // eslint-disable-next-line no-console
    console.log(`[Enhanced Emojis Debug] ${eventName}`, data);
}

export function getEnhancedEmojisDebugErrorDetails(error: unknown): EnhancedEmojisDebugErrorDetails {
    if (error instanceof Error) {
        const details: EnhancedEmojisDebugErrorDetails = {
            message: error.message,
        };

        if (isObject(error)) {
            const status = error.status_code;
            const responseBody = error.data;

            if (typeof status === 'number') {
                details.status = status;
            }

            if (responseBody !== undefined) {
                details.responseBody = responseBody;
            }
        }

        return details;
    }

    if (typeof error === 'string') {
        return {message: error};
    }

    if (isObject(error)) {
        return {
            message: typeof error.message === 'string' ? error.message : 'Unknown error',
            responseBody: error.data,
            status: typeof error.status_code === 'number' ? error.status_code : undefined,
        };
    }

    return {message: 'Unknown error'};
}

export function debugError(eventName: string, error: unknown, data: unknown, context: EnhancedEmojisDebugContext): void {
    if (!isEnhancedEmojisDebugEnabled(context)) {
        return;
    }

    // eslint-disable-next-line no-console
    console.error(`[Enhanced Emojis Debug] ${eventName}`, {
        ...getEnhancedEmojisDebugErrorDetails(error),
        ...((isObject(data) ? data : {data}) as Record<string, unknown>),
    });
}

export function debugWarn(eventName: string, data: unknown, context: EnhancedEmojisDebugContext): void {
    if (!isEnhancedEmojisDebugEnabled(context)) {
        return;
    }

    // eslint-disable-next-line no-console
    console.warn(`[Enhanced Emojis Debug] ${eventName}`, data);
}
