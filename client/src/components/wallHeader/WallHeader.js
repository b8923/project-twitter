import React, { useState, useContext, useCallback } from 'react';
import MenuItem from '../menuItem/MenuItem';
import Backdrop from '../backdrop/Backdrop';
import UserContext from '../../context/UserContext';
import useHttp from '../../hooks/useHttp';
import { useHistory } from 'react-router-dom';
import { ReactComponent as BackArrowIcon } from '../../assets/icons/back-arrow.svg';
import './wallHeader.scss';

const WallHeader = ({ children, arrow, subheading, icon, noBorder }) => {
    const history = useHistory();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { setCurrentUser, currentUser } = useContext(UserContext);
    const { request } = useHttp();

    const clearAllBookmarks = useCallback(async () => {
        try {
            if (!currentUser.bookmarks.length) return;
            const response = await request('/api/tweets/tweet/bookmark/destroyAll', 'DELETE');
            if (response && response.status === 200 && response.status !== 500) {
                setCurrentUser((prev) => ({
                    ...prev,
                    bookmarks: [],
                }));
            }
        } catch (e) {}
    }, [request, currentUser, setCurrentUser]);

    return (
        <div className={`wall-header ${noBorder && 'wall-header--no-border'}`}>
            {arrow && (
                <div className="wall-header__icon wall-header__icon--m22" tabIndex="0" onClick={() => history.goBack()}>
                    <span className="wall-header__icon-inner" tabIndex="-1">
                        <BackArrowIcon />
                    </span>
                </div>
            )}
            <div className="wall-header--left">
                <h2 className="wall-header__heading">{children}</h2>
                <span className="wall-header__subheading">{subheading}</span>
            </div>
            {icon && (
                <div className="wall-header__icon" tabIndex="0">
                    <span
                        className="wall-header__icon-inner"
                        tabIndex="-1"
                        onClick={() => setIsMenuOpen((open) => !open)}
                    >
                        {icon}
                    </span>
                    {isMenuOpen && <Backdrop noBg onClick={() => setIsMenuOpen((open) => !open)} />}
                    {isMenuOpen && (
                        <ul className="wall-header__menu" tabIndex="-1">
                            <MenuItem
                                danger={true}
                                onClick={() => {
                                    clearAllBookmarks();
                                    setIsMenuOpen((open) => !open);
                                }}
                            >
                                Clear all Bookmarks
                            </MenuItem>
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default WallHeader;
