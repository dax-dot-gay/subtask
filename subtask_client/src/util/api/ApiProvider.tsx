import { ReactNode, useCallback, useEffect, useState } from "react";
import { SessionType } from "./types/session";
import {
    ApiContext,
    ApiResponse,
    RequestFunction,
    RequestOptionsType,
    isBodyMethod,
} from "./common";

export function ApiProvider({
    children,
}: {
    children?: ReactNode | ReactNode[];
}) {
    const [session, setSession] = useState<SessionType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const request: RequestFunction = useCallback(
        async <TData = any, TError = any>(
            endpoint: string,
            options?: Partial<RequestOptionsType>
        ): Promise<ApiResponse<TData, TError>> => {
            const resolvedPath = `/api/${
                endpoint.startsWith("/") ? endpoint.slice(1) : endpoint
            }${
                options?.query
                    ? `?${new URLSearchParams(options.query as any).toString()}`
                    : ""
            }`;
            const resolvedMethod = options?.method ?? "GET";
            const response = await fetch(resolvedPath, {
                method: resolvedMethod,
                body:
                    isBodyMethod(options) && options.body
                        ? JSON.stringify(options.body)
                        : undefined,
            });

            const resultText = await response.text();
            if (response.ok) {
                try {
                    return {
                        success: true,
                        data: JSON.parse(resultText),
                    };
                } catch (e) {
                    return {
                        success: true,
                        data: resultText as any,
                    };
                }
            } else {
                try {
                    return {
                        success: false,
                        data: JSON.parse(resultText),
                        code: response.status,
                    };
                } catch (e) {
                    return {
                        success: false,
                        data: resultText as any,
                        code: response.status,
                    };
                }
            }
        },
        []
    );
    const reload = useCallback(async () => {
        const result = await request<SessionType, string>("/");
        if (result.success) {
            setSession(result.data);
            setError(null);
        } else {
            setSession(null);
            setError(result.data);
        }
    }, [request, setSession]);

    useEffect(() => {
        reload();
    }, []);

    return (
        <ApiContext.Provider
            value={
                error
                    ? { status: "error", reason: error }
                    : session
                    ? {
                          status: "ready",
                          session,
                          user: session.user,
                          request,
                          reload,
                      }
                    : { status: "initializing" }
            }
        >
            {children}
        </ApiContext.Provider>
    );
}
