// IndexedDB utility for storing custom background files
const DB_NAME = "kiwi-backgrounds";
const DB_VERSION = 1;
const STORE_NAME = "custom-files";

export interface CustomFile {
    id: string;
    name: string;
    type: "image" | "video";
    blob: Blob;
}

export interface CustomFileDisplay {
    id: string;
    name: string;
    type: "image" | "video";
    url: string; // Object URL for display
}

// Open or create the database
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };
    });
}

// Get all custom files
export async function getCustomFiles(): Promise<CustomFile[]> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("Error getting custom files:", error);
        return [];
    }
}

// Get custom files with object URLs for display
export async function getCustomFilesForDisplay(): Promise<CustomFileDisplay[]> {
    const files = await getCustomFiles();
    return files.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file.blob),
    }));
}

// Save all custom files (replace all)
export async function saveCustomFiles(files: CustomFile[]): Promise<void> {
    try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        
        // Clear existing files
        await new Promise<void>((resolve, reject) => {
            const clearRequest = store.clear();
            clearRequest.onsuccess = () => resolve();
            clearRequest.onerror = () => reject(clearRequest.error);
        });
        
        // Add all new files
        for (const file of files) {
            await new Promise<void>((resolve, reject) => {
                const addRequest = store.add(file);
                addRequest.onsuccess = () => resolve();
                addRequest.onerror = () => reject(addRequest.error);
            });
        }
    } catch (error) {
        console.error("Error saving custom files:", error);
        throw error;
    }
}

// Add a custom file
export async function addCustomFile(file: CustomFile): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(file);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Delete a custom file
export async function deleteCustomFile(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Clear all custom files
export async function clearCustomFiles(): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}
