import {
    Accordion,
    AccordionItem,
    Avatar,
    Badge,
    Button,
    Divider,
    Group,
    Loader,
    Modal,
    Paper,
    ScrollArea,
    Select,
    Space,
    Stack,
    Text,
    TextInput,
    Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
    IconArticle,
    IconBrandGithub,
    IconBrandGitlab,
    IconPencil,
    IconPhotoUp,
    IconPlugConnected,
    IconPlus,
    IconSettings,
    IconUser,
    IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SubtaskDropzone } from "../../dropzone/SubtaskDropzone";
import { IMAGE_MIME_TYPE } from "@mantine/dropzone";
import {
    ConnectionLocation,
    UserConnectionType,
} from "../../../util/api/types/connection";
import { useApiMethods } from "../../../util/api";
import "./projectCreate.scss";

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
    const { connections: connectionApi, projects: projectApi } =
        useApiMethods();
    const form = useForm<ProjectCreateForm>({
        initialValues: {
            name: "",
            summary: "",
            image: null,
        },
    });
    const [preview, setPreview] = useState<string | null>(null);
    const [connections, setConnections] = useState<UserConnectionType[]>([]);
    const [selectedConnection, setSelectedConnection] =
        useState<UserConnectionType | null>(null);
    const [locations, setLocations] = useState<ConnectionLocation[]>([]);
    const [selectedLocation, setSelectedLocation] =
        useState<ConnectionLocation | null>(null);
    const [loadingLocations, setLoadingLocations] = useState(false);

    useEffect(() => {
        if (open === false) {
            form.reset();
        }
    }, [open]);

    useEffect(() => {
        connectionApi.oauth.getConnections().then((v) => {
            setConnections(v ?? []);
            setSelectedConnection(null);
        });
    }, [open]);

    useEffect(() => {
        if (form.values.image) {
            const img = form.values.image;
            const reader = new FileReader();
            reader.addEventListener("load", () =>
                setPreview(reader.result as string)
            );
            reader.readAsDataURL(img);
        } else {
            setPreview(null);
        }
    }, [form.values.image]);

    useEffect(() => {
        if (selectedConnection) {
            connectionApi.operation
                .getLocations(selectedConnection.id)
                .then((value) => {
                    setLocations(value);
                    setLoadingLocations(false);
                });
        } else {
            setLocations([]);
            setLoadingLocations(false);
        }
    }, [selectedConnection?.id]);

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
            <form
                onSubmit={form.onSubmit((values) => {
                    console.log(values, selectedConnection, selectedLocation);
                    if (values.image) {
                        const reader = new FileReader();
                        reader.addEventListener("load", () => {
                            projectApi.meta
                                .create({
                                    name: values.name,
                                    summary: values.summary,
                                    image: reader.result as string,
                                    connection:
                                        selectedConnection && selectedLocation
                                            ? {
                                                  connection_id:
                                                      selectedConnection.id,
                                                  location: selectedLocation.id,
                                              }
                                            : undefined,
                                })
                                .then((value) => {
                                    if (value) {
                                        onClose();
                                    }
                                });
                        });
                        reader.readAsDataURL(values.image);
                    } else {
                        projectApi.meta
                            .create({
                                name: values.name,
                                summary: values.summary,
                                image: undefined,
                                connection:
                                    selectedConnection && selectedLocation
                                        ? {
                                              connection_id:
                                                  selectedConnection.id,
                                              location: selectedLocation.id,
                                          }
                                        : undefined,
                            })
                            .then((value) => {
                                if (value) {
                                    onClose();
                                }
                            });
                    }
                })}
            >
                <Accordion defaultValue="general" variant="contained">
                    <AccordionItem value="general">
                        <Accordion.Control>
                            <Group gap="sm">
                                <IconSettings />
                                <Text>
                                    {t("modals.projectCreate.section.settings")}
                                </Text>
                            </Group>
                        </Accordion.Control>
                        <Accordion.Panel>
                            <Stack gap="sm">
                                <TextInput
                                    label={t("modals.projectCreate.field.name")}
                                    leftSection={<IconPencil size={20} />}
                                    variant="filled"
                                    {...form.getInputProps("name")}
                                />
                                <Textarea
                                    label={t(
                                        "modals.projectCreate.field.summary"
                                    )}
                                    leftSection={<IconArticle size={20} />}
                                    variant="filled"
                                    autosize
                                    maxRows={4}
                                    minRows={2}
                                    {...form.getInputProps("summary")}
                                />
                                <Stack gap={2}>
                                    <Text size="sm">
                                        {t(
                                            "modals.projectCreate.field.image.label"
                                        )}
                                    </Text>
                                    <SubtaskDropzone
                                        preview={preview}
                                        onChange={(value) =>
                                            form.setFieldValue("image", value)
                                        }
                                        subtitle={t(
                                            "modals.projectCreate.field.image.subtitle"
                                        )}
                                        icon={IconPhotoUp as any}
                                        accept={IMAGE_MIME_TYPE}
                                        maxSize={64 * 1024 ** 2}
                                    />
                                </Stack>
                            </Stack>
                        </Accordion.Panel>
                    </AccordionItem>
                    <AccordionItem value="connections">
                        <Accordion.Control>
                            <Group gap="sm">
                                <IconPlugConnected />
                                <Text>
                                    {t(
                                        "modals.projectCreate.section.connections"
                                    )}
                                </Text>
                                {selectedConnection && selectedLocation && (
                                    <>
                                        <Divider orientation="vertical" />
                                        <Badge color="primary" size="md">
                                            {selectedConnection.account_name} -{" "}
                                            {selectedLocation.display_name}
                                        </Badge>
                                    </>
                                )}
                            </Group>
                        </Accordion.Control>
                        <Accordion.Panel>
                            <Stack gap="sm">
                                <Select
                                    clearable
                                    variant="filled"
                                    leftSection={
                                        <IconPlugConnected size={20} />
                                    }
                                    label={t(
                                        "modals.projectCreate.field.sync.select"
                                    )}
                                    value={selectedConnection?.id ?? null}
                                    onChange={(value) => {
                                        if (value) {
                                            setSelectedConnection(
                                                connections.find(
                                                    (v) => v.id === value
                                                ) ?? null
                                            );
                                            setLoadingLocations(true);
                                            setSelectedLocation(null);
                                        } else {
                                            setSelectedConnection(null);
                                            setSelectedLocation(null);
                                            setLocations([]);
                                            setLoadingLocations(false);
                                        }
                                    }}
                                    data={connections.map((v) => ({
                                        value: v.id,
                                        label: v.account_name + " - " + v.type,
                                    }))}
                                    renderOption={(item) => {
                                        const conn = connections.find(
                                            (v) => v.id === item.option.value
                                        );
                                        if (conn) {
                                            return (
                                                <Group
                                                    gap="sm"
                                                    justify="space-between"
                                                    w="100%"
                                                >
                                                    {conn.account_image ? (
                                                        <Avatar
                                                            src={
                                                                conn.account_image
                                                            }
                                                            size="md"
                                                        />
                                                    ) : (
                                                        <Avatar
                                                            size="md"
                                                            color="primary"
                                                        >
                                                            <IconUser
                                                                size={20}
                                                            />
                                                        </Avatar>
                                                    )}
                                                    <Stack
                                                        gap={0}
                                                        style={{ flexGrow: 1 }}
                                                        align="end"
                                                    >
                                                        <Text size="sm">
                                                            {conn.account_name}
                                                        </Text>
                                                        <Text
                                                            c="dimmed"
                                                            size="xs"
                                                        >
                                                            {t(
                                                                `common.connections.${conn.type}`
                                                            )}
                                                        </Text>
                                                    </Stack>
                                                </Group>
                                            );
                                        } else {
                                            return null;
                                        }
                                    }}
                                />
                                {selectedConnection && (
                                    <Paper
                                        withBorder
                                        radius="sm"
                                        p="xs"
                                        className="locations-box"
                                    >
                                        {loadingLocations ? (
                                            <Group
                                                justify="center"
                                                align="center"
                                                p="lg"
                                            >
                                                <Loader />
                                            </Group>
                                        ) : (
                                            <ScrollArea className="locations-scroll">
                                                <Stack gap="xs">
                                                    {locations.map((loc) => (
                                                        <Paper
                                                            key={loc.id}
                                                            className={
                                                                "location-item" +
                                                                (loc.id ===
                                                                selectedLocation?.id
                                                                    ? " selected"
                                                                    : "")
                                                            }
                                                            p="xs"
                                                            radius="sm"
                                                            onClick={() => {
                                                                if (
                                                                    selectedLocation?.id ===
                                                                    loc.id
                                                                ) {
                                                                    setSelectedLocation(
                                                                        null
                                                                    );
                                                                } else {
                                                                    setSelectedLocation(
                                                                        loc
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            <Group
                                                                gap="sm"
                                                                wrap="nowrap"
                                                            >
                                                                <Avatar variant="light">
                                                                    {selectedConnection.type ===
                                                                    "github" ? (
                                                                        <IconBrandGithub />
                                                                    ) : (
                                                                        <IconBrandGitlab />
                                                                    )}
                                                                </Avatar>
                                                                <Stack gap={2}>
                                                                    <Text>
                                                                        {
                                                                            loc.display_name
                                                                        }
                                                                    </Text>
                                                                    {loc.description && (
                                                                        <Text
                                                                            lineClamp={
                                                                                1
                                                                            }
                                                                            c="dimmed"
                                                                        >
                                                                            {
                                                                                loc.description
                                                                            }
                                                                        </Text>
                                                                    )}
                                                                </Stack>
                                                            </Group>
                                                        </Paper>
                                                    ))}
                                                </Stack>
                                            </ScrollArea>
                                        )}
                                    </Paper>
                                )}
                            </Stack>
                        </Accordion.Panel>
                    </AccordionItem>
                </Accordion>
                <Space h="sm" />
                <Group gap="sm" justify="space-between">
                    <Button
                        variant="light"
                        leftSection={<IconX size={20} />}
                        onClick={onClose}
                    >
                        {t("common.actions.cancel")}
                    </Button>
                    <Button
                        leftSection={<IconPlus size={20} />}
                        type="submit"
                        disabled={form.values.name.length === 0}
                    >
                        {t("common.actions.create")}
                    </Button>
                </Group>
            </form>
        </Modal>
    );
}
