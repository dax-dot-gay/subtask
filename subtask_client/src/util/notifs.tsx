import { notifications } from "@mantine/notifications";
import {
    IconCircleCheckFilled,
    IconCircleXFilled,
    IconInfoCircleFilled,
    IconInfoTriangleFilled,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export function useNotif() {
    const { t } = useTranslation();
    return {
        error: (message: string, title?: string) => {
            notifications.show({
                title: title ?? t("common.notifications.error"),
                message: message,
                icon: <IconCircleXFilled />,
                color: "red",
            });
        },
        warning: (message: string, title?: string) => {
            notifications.show({
                title: title ?? t("common.notifications.warning"),
                message: message,
                icon: <IconInfoTriangleFilled />,
                color: "yellow",
            });
        },
        info: (message: string, title?: string) => {
            notifications.show({
                title: title ?? t("common.notifications.info"),
                message: message,
                icon: <IconInfoCircleFilled />,
                color: "primary",
            });
        },
        success: (message: string, title?: string) => {
            notifications.show({
                title: title ?? t("common.notifications.success"),
                message: message,
                icon: <IconCircleCheckFilled />,
                color: "green",
            });
        },
    };
}
