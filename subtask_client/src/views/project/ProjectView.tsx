import {
    ActionIcon,
    Avatar,
    Box,
    Divider,
    Group,
    Stack,
    Text,
} from "@mantine/core";
import { useApiMethods } from "../../util/api";
import { useEffect, useState } from "react";
import { Project } from "../../util/api/types/project";
import { useParams } from "react-router-dom";
import { IconInfoSmall, IconSubtask } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useDisclosure } from "@mantine/hooks";

export function ProjectView() {
    const { projectId } = useParams();
    const { projects } = useApiMethods();
    const [project, setProject] = useState<Project | null>(null);
    const { t } = useTranslation();
    const [expanded, { toggle }] = useDisclosure(false);

    useEffect(() => {
        projects
            .project(projectId ?? "")
            .get()
            .then(setProject);
    }, [projectId, projects.project]);

    return (
        <Box className="project-view">
            {project ? (
                <>
                    <Box className="project-header" p="sm">
                        <Group gap="sm" justify="space-between">
                            <Group gap="sm">
                                {project.image ? (
                                    <Avatar
                                        size={expanded ? "lg" : "md"}
                                        src={`/api${project.image}`}
                                        className="project-icon"
                                    />
                                ) : (
                                    <Avatar
                                        className="project-icon"
                                        size={expanded ? "lg" : "md"}
                                    >
                                        <IconSubtask />
                                    </Avatar>
                                )}
                                <Stack gap={0}>
                                    <Text>{project.name}</Text>
                                    <Text
                                        size="xs"
                                        c="dimmed"
                                        style={{ whiteSpace: "pre-line" }}
                                        lineClamp={expanded ? 2 : 1}
                                        pr="md"
                                    >
                                        {project.summary
                                            ? project.summary
                                            : t(
                                                  "layout.project.item.no_summary"
                                              )}
                                    </Text>
                                </Stack>
                            </Group>
                            <ActionIcon
                                radius="xl"
                                size="lg"
                                variant="light"
                                onClick={toggle}
                            >
                                <IconInfoSmall size="36" />
                            </ActionIcon>
                        </Group>
                    </Box>
                    <Divider />
                </>
            ) : (
                <></>
            )}
        </Box>
    );
}
