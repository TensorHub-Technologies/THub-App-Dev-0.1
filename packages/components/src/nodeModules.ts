import path from 'path'

export class NodeModules {
    static importedModules: Record<string, any> = {}

    static async registerModules(nodeFiles: string[]): Promise<void> {
        let index = 0
        const filteredFiles = nodeFiles.filter((file) => file.endsWith('.js'))

        for (let file of filteredFiles) {
            const propertyName = this.getPropertyName(file)
            if (propertyName === 'agent') {
                console.log(`Name: ${propertyName}, FilePath: ${file}`)
            }
            await this.registerModule(propertyName, file)
            index++
        }
    }

    static getPropertyName(file: string): string {
        const fileName = path.basename(file, '.js')
        return fileName.toLowerCase()
    }

    static async registerModule(name: string, filePath: string): Promise<void> {
        const importedModule = await import(filePath)
        if (!importedModule.nodeClass && !importedModule.credClass) {
            return
        }

        this.importedModules[name] = importedModule
        // Log the registration for debugging purposes
        // console.log(`Registered module: ${name}`)
    }

    static async getNodeModule(name: any): Promise<any> {
        if (typeof name !== 'string') {
            throw new Error(`Invalid type for module name: ${typeof name}`)
        }
        const moduleName = String(name)

        const propertyName = this.getPropertyName(moduleName)
        const importedModule = this.importedModules[propertyName]
        if (!importedModule) {
            // console.warn(`Module with name ${propertyName} is not registered.`);
            return
        }
        return importedModule
    }
}
