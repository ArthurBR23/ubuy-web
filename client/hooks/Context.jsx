import { createContext, useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const SignedInContext = createContext();

export const SignedInProvider = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const [state, setState] = useState({ signedIn: isAuthenticated, loading });
    useEffect(() => {
        setState({ signedIn: isAuthenticated, loading });
    }, [isAuthenticated, loading]);

    if (loading) return <div>Loading...</div>;

    return (
        <SignedInContext.Provider value={{ state, setState }}>
            {children}
        </SignedInContext.Provider>
    );
};
