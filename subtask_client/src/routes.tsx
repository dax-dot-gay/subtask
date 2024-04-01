import { createBrowserRouter } from "react-router-dom";
import { SiteLayout } from "./views/layout/Layout";
import { AuthenticationView } from "./views/authentication/Auth";
import { RedirectionView } from "./views/redirection";

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
        ],
    },
]);
