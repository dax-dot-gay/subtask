import { createBrowserRouter } from "react-router-dom";
import { SiteLayout } from "./views/layout/Layout";
import { AuthenticationView } from "./views/authentication/Auth";
import { RedirectionView } from "./views/redirection";
import { ProjectView } from "./views/project/ProjectView";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <SiteLayout />,
        children: [
            {
                path: "/login",
                element: <AuthenticationView />,
            },
            {
                path: "/",
                element: <></>,
            },
            {
                path: "/oauth/redirect/:connectionType",
                element: <RedirectionView />,
            },
            {
                path: "/project/:projectId",
                element: <ProjectView />,
            },
        ],
    },
]);
