import { DataSource } from 'typeorm';
import { IComponentNodes } from '../Interface';
export declare const executeCustomNodeFunction: ({ appDataSource, componentNodes, data }: {
    appDataSource: DataSource;
    componentNodes: IComponentNodes;
    data: any;
}) => Promise<any>;
