import {
    Avatar,
    Button,
    Divider,
    Group,
    Paper,
    PasswordInput,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { UseFormReturnType, useForm } from "@mantine/form";
import "./auth.scss";
import { useDisclosure } from "@mantine/hooks";
import {
    IconLock,
    IconLockCheck,
    IconLogin2,
    IconSubtask,
    IconUser,
    IconUserPlus,
    IconWritingSign,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { VisibilityIcon } from "../../components/VisibilityIcon";
import { useApiMethods } from "../../util/api";
import { useNotif } from "../../util/notifs";
import { useNavigate } from "react-router-dom";

type AuthenticationFormType = {
    username: string;
    displayName: string;
    password: string;
    confirmPassword: string;
};

function LoginMode({
    form,
    toggleMode,
}: {
    form: UseFormReturnType<AuthenticationFormType>;
    toggleMode: () => void;
}) {
    const { t } = useTranslation();
    return (
        <Stack gap="sm" className="auth-mode login">
            <Group gap="sm" justify="space-between">
                <IconLogin2 />
                <Text size="lg">{t("views.auth.login.header")}</Text>
            </Group>
            <Divider />
            <TextInput
                variant="filled"
                label={t("views.auth.fields.username")}
                leftSection={<IconUser size={20} />}
                {...form.getInputProps("username")}
            />
            <PasswordInput
                variant="filled"
                label={t("views.auth.fields.password")}
                leftSection={<IconLock size={20} />}
                visibilityToggleIcon={VisibilityIcon}
                {...form.getInputProps("password")}
            />
            <Group gap="sm" grow>
                <Button
                    variant="light"
                    leftSection={<IconUserPlus size={20} />}
                    justify="space-between"
                    onClick={toggleMode}
                    px="sm"
                    pl="xs"
                >
                    {t("views.auth.action.modeCreate")}
                </Button>
                <Button
                    variant="filled"
                    leftSection={<IconLogin2 size={20} />}
                    justify="space-between"
                    px="sm"
                    pl="xs"
                    type="submit"
                >
                    {t("views.auth.action.login")}
                </Button>
            </Group>
        </Stack>
    );
}

function CreateAccountMode({
    form,
    toggleMode,
}: {
    form: UseFormReturnType<AuthenticationFormType>;
    toggleMode: () => void;
}) {
    const { t } = useTranslation();
    return (
        <Stack gap="sm" className="auth-mode create">
            <Group gap="sm" justify="space-between">
                <IconUserPlus />
                <Text size="lg">{t("views.auth.create.header")}</Text>
            </Group>
            <Divider />
            <TextInput
                variant="filled"
                label={t("views.auth.fields.username")}
                leftSection={<IconUser size={20} />}
                {...form.getInputProps("username")}
            />
            <TextInput
                variant="filled"
                label={t("views.auth.fields.displayName")}
                leftSection={<IconWritingSign size={20} />}
                {...form.getInputProps("displayName")}
            />
            <PasswordInput
                variant="filled"
                label={t("views.auth.fields.password")}
                leftSection={<IconLock size={20} />}
                visibilityToggleIcon={VisibilityIcon}
                {...form.getInputProps("password")}
            />
            <PasswordInput
                variant="filled"
                label={t("views.auth.fields.confirm")}
                leftSection={<IconLockCheck size={20} />}
                visibilityToggleIcon={VisibilityIcon}
                {...form.getInputProps("confirmPassword")}
            />
            <Group gap="sm" grow>
                <Button
                    variant="light"
                    leftSection={<IconLogin2 size={20} />}
                    justify="space-between"
                    onClick={toggleMode}
                    px="sm"
                    pl="xs"
                >
                    {t("views.auth.action.modeLogin")}
                </Button>
                <Button
                    variant="filled"
                    leftSection={<IconUserPlus size={20} />}
                    justify="space-between"
                    px="sm"
                    pl="xs"
                    type="submit"
                >
                    {t("views.auth.action.create")}
                </Button>
            </Group>
        </Stack>
    );
}

export function AuthenticationView() {
    const [creating, { toggle: toggleCreating }] = useDisclosure(false);
    const { t } = useTranslation();
    const form = useForm<AuthenticationFormType>({
        initialValues: {
            username: "",
            displayName: "",
            password: "",
            confirmPassword: "",
        },
        validate: {
            username: (value) =>
                value.length > 0 ? null : t("views.auth.errors.usernameEmpty"),
            password: (value, { confirmPassword }) =>
                value.length > 0
                    ? creating && confirmPassword !== value
                        ? t("views.auth.errors.password.match")
                        : null
                    : t("views.auth.errors.password.empty"),
            displayName: (value) =>
                value.length > 0 || !creating
                    ? null
                    : t("views.auth.errors.displayNameEmpty"),
            confirmPassword: (value, { password }) =>
                creating
                    ? value.length > 0
                        ? value === password
                            ? null
                            : t("views.auth.errors.confirmPassword.match")
                        : t("views.auth.errors.confirmPassword.empty")
                    : null,
        },
    });
    const { userAuth } = useApiMethods();
    const { success, error } = useNotif();
    const nav = useNavigate();

    return (
        <Stack className="auth-view" gap="md">
            <Paper
                className="auth-section header"
                p="sm"
                radius="sm"
                shadow="sm"
            >
                <Group gap="sm" justify="space-between" w="100%">
                    <Avatar color="primary">
                        <IconSubtask />
                    </Avatar>
                    <Stack gap={2} align="end">
                        <Text size="lg">{t("common.names.app")}</Text>
                        <Text c="dimmed" size="xs">
                            {t("views.auth.header.description")}
                        </Text>
                    </Stack>
                </Group>
            </Paper>
            <Paper className="auth-section main" p="sm" radius="sm" shadow="sm">
                <form
                    onSubmit={form.onSubmit(
                        ({ username, displayName, password }) => {
                            if (creating) {
                                userAuth
                                    .create(username, displayName, password)
                                    .then((result) => {
                                        if (result) {
                                            success(
                                                t("views.auth.feedback.created")
                                            );
                                            nav("/");
                                        } else {
                                            error(
                                                t(
                                                    "views.auth.feedback.creationFailed"
                                                )
                                            );
                                        }
                                    });
                            } else {
                                userAuth
                                    .login(username, password)
                                    .then((result) => {
                                        if (result) {
                                            success(
                                                t("views.auth.feedback.login")
                                            );
                                            nav("/");
                                        } else {
                                            error(
                                                t(
                                                    "views.auth.feedback.loginFailed"
                                                )
                                            );
                                        }
                                    });
                            }
                        }
                    )}
                >
                    {creating ? (
                        <CreateAccountMode
                            form={form}
                            toggleMode={toggleCreating}
                        />
                    ) : (
                        <LoginMode form={form} toggleMode={toggleCreating} />
                    )}
                </form>
            </Paper>
        </Stack>
    );
}
