export declare function generate(config: Config): Promise<void>;
export interface Config {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    tables?: string[];
    ignore?: string[];
    folder?: string;
    suffix?: string;
    camelCase?: boolean;
    nullish?: boolean;
    requiredString?: boolean;
}
