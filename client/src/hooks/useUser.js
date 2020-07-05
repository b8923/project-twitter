import { useState, useCallback, useEffect } from 'react';
import useHttp from '../hooks/useHttp';

const useUser = () => {
    const [currentUser, setCurrentUser] = useState({
        _id: null,
        name: '',
        handle: '',
        location: '',
        website: '',
        bio: '',
        bookmarks: [],
        createdAt: null,
        updatedAt: null,
        followers: [],
        following: [],
        profile_image_url: null,
        banner_image_url: null,
    });

    const { request } = useHttp();

    const getCurrentUser = useCallback(async () => {
        try {
            const response = await request('/api/users/user/profile', 'GET');
            if (response && response.status === 200 && response.status !== 500) {
                return setCurrentUser(response.user);
            }
            setCurrentUser((prev) => ({ ...prev }));
        } catch (e) {}
    }, [request, setCurrentUser]);

    useEffect(() => {
        let isSubscribed = true;
        if (isSubscribed) {
            getCurrentUser();
        }
        return () => (isSubscribed = false);
    }, [getCurrentUser]);

    return {
        getCurrentUser,
        currentUser,
        setCurrentUser,
    };
};

export default useUser;
