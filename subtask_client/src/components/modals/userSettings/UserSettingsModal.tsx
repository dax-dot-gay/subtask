import { useTranslation } from "react-i18next";
import { useApiMethods, useUser } from "../../../util/api";
import {
    Avatar,
    Badge,
    Button,
    Group,
    Menu,
    Modal,
    Paper,
    Space,
    Stack,
    Tabs,
    Text,
} from "@mantine/core";
import {
    IconBrandGithub,
    IconBrandGitlab,
    IconChevronDown,
    IconPlug,
    IconPlugConnectedX,
    IconPlus,
    IconUser,
    IconUserCog,
} from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import "./userSettings.scss";
import { UserConnectionType } from "../../../util/api/types/user";

function ConnectionItem({ connection }: { connection: UserConnectionType }) {
    const { t } = useTranslation();
    const typeBadge = useMemo(() => {
        switch (connection.type) {
            case "github":
                return (
                    <Badge
                        size="md"
                        color="rgb(36, 41, 47)"
                        leftSection={<IconBrandGithub size={16} />}
                    >
                        {t("common.connections.github")}
                    </Badge>
                );
            case "gitlab":
                return (
                    <Badge
                        size="md"
                        color="rgb(	252, 109, 38)"
                        leftSection={<IconBrandGitlab size={16} />}
                    >
                        {t("common.connections.gitlab")}
                    </Badge>
                );
            default:
                return <></>;
        }
    }, [connection.type]);
    return (
        <Paper p="sm" radius="sm" className="connection-item" shadow="sm">
            <Group gap="sm" justify="space-between">
                <Group gap="sm">
                    {connection.account_image ? (
                        <Avatar src={connection.account_image} />
                    ) : (
                        <Avatar>
                            <IconUser />
                        </Avatar>
                    )}
                    <Stack gap={0}>
                        <Text>
                            {connection.account_name ??
                                t(
                                    "modals.userSettings.sections.connections.item.unknown"
                                )}
                        </Text>
                        {typeBadge}
                    </Stack>
                </Group>
            </Group>
        </Paper>
    );
}

function ConnectionSettingsPanel() {
    const user = useUser();
    const { t } = useTranslation();
    const { connections } = useApiMethods();

    const connect = useCallback(
        async (type: string) => {
            const result = await connections.oauth.getRedirect(type);
            if (result) {
                window.open(result, "_self");
            }
        },
        [connections.oauth.getRedirect, user?.id]
    );

    return user ? (
        <Stack gap="sm" className="modal-panel user-connections">
            <Paper
                withBorder
                className={
                    "connections-box" +
                    (user.connections.length === 0 ? " empty" : "")
                }
                radius="sm"
                p="sm"
            >
                {user.connections.length === 0 ? (
                    <Stack gap="md" align="center" className="no-connections">
                        <Group gap="sm">
                            <IconPlugConnectedX />
                            <Text>
                                {t(
                                    "modals.userSettings.sections.connections.noConnections"
                                )}
                            </Text>
                        </Group>
                        <Group gap="sm" wrap="nowrap">
                            <Button
                                leftSection={<IconBrandGithub size={20} />}
                                color="rgb(36, 41, 47)"
                                onClick={() => connect("github")}
                            >
                                {t("common.connections.github")}
                            </Button>
                            <Button
                                leftSection={<IconBrandGitlab size={20} />}
                                color="rgb(	252, 109, 38)"
                            >
                                {t("common.connections.gitlab")}
                            </Button>
                        </Group>
                    </Stack>
                ) : (
                    <Stack gap="sm">
                        {user.connections.map((v) => (
                            <ConnectionItem connection={v} key={v.id} />
                        ))}
                    </Stack>
                )}
            </Paper>
            {user.connections.length > 0 && (
                <Menu position="bottom-end" width={256} withArrow>
                    <Menu.Target>
                        <Button
                            fullWidth
                            leftSection={<IconPlus size={20} />}
                            justify="space-between"
                            variant="light"
                        >
                            {t(
                                "modals.userSettings.sections.connections.create"
                            )}
                            <Space w="sm" />
                            <IconChevronDown size={16} />
                        </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item
                            leftSection={<IconBrandGithub size={20} />}
                            style={{ textAlign: "right" }}
                            onClick={() => connect("github")}
                        >
                            {t("common.connections.github")}
                        </Menu.Item>
                        <Menu.Item
                            leftSection={<IconBrandGitlab size={20} />}
                            style={{ textAlign: "right" }}
                        >
                            {t("common.connections.gitlab")}
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            )}
        </Stack>
    ) : (
        <></>
    );
}

export function UserSettingsModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const user = useUser();
    const { t } = useTranslation();
    const [tab, setTab] = useState<string>("general");

    useEffect(() => {
        if (!user) {
            onClose();
        }
    }, [user?.id, onClose]);

    return (
        <Modal
            size="xl"
            opened={open}
            onClose={onClose}
            title={
                <Group gap="lg">
                    <IconUserCog />
                    <Text size="lg">{t("modals.userSettings.title")}</Text>
                </Group>
            }
            className="modal user-settings"
        >
            <Tabs
                value={tab}
                onChange={(value) => setTab(value ?? "general")}
                orientation="vertical"
                className="modal-tabs"
            >
                <Tabs.List>
                    <Tabs.Tab
                        value="general"
                        leftSection={<IconUser size={20} />}
                    >
                        {t("modals.userSettings.sections.general.title")}
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="connections"
                        leftSection={<IconPlug size={20} />}
                    >
                        {t("modals.userSettings.sections.connections.title")}
                    </Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel
                    p="xs"
                    value="general"
                    className="modal-tab user-settings-general"
                >
                    TODO
                </Tabs.Panel>
                <Tabs.Panel
                    p="xs"
                    value="connections"
                    className="modal-tab user-settings-connections"
                >
                    <ConnectionSettingsPanel />
                </Tabs.Panel>
            </Tabs>
        </Modal>
    );
}
