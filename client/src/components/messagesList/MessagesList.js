import React, { useState, useEffect, useCallback } from 'react';
import useHttp from '../../hooks/useHttp';
import { ReactComponent as ComposeMessageIcon } from '../../assets/icons/compose-message.svg';
import { ReactComponent as SearchIcon } from '../../assets/icons/search-icon.svg';
import { NavLink, Link, useParams } from 'react-router-dom';
import './messagesList.scss';

const MessagesList = () => {
    const params = useParams();
    const { request } = useHttp();
    const [value, setValue] = useState(null);
    const [threads, setThreads] = useState([]);

    const getThreads = useCallback(async () => {
        try {
            const response = await request('/api/direct/threads', 'GET');
            if (response && response.status === 200 && response.status !== 500) {
                setThreads(response.threads);
            }
        } catch (e) {}
    }, [request, setThreads]);

    useEffect(() => {
        let isSubscribed = true;
        if (isSubscribed) getThreads();
        return () => (isSubscribed = false);
    }, [getThreads, params.threadId]);

    return (
        <div className="messages__list">
            <div className="messages__list-header">
                <h2 className="messages__list-header-heading">Messages</h2>
                <Link exact to="/messages/compose" className="messages__list-header-icon" tabIndex="0">
                    <span className="messages__list-header-icon-inner" tabIndex="-1">
                        <ComposeMessageIcon />
                    </span>
                </Link>
            </div>
            <div className="messages__list-searchbar">
                <div className="search-group search-group--lg">
                    <input
                        type="text"
                        placeholder="Search for people or groups"
                        value={value || ''}
                        className="search-group__input"
                        onChange={({ target }) => setValue(target.value)}
                    />
                    <span className="search-group__icon-search">
                        <SearchIcon />
                    </span>
                </div>
            </div>
            <ul className="messages__list-items">
                {threads.map((thread, index) => (
                    <li
                        className={`messages__list-item ${
                            params.threadId === thread.thread_id && 'messages__list-item--active'
                        }`}
                        tabIndex="0"
                        key={index}
                    >
                        <NavLink
                            exact
                            to={`/messages/${thread.thread_id}`}
                            activeClassName="messages__list-item--active"
                            className="messages__list-item-inner"
                            tabIndex="-1"
                        >
                            <div className="messages__list-item-image"></div>
                            <div className="messages__list-item-info">
                                <div className="messages__list-user">
                                    {thread.participants.map((participant) => (
                                        <span className="messages__list-user-name">{participant.name}</span>
                                    ))}
                                    {thread.participants < 2 && (
                                        <span className="messages__list-user-handle">@designcoursecom</span>
                                    )}
                                </div>
                                <div className="messages__list-user-last-message">
                                    <span className="messages__list-user-last-message-text">
                                        We are sorry you are having some technical issues
                                    </span>
                                </div>
                            </div>
                            <span className="messages__list-item-date">Apr 30</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MessagesList;
