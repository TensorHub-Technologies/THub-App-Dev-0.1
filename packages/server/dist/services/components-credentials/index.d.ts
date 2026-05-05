declare const _default: {
    getAllComponentsCredentials: () => Promise<any>;
    getComponentByName: (credentialName: string) => Promise<import("thub-components").INode | import("thub-components").INode[]>;
    getSingleComponentsCredentialIcon: (credentialName: string) => Promise<string>;
};
export default _default;
