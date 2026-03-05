import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from '../../infrastructure/FirebaseConfig';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        // 익명 로그인 시도 (설정 상 필요할 경우)
        signInAnonymously(auth).catch(err => console.error("Auth failed:", err));
        const unsubscribe = onAuthStateChanged(auth, setUser);
        return () => unsubscribe();
    }, []);

    return (
        <AppContext.Provider value={{ user, selectedProject, setSelectedProject }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useApp must be used within AppProvider");
    return context;
};
