import {
    ActionIcon,
    AppShell,
    Avatar,
    Box,
    Burger,
    Button,
    Divider,
    Group,
    Paper,
    ScrollAreaAutosize,
    Stack,
    Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import {
    IconLogout2,
    IconPlus,
    IconSettings,
    IconSubtask,
    IconUser,
} from "@tabler/icons-react";
import "./layout.scss";
import { useApi, useApiMethods, useUser } from "../../util/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UserSettingsModal } from "../../components/modals/userSettings/UserSettingsModal";
import { ProjectCreateModal } from "../../components/modals/projectCreate/ProjectCreateModal";
import { Project } from "../../util/api/types/project";
import { PermissionIcon } from "../../components/projects/PermissionIcon";

function ProjectItem({ project }: { project: Project }) {
    const { t } = useTranslation();
    const user = useUser();
    const { projectId } = useParams();
    const nav = useNavigate();

    const member = useMemo(() => {
        if (user?.id) {
            return project.members.find((v) => v.user_id === user.id) ?? null;
        } else {
            return null;
        }
    }, [user?.id, project.members]);

    return (
        <Paper
            className={
                "project-item" + (projectId === project.id ? " selected" : "")
            }
            p="sm"
            radius="sm"
            onClick={() => nav(`/project/${project.id}`)}
        >
            <Group gap="sm">
                {project.image ? (
                    <Avatar
                        src={`/api${project.image}`}
                        className="project-icon"
                    />
                ) : (
                    <Avatar className="project-icon">
                        <IconSubtask />
                    </Avatar>
                )}
                <Stack gap={0}>
                    <Text>{project.name}</Text>
                    <Text size="xs" c="dimmed" lineClamp={1}>
                        {project.summary
                            ? project.summary.split("\n")[0]
                            : t("layout.project.item.no_summary")}
                    </Text>
                </Stack>
            </Group>
            {member && (
                <PermissionIcon
                    permission={member.permission}
                    withTooltip
                    className="permission-icon"
                    size={18}
                    tooltipProps={{
                        position: "right",
                        withArrow: true,
                    }}
                />
            )}
        </Paper>
    );
}

export function SiteLayout() {
    const { t } = useTranslation();
    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
    const api = useApi();
    const loginState = api.status === "ready" && api.user;
    const user = useUser();
    const nav = useNavigate();
    const location = useLocation();
    const { userAuth, projects: projectApi } = useApiMethods();
    const [projects, setProjects] = useState<Project[]>([]);

    const reloadProjects = useCallback(() => {
        projectApi.meta.list().then(setProjects);
    }, [projectApi.meta.list]);
    const [settings, { open: openSettings, close: closeSettings }] =
        useDisclosure(false, { onClose: reloadProjects });

    const [projectCreate, { open: openProject, close: closeProject }] =
        useDisclosure(false);

    useEffect(() => {
        if (api.status === "ready" && !user && location.pathname !== "/login") {
            nav("login");
        }
    }, [api.status, user?.id, location.pathname]);

    useEffect(() => {
        reloadProjects();
    }, [reloadProjects]);

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 300,
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
                        <Paper
                            className="nav-projects"
                            p="xs"
                            m="xs"
                            mb={0}
                            shadow="sm"
                        >
                            <ScrollAreaAutosize className="nav-project-scroll">
                                <Stack gap="sm" className="nav-stack-projects">
                                    {projects.map((project) => (
                                        <ProjectItem
                                            project={project}
                                            key={project.id}
                                        />
                                    ))}
                                </Stack>
                            </ScrollAreaAutosize>
                        </Paper>
                        <Box p="xs">
                            <Button
                                fullWidth
                                leftSection={<IconPlus size={20} />}
                                justify="space-between"
                                onClick={openProject}
                            >
                                {t("layout.actions.createProject")}
                            </Button>
                        </Box>
                        <Divider />
                        <Stack gap="xs" className="nav-stack-actions" p="sm">
                            <Group gap="sm" justify="space-between">
                                {user.avatar ? (
                                    <Avatar
                                        color="primary"
                                        size="md"
                                        src={`/api${user.avatar}`}
                                    />
                                ) : (
                                    <Avatar color="primary" size="md">
                                        <IconUser size={20} />
                                    </Avatar>
                                )}
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
                <ProjectCreateModal
                    open={projectCreate}
                    onClose={closeProject}
                />
            </AppShell.Main>
        </AppShell>
    );
}
