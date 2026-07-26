import { useState, useEffect } from 'react';
import { FirestoreRepository } from '../../infrastructure/FirestoreRepository';

export const useFirestoreData = (collectionName, defaultValue = []) => {
    const [data, setData] = useState(defaultValue);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const repository = new FirestoreRepository(collectionName);
        const unsubscribe = repository.subscribe((newData) => {
            // 날짜순으로 정렬 (최신순)
            // Firestore 인덱스 에러 방지 및 필드 누락 문서 보호를 위해 클라이언트 사이드 정렬 수행
            const sortedData = newData.length > 0 ? [...newData].sort((a, b) => {
                const getSortTime = (doc) => {
                    // 1. createdAt 우선
                    if (doc.createdAt?.seconds) return doc.createdAt.seconds * 1000;
                    if (doc.createdAt) return new Date(doc.createdAt).getTime();
                    
                    // 2. updatedAt (projects fallback)
                    if (doc.updatedAt?.seconds) return doc.updatedAt.seconds * 1000;
                    if (doc.updatedAt) return new Date(doc.updatedAt).getTime();
                    
                    // 3. date (insights fallback)
                    if (doc.date?.seconds) return doc.date.seconds * 1000;
                    if (doc.date) return new Date(doc.date).getTime();
                    
                    return 0;
                };

                const timeA = getSortTime(a);
                const timeB = getSortTime(b);

                return timeB - timeA; // 내림차순
            }) : defaultValue;
            
            setData(sortedData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [collectionName]);

    return { data, loading };
};

export const useProjects = () => {
    return useFirestoreData('projects', []);
};

export const useInsights = () => {
    return useFirestoreData('insights', []);
};

export const useInquiries = () => {
    return useFirestoreData('inquiries', []);
};
