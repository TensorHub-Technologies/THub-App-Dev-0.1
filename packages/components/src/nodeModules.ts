export class NodeModules {
    static moduleMap: Record<string, string> = {}

    static registerModule(name: string, filePath: string): void {
        if (this.moduleMap[name]) {
            throw new Error(`Module with name ${name} is already registered.`)
        }
        this.moduleMap[name] = filePath
    }

    static getModulePath(name: string): string {
        const modulePath = this.moduleMap[name]
        if (!modulePath) {
            throw new Error(`Module with name ${name} is not registered.`)
        }
        return modulePath
    }

    static async getNodeModule(name: any): Promise<any> {
        const moduleName = String(name)
        if (typeof name !== 'string') {
            throw new Error(`Invalid type for module name: ${typeof name}`)
        }
        const modulePath = this.getModulePath(moduleName)
        return await import(modulePath)
    }
}
