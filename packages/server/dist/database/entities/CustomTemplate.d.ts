import { ICustomTemplate } from '../../Interface';
export declare class CustomTemplate implements ICustomTemplate {
    id: string;
    name: string;
    flowData: string;
    description?: string;
    badge?: string;
    framework?: string;
    usecases?: string;
    type?: string;
    createdDate: Date;
    updatedDate: Date;
}
