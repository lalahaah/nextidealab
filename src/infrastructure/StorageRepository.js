import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './FirebaseConfig';

export class StorageRepository {
    constructor(path = 'uploads') {
        this.path = path;
    }

    /**
     * 파일을 Firebase Storage에 업로드합니다.
     * @param {File} file - 업로드할 파일 객체
     * @param {string} fileName - 저장할 파일 이름 (기본값: 파일의 원래 이름 + 타임스탬프)
     * @returns {Promise<string>} - 업로드된 파일의 다운로드 URL
     */
    async upload(file, fileName) {
        if (!file) throw new Error('No file provided');

        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const finalFileName = fileName || `${timestamp}_${file.name}`;
        const storageRef = ref(storage, `${this.path}/${finalFileName}`);

        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error('Storage upload error:', error);
            throw error;
        }
    }
}
