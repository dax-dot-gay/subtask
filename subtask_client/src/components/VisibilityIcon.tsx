import { IconEyeClosed, IconEye } from "@tabler/icons-react";

export function VisibilityIcon({ reveal }: { reveal: boolean }) {
    return reveal ? <IconEyeClosed size={18} /> : <IconEye size={18} />;
}
