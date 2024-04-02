import { useCallback } from "react";
import { useApi, useApiRequest } from "..";
import { UserConnectionType } from "../types/connection";

export function useApiNamespace_connections() {
    const api = useApi();
    const request = useApiRequest();

    const getOAuthRedirect = useCallback(
        async (type: string) => {
            const result = await request<string>(
                `/connections/${type}/authentication/redirect`
            );
            if (result.success) {
                return result.data;
            } else {
                return null;
            }
        },
        [request]
    );

    const authenticateOAuth = useCallback(
        async (type: string, options: { [key: string]: any }) => {
            const result = await request<UserConnectionType>(
                `/connections/${type}/authentication/`,
                {
                    method: "POST",
                    body: options,
                }
            );
            if (result.success) {
                return result.data;
            } else {
                return null;
            }
        },
        [request]
    );

    const getAllConnections = useCallback(async () => {
        const result = await request<UserConnectionType[]>("/connections");
        if (result.success) {
            return result.data;
        } else {
            return null;
        }
    }, [request]);

    const opGetConnection = useCallback(
        async (connectionId: string) => {
            const result = await request<UserConnectionType>(
                `/connections/${connectionId}`
            );
            if (result.success) {
                return result.data;
            } else {
                return null;
            }
        },
        [request]
    );

    const opDeleteConnection = useCallback(
        async (connectionId: string) => {
            const result = await request<null>(`/connections/${connectionId}`, {
                method: "DELETE",
            });
            if (result.success) {
                return true;
            } else {
                return false;
            }
        },
        [request]
    );

    if (api.status === "ready" && api.user) {
        return {
            oauth: {
                getRedirect: getOAuthRedirect,
                authenticate: authenticateOAuth,
                getConnections: getAllConnections,
            },
            operation: {
                getConnection: opGetConnection,
                deleteConnection: opDeleteConnection,
            },
        };
    } else {
        return {
            oauth: {
                getRedirect: async () => null,
                authenticate: async () => null,
                getConnections: async () => [],
            },
            operation: {
                getConnection: async () => null,
                deleteConnection: async () => false,
            },
        };
    }
}
