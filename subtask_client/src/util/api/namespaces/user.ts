import { useCallback } from "react";
import { useApi, useApiRequest } from "..";
import { UserType } from "../types/user";
import {
    RequestFunction,
    RequestOptionsType,
    ApiResponse,
    isBodyMethod,
} from "../common";

export function useApiNamespace_user() {
    const api = useApi();
    const request = useApiRequest();
    const requestFile: RequestFunction = useCallback(
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
                        ? options.body
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

    const getSelf = useCallback(async () => {
        const result = await request<UserType>("/user/self");
        if (result.success) {
            return result.data;
        } else {
            return null;
        }
    }, [request]);

    const updateUsername = useCallback(
        async (username: string) => {
            const result = await request<UserType>(
                "/user/self/settings/username",
                { method: "POST", query: { username } }
            );
            if (result.success) {
                return result.data;
            } else {
                return null;
            }
        },
        [request]
    );

    const updateDisplayName = useCallback(
        async (display_name: string) => {
            const result = await request<UserType>(
                "/user/self/settings/display_name",
                { method: "POST", query: { display_name } }
            );
            if (result.success) {
                return result.data;
            } else {
                return null;
            }
        },
        [request]
    );

    const updateAvatar = useCallback(
        async (file: File) => {
            const form = new FormData();
            form.append("file", file);
            const result = await requestFile<UserType>(
                "/user/self/settings/avatar",
                { method: "POST", body: form }
            );
            if (result.success) {
                return result.data;
            } else {
                return null;
            }
        },
        [request]
    );

    const clearAvatar = useCallback(async () => {
        const result = await request<null>("/user/self/settings/avatar", {
            method: "DELETE",
        });
        if (result.success) {
            return true;
        } else {
            return false;
        }
    }, [request]);

    if (api.status === "ready") {
        return {
            self: {
                get: getSelf,
                updateUsername,
                updateDisplayName,
                updateAvatar,
                clearAvatar,
            },
        };
    } else {
        return {
            self: {
                get: async () => null,
                updateUsername: async () => null,
                updateDisplayName: async () => null,
                updateAvatar: async () => null,
                clearAvatar: async () => false,
            },
        };
    }
}
