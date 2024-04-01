import { UserType } from "./user";

export type SessionType = {
    id: string;
    creation_time: string;
    access_time: string;
    user: null | UserType;
};
