import React, { createContext, useState, useEffect } from 'react';
export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = document.cookie.match('(^|;)\s*token=([^;]+)');
        setIsAuthenticated(!!token);
        setLoading(false);
    }, []);

    return { isAuthenticated, loading };
}

