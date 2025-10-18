import { Appointment } from '../components/Calendar';
import { Client } from '../types';

const DB_NAME = 'JohanaTatuajesDB';
const DB_VERSION = 1;
let db: IDBDatabase;

export const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('Error al abrir la base de datos:', event);
            reject('Error al abrir la base de datos');
        };

        request.onsuccess = (event) => {
            db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const tempDb = (event.target as IDBOpenDBRequest).result;
            if (!tempDb.objectStoreNames.contains('appointments')) {
                tempDb.createObjectStore('appointments', { keyPath: 'id', autoIncrement: true });
            }
            if (!tempDb.objectStoreNames.contains('clients')) {
                const clientStore = tempDb.createObjectStore('clients', { keyPath: 'id', autoIncrement: true });
                clientStore.createIndex('contact', 'contact', { unique: true });
                clientStore.createIndex('name', 'name', { unique: false });
            }
        };
    });
};

export const getAll = <T>(storeName: string): Promise<T[]> => {
    return new Promise(async (resolve, reject) => {
        const db = await initDB();
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result as T[]);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
};

export const add = <T>(storeName: string, item: Omit<T, 'id'>): Promise<IDBValidKey> => {
    return new Promise(async (resolve, reject) => {
        const db = await initDB();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(item);

        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
};

export const put = <T>(storeName: string, item: T): Promise<IDBValidKey> => {
    return new Promise(async (resolve, reject) => {
        const db = await initDB();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item);

        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
};


export const deleteItem = (storeName: string, key: number): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        const db = await initDB();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);

        request.onsuccess = () => {
            resolve();
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
};


export const findOrAddClient = async (name: string, contact: string): Promise<Client> => {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('clients', 'readwrite');
        const store = transaction.objectStore('clients');
        const index = store.index('contact');
        const getRequest = index.get(contact);

        getRequest.onsuccess = () => {
            const existingClient = getRequest.result;
            if (existingClient) {
                resolve(existingClient);
            } else {
                const newClient: Omit<Client, 'id'> = {
                    name,
                    contact,
                    notes: '',
                    createdAt: new Date().toISOString()
                };
                const addRequest = store.add(newClient);
                addRequest.onsuccess = () => {
                    resolve({ ...newClient, id: addRequest.result as number });
                };
                addRequest.onerror = () => {
                    reject(addRequest.error);
                };
            }
        };
        getRequest.onerror = () => {
            reject(getRequest.error);
        };
    });
};
