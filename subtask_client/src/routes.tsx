import { createBrowserRouter } from "react-router-dom";
import { SiteLayout } from "./views/layout/Layout";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <SiteLayout />,
        children: [
            {
                path: "/login",
                element: <></>,
            },
            {
                path: "/",
                element: <></>,
            },
        ],
    },
]);
