import { Box, Group, Paper, Stack, Button, Avatar, Text } from "@mantine/core";
import { Dropzone, DropzoneProps } from "@mantine/dropzone";
import { IconUserCircle, IconPhotoX, IconProps } from "@tabler/icons-react";
import { ReactNode } from "react";
import "./dropzone.scss";
import { useTranslation } from "react-i18next";

export function SubtaskDropzone({
    preview,
    onChange,
    title,
    subtitle,
    icon,
    accept,
    maxSize,
}: {
    preview?: string | null;
    onChange?: (value: File | null) => void;
    title?: string;
    subtitle?: string;
    icon?: (props: IconProps) => ReactNode;
    accept?: DropzoneProps["accept"];
    maxSize?: number;
}) {
    const _onChange = onChange ?? (() => {});
    const Icon = icon ?? IconUserCircle;
    const { t } = useTranslation();

    return (
        <Box className={"dropzone" + (preview ? " with-current" : "")}>
            <Dropzone
                onDrop={(files) => {
                    if (files.length > 0) {
                        _onChange(files[0]);
                    }
                }}
                accept={accept}
                maxFiles={1}
                multiple={false}
                maxSize={maxSize}
            >
                <Group
                    justify="center"
                    gap="xl"
                    mih={220}
                    style={{ pointerEvents: "none" }}
                    className="dropzone-text"
                >
                    <Icon size={64} color="var(--mantine-color-dimmed)" />

                    <div>
                        <Text size="xl" inline>
                            {title ??
                                t("common.actions.dropzone.title.default")}
                        </Text>
                        <Text size="sm" c="dimmed" inline mt={7}>
                            {subtitle ??
                                t("common.actions.dropzone.subtitle.default")}
                        </Text>
                    </div>
                </Group>
            </Dropzone>
            {preview && (
                <Paper p="sm" className="current-image">
                    <Group gap="sm" justify="space-between">
                        <Stack gap={2}>
                            <Text>{t("common.actions.dropzone.current")}</Text>
                            <Button
                                variant="light"
                                size="xs"
                                color="red"
                                leftSection={<IconPhotoX size={16} />}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    _onChange(null);
                                }}
                            >
                                {t("common.actions.dropzone.clear")}
                            </Button>
                        </Stack>
                        <Avatar size="lg" src={preview} />
                    </Group>
                </Paper>
            )}
        </Box>
    );
}
