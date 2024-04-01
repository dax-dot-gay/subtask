import { useCallback } from "react";
import { useApi, useApiReload, useApiRequest } from "..";
import { UserType } from "../types/user";

export function useApiNamespace_userAuth() {
    const api = useApi();
    const request = useApiRequest();
    const reload = useApiReload();

    const userCreate = useCallback(
        async (username: string, displayName: string, password: string) => {
            const result = await request<UserType>("/user/auth/create", {
                method: "POST",
                body: { username, displayName, password },
            });
            if (result.success) {
                await reload();
                return result.data;
            } else {
                return null;
            }
        },
        [api.status, request, reload]
    );

    const userLogin = useCallback(
        async (username: string, password: string) => {
            const result = await request<UserType>("/user/auth/login", {
                method: "POST",
                body: { username, password },
            });
            if (result.success) {
                await reload();
                return result.data;
            } else {
                return null;
            }
        },
        [api.status, request, reload]
    );

    const userLogout = useCallback(async () => {
        const result = await request<null>("/user/auth/logout", {
            method: "POST",
        });
        if (result.success) {
            await reload();
            return true;
        } else {
            return false;
        }
    }, [api.status, request, reload]);

    if (api.status === "ready") {
        return {
            create: userCreate,
            login: userLogin,
            logout: userLogout,
        };
    } else {
        return {
            create: async () => null,
            login: async () => null,
            logout: async () => null,
        };
    }
}
