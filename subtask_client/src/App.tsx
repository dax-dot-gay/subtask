import { MantineProvider } from "@mantine/core";
import { LocalizationProvider } from "./util/localize/localize";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { defaultDark } from "./util/themes/default.dark";

function App() {
    return (
        <LocalizationProvider>
            <MantineProvider defaultColorScheme="dark" theme={defaultDark}>
                <RouterProvider router={router} />
            </MantineProvider>
        </LocalizationProvider>
    );
}

export default App;
