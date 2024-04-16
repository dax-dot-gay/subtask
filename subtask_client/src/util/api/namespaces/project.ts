import { useCallback } from "react";
import { useApi, useApiRequest } from "..";
import { Project, ProjectConnection } from "../types/project";

export function useApiNamespace_projects() {
    const api = useApi();
    const request = useApiRequest();

    const createProject = useCallback(
        async (data: {
            name: string;
            summary?: string;
            image?: string;
            connection?: ProjectConnection;
        }) => {
            const result = await request<Project>("/projects", {
                method: "POST",
                body: data,
            });
            if (result.success) {
                return result.data;
            } else {
                return null;
            }
        },
        [request]
    );

    const listProjects = useCallback(async () => {
        const result = await request<Project[]>("/projects");
        if (result.success) {
            return result.data;
        } else {
            return [];
        }
    }, [request]);

    if (api.status === "ready" && api.user) {
        return {
            meta: {
                create: createProject,
                list: listProjects,
            },
        };
    } else {
        return {
            meta: {
                create: async () => null,
                list: async () => [],
            },
        };
    }
}
