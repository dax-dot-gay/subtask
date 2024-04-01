import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useApiMethods, useApiReload, useApiStatus } from "../util/api";
import { useEffect } from "react";
import { useNotif } from "../util/notifs";
import { useTranslation } from "react-i18next";

export function RedirectionView() {
    const [search] = useSearchParams();
    const { connectionType } = useParams();
    const { connections } = useApiMethods();
    const apiStatus = useApiStatus();
    const searchMap: { [key: string]: string } = Object.fromEntries(
        search.entries()
    );
    const { success, error } = useNotif();
    const nav = useNavigate();
    const { t } = useTranslation();
    const reload = useApiReload();

    useEffect(() => {
        if (apiStatus === "ready") {
            connections.oauth
                .authenticate(connectionType ?? "noop", searchMap)
                .then((result) => {
                    if (result) {
                        success(
                            t(
                                "modals.userSettings.sections.connections.feedback.successAdd"
                            )
                        );
                        nav("/");
                        reload();
                    } else {
                        error(
                            t(
                                "modals.userSettings.sections.connections.feedback.errorAdd"
                            )
                        );
                        nav("/");
                    }
                });
        }
    }, [apiStatus, searchMap, connections.oauth.authenticate, connectionType]);

    return <></>;
}
