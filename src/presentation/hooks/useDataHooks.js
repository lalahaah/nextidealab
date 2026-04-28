import { useState, useEffect } from 'react';
import { FirestoreRepository } from '../../infrastructure/FirestoreRepository';

export const useFirestoreData = (collectionName, defaultValue = []) => {
    const [data, setData] = useState(defaultValue);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const repository = new FirestoreRepository(collectionName);
        const unsubscribe = repository.subscribe((newData) => {
            // 날짜순으로 정렬 (최신순)
            const sortedData = newData.length > 0 ? [...newData].sort((a, b) => {
                const dateA = new Date(a.date || 0);
                const dateB = new Date(b.date || 0);
                return dateB - dateA; // 내림차순 (최신 먼저)
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
