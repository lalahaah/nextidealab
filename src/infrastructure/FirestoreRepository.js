import {
    collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query
} from 'firebase/firestore';
import { db } from './FirebaseConfig';

const APP_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID || import.meta.env.VITE_APP_ID || 'nextidealab-2f319';

export class FirestoreRepository {
    constructor(collectionName) {
        this.collectionPath = `artifacts/${APP_ID}/public/data/${collectionName}`;
        this.ref = collection(db, this.collectionPath);
    }

    async add(item) {
        return await addDoc(this.ref, item);
    }

    async update(id, item) {
        const docRef = doc(db, this.collectionPath, id);
        return await updateDoc(docRef, item);
    }

    async delete(id) {
        const docRef = doc(db, this.collectionPath, id);
        return await deleteDoc(docRef);
    }

    subscribe(callback) {
        const q = query(this.ref);
        return onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(data);
        });
    }
}
