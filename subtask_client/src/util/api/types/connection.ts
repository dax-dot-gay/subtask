export type UserConnectionType = {
    id: string;
    user_id: string;
    type: string;
    account_name: string | null;
    account_image: string | null;
};

export type ConnectionLocation<TId = any> = {
    id: TId;
    display_name: string;
    description: string | null;
};
