import { AppShell, Avatar, Burger, Group, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import { IconSubtask } from "@tabler/icons-react";
import "./layout.scss";

export function SiteLayout() {
    const { t } = useTranslation();
    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
    const loginState = false;

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
            <AppShell.Navbar className="site-nav"></AppShell.Navbar>
            <AppShell.Main>
                <Outlet />
            </AppShell.Main>
        </AppShell>
    );
}
