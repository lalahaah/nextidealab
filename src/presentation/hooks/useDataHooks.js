import { useState, useEffect } from 'react';
import { FirestoreRepository } from '../../infrastructure/FirestoreRepository';

export const useFirestoreData = (collectionName, defaultValue = []) => {
    const [data, setData] = useState(defaultValue);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const repository = new FirestoreRepository(collectionName);
        const unsubscribe = repository.subscribe((newData) => {
            setData(newData.length > 0 ? newData : defaultValue);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [collectionName]);

    return { data, loading };
};

export const useProjects = () => {
    const defaultProjects = [
        { id: 'lucifer', title: 'Lucifer', category: 'Automation', status: 'Live', description: '디지털 전환 자동화 파이프라인.', longDescription: '레거시 데이터 통합 플랫폼.', tags: 'Next.js, Python, Firebase' },
        { id: 'round-media', title: 'Round Media', category: 'AI', status: 'Live', description: 'AI 기반 콘텐츠 생성 시스템.', longDescription: 'LLM 기반 멀티 채널 배포 파이프라인.', tags: 'React, OpenAI, FastAPI' }
    ];
    return useFirestoreData('projects', defaultProjects);
};

export const useInsights = () => {
    const defaultInsights = [
        { id: 'i1', title: 'Building the Next Generation Lab', category: 'Vision', date: '2026. 02. 21', content: '<h3>Welcome to NIL</h3><p>기록이 자산이 되는 공간입니다. 우리는 실험을 멈추지 않습니다.</p>' }
    ];
    return useFirestoreData('insights', defaultInsights);
};

export const useInquiries = () => {
    return useFirestoreData('inquiries', []);
};
