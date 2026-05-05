declare const _default: {
    getAllNodes: () => Promise<import("thub-components").INode[]>;
    getNodeByName: (nodeName: string) => Promise<import("thub-components").INode>;
    getSingleNodeIcon: (nodeName: string) => Promise<string>;
    getSingleNodeAsyncOptions: (nodeName: string, requestBody: any, tenantId: string) => Promise<any>;
    executeCustomFunction: (requestBody: any) => Promise<any>;
    getAllNodesForCategory: (category: string) => Promise<import("thub-components").INode[]>;
};
export default _default;
