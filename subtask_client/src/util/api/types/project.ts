export type ProjectConnection<TLocation = any> = {
    connection_id: string;
    location: TLocation;
};

export enum ProjectPermission {
    Owner = 0,
    Admin,
    Manage,
    Edit,
    View,
}

export enum ProjectGrant {
    Owner = "owner",
    Direct = "direct",
    Invite = "invite",
}

export type ProjectMember = {
    user_id: string;
    permission: ProjectPermission;
    grant: ProjectGrant;
    invite_id: string | null;
};

export type Project = {
    id: string;
    name: string;
    summary: string | null;
    image: string | null;
    connection: ProjectConnection | null;
    members: ProjectMember[];
};
