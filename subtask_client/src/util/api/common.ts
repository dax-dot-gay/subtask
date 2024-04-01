import { createContext } from "react";
import { SessionType } from "./types/session";
import { UserType } from "./types/user";

export type ApiResponse<TData = any, TError = string> =
    | {
          success: true;
          data: TData;
      }
    | {
          success: false;
          data: TError;
          code: number;
      };

export type RequestQueryValue =
    | string
    | number
    | boolean
    | (string | number | boolean)[];

export type MethodsNoBody = {
    method: "GET" | "DELETE";
    query: { [key: string]: RequestQueryValue };
};
export type MethodsWithBody = {
    method: "POST" | "PUT" | "PATCH";
    query: { [key: string]: RequestQueryValue };
    body: any;
};

export type RequestOptionsType = MethodsNoBody | MethodsWithBody;

export function isBodyMethod(obj: any): obj is Partial<MethodsWithBody> {
    return obj && obj.method && ["POST", "PUT", "PATCH"].includes(obj.method);
}

export type RequestFunction = <TData = any, TError = any>(
    endpoint: string,
    options?: Partial<RequestOptionsType>
) => Promise<ApiResponse<TData, TError>>;

export type ApiContextType =
    | {
          status: "ready";
          session: SessionType;
          user: UserType | null;
          request: RequestFunction;
          reload: () => Promise<void>;
      }
    | {
          status: "initializing";
      }
    | {
          status: "error";
          reason: string;
      };

export const ApiContext = createContext<ApiContextType>({
    status: "error",
    reason: "Context not initialized.",
});
