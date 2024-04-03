import { Group, Modal, Stack, Text, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconArticle, IconPencil, IconPlus } from "@tabler/icons-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

type ProjectCreateForm = {
    name: string;
    summary: string;
    image: File | null;
};

export function ProjectCreateModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const form = useForm<ProjectCreateForm>({
        initialValues: {
            name: "",
            summary: "",
            image: null,
        },
    });

    useEffect(() => {
        if (open === false) {
            form.reset();
        }
    }, [open]);

    return (
        <Modal
            opened={open}
            onClose={onClose}
            size="xl"
            title={
                <Group gap="md">
                    <IconPlus />
                    <Text size="lg">{t("modals.projectCreate.title")}</Text>
                </Group>
            }
        >
            <form onSubmit={form.onSubmit((values) => console.log(values))}>
                <Stack gap="sm">
                    <TextInput
                        label={t("modals.projectCreate.field.name")}
                        leftSection={<IconPencil size={20} />}
                        variant="filled"
                        {...form.getInputProps("name")}
                    />
                    <Textarea
                        label={t("modals.projectCreate.field.summary")}
                        leftSection={<IconArticle size={20} />}
                        variant="filled"
                        autosize
                        maxRows={4}
                        minRows={2}
                        {...form.getInputProps("summary")}
                    />
                </Stack>
            </form>
        </Modal>
    );
}
