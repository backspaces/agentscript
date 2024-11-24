const DB_NAME = 'fileAccessDB'
const STORE_NAME = 'handles'

export default class FileAccess {
    constructor(fileName) {
        this.fileName = fileName
        this.fileHandle = null
    }

    // Initialize IndexedDB
    static async _initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1)

            request.onupgradeneeded = event => {
                const db = event.target.result
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'fileName' })
                }
            }

            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error)
        })
    }

    // Save the fileHandle to IndexedDB
    async _saveFileHandle(fileHandle) {
        const db = await FileAccess._initDB()
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)

        await store.put({ fileName: this.fileName, fileHandle })
        tx.oncomplete = () => db.close()
    }

    // Retrieve the fileHandle from IndexedDB
    async _getFileHandle() {
        const db = await FileAccess._initDB()
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)

        const result = await new Promise((resolve, reject) => {
            const request = store.get(this.fileName)

            request.onsuccess = event => resolve(event.target.result)
            request.onerror = event => reject(event.target.error)
        })

        tx.oncomplete = () => db.close()
        return result ? result.fileHandle : null
    }

    // Write JSON to a file
    async writeJson(data) {
        try {
            if (!this.fileHandle) {
                this.fileHandle = await this._getFileHandle()
            }

            if (!this.fileHandle) {
                this.fileHandle = await window.showSaveFilePicker({
                    suggestedName: `${this.fileName}.json`,
                    types: [
                        {
                            description: 'JSON Files',
                            accept: { 'application/json': ['.json'] },
                        },
                    ],
                })

                // Save the handle to IndexedDB
                await this._saveFileHandle(this.fileHandle)
            }

            const writable = await this.fileHandle.createWritable()
            await writable.write(JSON.stringify(data, null, 2))
            await writable.close()

            console.log('JSON file saved successfully.')
        } catch (err) {
            console.error('Error writing JSON file:', err)
        }
    }

    // Read JSON from a file
    async readJson() {
        try {
            if (!this.fileHandle) {
                this.fileHandle = await this._getFileHandle()
            }

            if (!this.fileHandle) {
                console.error('No file handle found. Save the file first.')
                return null
            }

            const file = await this.fileHandle.getFile()
            const content = await file.text()

            return JSON.parse(content)
        } catch (err) {
            console.error('Error reading JSON file:', err)
            return null
        }
    }

    // Clear the file handle from IndexedDB
    async clearFileHandle() {
        const db = await FileAccess._initDB()
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)

        await store.delete(this.fileName)
        tx.oncomplete = () => db.close()

        console.log(`File handle for "${this.fileName}" removed.`)
    }

    // Revoke file handle permissions
    async revokePermissions() {
        if (!this.fileHandle) {
            this.fileHandle = await this._getFileHandle()
        }

        if (!this.fileHandle) {
            console.error('No file handle found. Save a file first.')
            return
        }

        const permission = await this.fileHandle.queryPermission({
            mode: 'readwrite',
        })
        console.log('Current permission:', permission)

        const newPermission = await this.fileHandle.requestPermission({
            mode: 'readwrite',
        })
        console.log('New permission:', newPermission)
    }

    // Reset both file handle and permissions
    async resetAll() {
        await this.clearFileHandle()
        console.log('File handle cleared.')
        await this.revokePermissions()
        console.log('Permissions reset.')
    }
}

//    Use DevTools
// Open Chrome DevTools (Ctrl + Shift + I or Cmd + Option + I).
// Go to the Application tab.
// In the left sidebar, under Storage, select IndexedDB.
// Locate your database (fileAccessDB) and the handles object store.
//   Manually Revoke Permissions
// Open Chrome's settings:
// Go to chrome://settings/content/filesystem-write.
// Locate the website entry under Allowed.
// Remove the permission by clicking the trash icon.
