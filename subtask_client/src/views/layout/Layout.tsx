import {
    ActionIcon,
    AppShell,
    Avatar,
    Box,
    Burger,
    Button,
    Divider,
    Group,
    Stack,
    Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    IconLogout2,
    IconSettings,
    IconSubtask,
    IconUser,
} from "@tabler/icons-react";
import "./layout.scss";
import { useApi, useApiMethods, useUser } from "../../util/api";
import { useEffect } from "react";
import { UserSettingsModal } from "../../components/modals/userSettings/UserSettingsModal";

export function SiteLayout() {
    const { t } = useTranslation();
    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
    const api = useApi();
    const loginState = api.status === "ready" && api.user;
    const user = useUser();
    const nav = useNavigate();
    const location = useLocation();
    const { userAuth } = useApiMethods();
    const [settings, { open: openSettings, close: closeSettings }] =
        useDisclosure(false);

    useEffect(() => {
        if (api.status === "ready" && !user && location.pathname !== "/login") {
            nav("login");
        }
    }, [api.status, user?.id, location.pathname]);

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 256,
                breakpoint: "sm",
                collapsed: {
                    mobile: !mobileOpened || !loginState,
                    desktop: !desktopOpened || !loginState,
                },
            }}
            className="site-layout"
        >
            <AppShell.Header className="site-header">
                <Group gap="md" h="100%" px="sm">
                    {loginState && (
                        <>
                            <Burger
                                opened={mobileOpened}
                                onClick={toggleMobile}
                                hiddenFrom="sm"
                                size="sm"
                            />
                            <Burger
                                opened={desktopOpened}
                                onClick={toggleDesktop}
                                visibleFrom="sm"
                                size="sm"
                            />
                        </>
                    )}
                    <Group gap="sm" align="center">
                        <Avatar className="app-logo" color="primary">
                            <IconSubtask />
                        </Avatar>
                        <Text size="lg" className="app-title">
                            {t("common.names.app")}
                        </Text>
                    </Group>
                </Group>
            </AppShell.Header>
            <AppShell.Navbar className="site-nav">
                {user && (
                    <Stack gap={2} className="nav-stack-main">
                        <Stack gap="sm" className="nav-stack-projects"></Stack>
                        <Divider />
                        <Stack gap="xs" className="nav-stack-actions" p="sm">
                            <Group gap="sm" justify="space-between">
                                <Avatar color="primary" size="md">
                                    <IconUser size={20} />
                                </Avatar>
                                <Stack gap={0} align="end">
                                    <Text>{user.display_name}</Text>
                                    <Text size="xs" c="dimmed">
                                        {user.username}
                                    </Text>
                                </Stack>
                            </Group>
                            <Group wrap="nowrap" gap="sm">
                                <ActionIcon
                                    size={36}
                                    variant="light"
                                    onClick={openSettings}
                                >
                                    <IconSettings size={20} />
                                </ActionIcon>
                                <Button
                                    leftSection={<IconLogout2 size={20} />}
                                    justify="space-between"
                                    style={{ flexGrow: 1 }}
                                    variant="light"
                                    px="xs"
                                    onClick={() => userAuth.logout()}
                                >
                                    {t("layout.actions.logout")}
                                </Button>
                            </Group>
                        </Stack>
                    </Stack>
                )}
            </AppShell.Navbar>
            <AppShell.Main className="site-main">
                <Box className="site-container">
                    <Outlet />
                </Box>
                <UserSettingsModal open={settings} onClose={closeSettings} />
            </AppShell.Main>
        </AppShell>
    );
}
