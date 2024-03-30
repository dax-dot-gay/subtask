import { createTheme } from "@mantine/core";
import { colorPrimary } from "./common";

export const defaultDark = createTheme({
    colors: {
        primary: colorPrimary
    },
    primaryColor: "primary",
    primaryShade: 7
})