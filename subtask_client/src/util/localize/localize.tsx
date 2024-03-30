import * as langEN from "../../lang/en.json";
import { createInstance } from "i18next";
import { ReactNode, useMemo } from "react";
import { I18nextProvider } from "react-i18next";

const resources = {
    en: {
        translation: langEN,
    },
};

export function LocalizationProvider({
    children,
}: {
    children?: ReactNode | ReactNode[];
}) {
    const instance = useMemo(() => {
        const instance = createInstance({
            resources,
            lng: "en",
        });
        instance.init();
        return instance;
    }, []);

    return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
