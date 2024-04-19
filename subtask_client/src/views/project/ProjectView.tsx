import {
    ActionIcon,
    Avatar,
    Box,
    Divider,
    Group,
    SegmentedControl,
    Stack,
    Text,
} from "@mantine/core";
import { useApiMethods } from "../../util/api";
import { useEffect, useState } from "react";
import { Project } from "../../util/api/types/project";
import { useParams } from "react-router-dom";
import {
    IconInfoSmall,
    IconLayoutKanbanFilled,
    IconSubtask,
    IconTable,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useDisclosure } from "@mantine/hooks";
import "./project.scss";
import { ProjectLayoutTree } from "./layouts/tree/TreeLayout";

export function ProjectView() {
    const { projectId } = useParams();
    const { projects } = useApiMethods();
    const [project, setProject] = useState<Project | null>(null);
    const { t } = useTranslation();
    const [expanded, { toggle }] = useDisclosure(false);
    const [layout, setLayout] = useState<"columns" | "table" | "tree">("tree");

    useEffect(() => {
        projects
            .project(projectId ?? "")
            .get()
            .then(setProject);
    }, [projectId, projects.project]);

    return (
        <Box
            className="project-view"
            h="100%"
            style={{ flexDirection: "column", display: "flex" }}
        >
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
                            <Group gap="sm">
                                <SegmentedControl
                                    size="sm"
                                    className="layout-control"
                                    value={layout}
                                    onChange={(value) =>
                                        setLayout(value as any)
                                    }
                                    data={[
                                        {
                                            value: "columns",
                                            label: (
                                                <IconLayoutKanbanFilled
                                                    size={20}
                                                />
                                            ),
                                        },
                                        {
                                            value: "table",
                                            label: <IconTable size={20} />,
                                        },
                                        {
                                            value: "tree",
                                            label: <IconSubtask size={20} />,
                                        },
                                    ]}
                                />
                                <ActionIcon
                                    radius="xl"
                                    size="lg"
                                    variant="light"
                                    onClick={toggle}
                                >
                                    <IconInfoSmall size="36" />
                                </ActionIcon>
                            </Group>
                        </Group>
                    </Box>
                    <Divider />
                    <Box className="project-canvas">
                        {layout === "tree" && (
                            <ProjectLayoutTree project={project} />
                        )}
                    </Box>
                </>
            ) : (
                <></>
            )}
        </Box>
    );
}
