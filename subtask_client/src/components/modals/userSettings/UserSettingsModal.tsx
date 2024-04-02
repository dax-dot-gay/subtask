import { useTranslation } from "react-i18next";
import { useApiMethods, useApiReload, useUser } from "../../../util/api";
import {
    ActionIcon,
    Avatar,
    Badge,
    Box,
    Button,
    Group,
    Modal,
    Paper,
    Stack,
    Tabs,
    Text,
    TextInput,
} from "@mantine/core";
import {
    IconBrandGithub,
    IconBrandGitlab,
    IconDeviceFloppy,
    IconPhotoX,
    IconPlug,
    IconPlugConnectedX,
    IconSignature,
    IconUser,
    IconUserCircle,
    IconUserCog,
} from "@tabler/icons-react";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useCallback, useEffect, useMemo, useState } from "react";
import "./userSettings.scss";
import { UserConnectionType } from "../../../util/api/types/connection";
import { modals } from "@mantine/modals";
import { useNotif } from "../../../util/notifs";

function ConnectionItem({
    connection,
    reloadConnections,
}: {
    connection: UserConnectionType;
    reloadConnections: () => Promise<void>;
}) {
    const { t } = useTranslation();
    const { connections } = useApiMethods();
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
                <ActionIcon
                    variant="subtle"
                    size="lg"
                    color="red"
                    onClick={() =>
                        modals.openConfirmModal({
                            title: t("common.modal.confirm.delete.title"),
                            children: (
                                <Text>
                                    {t(
                                        "modals.userSettings.sections.connections.delete.confirm"
                                    )}
                                </Text>
                            ),
                            labels: {
                                confirm: t("common.actions.confirm"),
                                cancel: t("common.actions.cancel"),
                            },
                            onConfirm: () =>
                                connections.operation
                                    .deleteConnection(connection.id)
                                    .then(reloadConnections),
                        })
                    }
                >
                    <IconPlugConnectedX size={20} />
                </ActionIcon>
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

    const [connectionsList, setConnectionsList] = useState<
        UserConnectionType[]
    >([]);

    const reloadConnections = useCallback(async () => {
        const value = await connections.oauth.getConnections();
        setConnectionsList(value ?? []);
    }, [connections.oauth.getConnections]);

    useEffect(() => {
        reloadConnections();
    }, [user?.id]);

    return user ? (
        <Stack gap="sm" className="modal-panel connectionList">
            <Paper
                withBorder
                className={
                    "connections-box" +
                    (connectionsList.length === 0 ? " empty" : "")
                }
                radius="sm"
                p="sm"
            >
                {connectionsList.length === 0 ? (
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
                        {connectionsList.map((v) => (
                            <ConnectionItem
                                connection={v}
                                key={v.id}
                                reloadConnections={reloadConnections}
                            />
                        ))}
                    </Stack>
                )}
            </Paper>
            {connectionsList.length > 0 && (
                <Group gap="sm" wrap="nowrap" grow>
                    <Button
                        leftSection={<IconBrandGithub size={20} />}
                        color="rgb(36, 41, 47)"
                        onClick={() => connect("github")}
                        justify="space-between"
                    >
                        {t("common.connections.github")}
                    </Button>
                    <Button
                        leftSection={<IconBrandGitlab size={20} />}
                        color="rgb(	252, 109, 38)"
                        justify="space-between"
                    >
                        {t("common.connections.gitlab")}
                    </Button>
                </Group>
            )}
        </Stack>
    ) : (
        <></>
    );
}

function GeneralSettingsPanel() {
    const user = useUser();
    const { t } = useTranslation();
    const { user: userApi } = useApiMethods();
    const reload = useApiReload();

    const [username, setUsername] = useState<string>(user?.username ?? "");
    const [displayName, setDisplayName] = useState<string>(
        user?.display_name ?? ""
    );
    const { error } = useNotif();

    useEffect(() => {
        if (user?.username) {
            setUsername(user.username);
        }
    }, [user?.username]);

    useEffect(() => {
        if (user?.display_name) {
            setDisplayName(user.display_name);
        }
    }, [user?.display_name]);

    return user ? (
        <Stack className="modal-panel settings-general" gap="sm">
            <Group wrap="nowrap" gap="xs" align="end">
                <TextInput
                    leftSection={<IconUser size={20} />}
                    variant="filled"
                    label={t(
                        "modals.userSettings.sections.general.field.username"
                    )}
                    style={{ flexGrow: 1 }}
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                />
                <ActionIcon
                    size={36}
                    disabled={
                        username.length === 0 || username == user?.username
                    }
                    onClick={() =>
                        userApi.self.updateUsername(username).then((result) => {
                            if (result) {
                                reload();
                            } else {
                                error(
                                    t(
                                        "modals.userSettings.sections.general.error.username"
                                    )
                                );
                            }
                        })
                    }
                >
                    <IconDeviceFloppy size={20} />
                </ActionIcon>
            </Group>
            <Group wrap="nowrap" gap="xs" align="end">
                <TextInput
                    leftSection={<IconSignature size={20} />}
                    variant="filled"
                    label={t(
                        "modals.userSettings.sections.general.field.displayName"
                    )}
                    style={{ flexGrow: 1 }}
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                />
                <ActionIcon
                    size={36}
                    disabled={
                        displayName.length === 0 ||
                        displayName == user?.display_name
                    }
                    onClick={() =>
                        userApi.self.updateDisplayName(displayName).then(reload)
                    }
                >
                    <IconDeviceFloppy size={20} />
                </ActionIcon>
            </Group>
            <Box
                className={
                    "profile-drop" + (user.avatar ? " with-current" : "")
                }
            >
                <Dropzone
                    onDrop={(files) => {
                        if (files.length > 0) {
                            userApi.self.updateAvatar(files[0]).then(reload);
                        }
                    }}
                    accept={IMAGE_MIME_TYPE}
                    maxFiles={1}
                    multiple={false}
                    maxSize={64 * 1024 ** 2}
                >
                    <Group
                        justify="center"
                        gap="xl"
                        mih={220}
                        style={{ pointerEvents: "none" }}
                        className="dropzone-text"
                    >
                        <IconUserCircle
                            size={64}
                            color="var(--mantine-color-dimmed)"
                        />

                        <div>
                            <Text size="xl" inline>
                                {t("common.actions.dropzone.instruction")}
                            </Text>
                            <Text size="sm" c="dimmed" inline mt={7}>
                                {t(
                                    "modals.userSettings.sections.general.field.profile.dropzone"
                                )}
                            </Text>
                        </div>
                    </Group>
                </Dropzone>
                {user.avatar && (
                    <Paper p="sm" className="current-profile">
                        <Group gap="sm" justify="space-between">
                            <Stack gap={2}>
                                <Text>
                                    {t(
                                        "modals.userSettings.sections.general.field.profile.current"
                                    )}
                                </Text>
                                <Button
                                    variant="light"
                                    size="xs"
                                    color="red"
                                    leftSection={<IconPhotoX size={16} />}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        userApi.self.clearAvatar().then(reload);
                                    }}
                                >
                                    {t(
                                        "modals.userSettings.sections.general.field.profile.remove"
                                    )}
                                </Button>
                            </Stack>
                            <Avatar size="lg" src={`/api${user.avatar}`} />
                        </Group>
                    </Paper>
                )}
            </Box>
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
                    <GeneralSettingsPanel />
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
