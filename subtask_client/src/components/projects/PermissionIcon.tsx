import {
    IconProps,
    IconUser,
    IconUserCog,
    IconUserEdit,
    IconUserShield,
    IconUserStar,
} from "@tabler/icons-react";
import { ProjectPermission } from "../../util/api/types/project";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { Tooltip, TooltipProps } from "@mantine/core";

export function PermissionIcon({
    permission,
    withTooltip,
    tooltipProps,
    ...props
}: {
    permission: ProjectPermission;
    withTooltip?: boolean;
    tooltipProps?: Partial<Omit<TooltipProps, "label">>;
} & Partial<IconProps>) {
    const { t } = useTranslation();
    const perms = ["owner", "admin", "manage", "edit", "view"].map((v) =>
        t(`common.permissions.${v}`)
    );

    const IconElement = useMemo(() => {
        switch (permission) {
            case ProjectPermission.Owner:
                return IconUserStar;
            case ProjectPermission.Admin:
                return IconUserShield;
            case ProjectPermission.Manage:
                return IconUserCog;
            case ProjectPermission.Edit:
                return IconUserEdit;
            case ProjectPermission.View:
                return IconUser;
        }
    }, [permission]);

    if (withTooltip) {
        return (
            <Tooltip label={perms[permission]} {...tooltipProps}>
                <IconElement {...(props as any)} />
            </Tooltip>
        );
    } else {
        return <IconElement {...(props as any)} />;
    }
}
