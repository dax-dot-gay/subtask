export type UserConnectionType = {
    id: string;
    type: string;
    account_name: string | null;
    account_image: string | null;
};

export type UserType = {
    id: string;
    username: string;
    display_name: string;
    connections: UserConnectionType[];
};
