export type ModelPayload<T extends object, K extends keyof T> = Pick<T, K>;
