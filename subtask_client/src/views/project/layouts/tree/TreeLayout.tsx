import { ActionIcon, ActionIconGroup, Box } from "@mantine/core";
import { Project } from "../../../../util/api/types/project";
import "./tree.scss";
import {
    IconCopy,
    IconPencil,
    IconPlus,
    IconTrashFilled,
} from "@tabler/icons-react";

export function ProjectLayoutTree({ project }: { project: Project }) {
    return (
        <Box className="layout-root tree">
            <ActionIconGroup className="tree-controls" orientation="vertical">
                <ActionIcon size="lg">
                    <IconPlus />
                </ActionIcon>
                <ActionIcon size="lg">
                    <IconTrashFilled />
                </ActionIcon>
                <ActionIcon size="lg">
                    <IconCopy />
                </ActionIcon>
                <ActionIcon size="lg">
                    <IconPencil />
                </ActionIcon>
            </ActionIconGroup>
        </Box>
    );
}
