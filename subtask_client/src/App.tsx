import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { LocalizationProvider } from "./util/localize/localize";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { defaultDark } from "./util/themes/default.dark";
import { ApiProvider } from "./util/api/ApiProvider";

function App() {
    return (
        <LocalizationProvider>
            <ApiProvider>
                <MantineProvider defaultColorScheme="dark" theme={defaultDark}>
                    <Notifications />
                    <RouterProvider router={router} />
                </MantineProvider>
            </ApiProvider>
        </LocalizationProvider>
    );
}

export default App;
