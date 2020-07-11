import React, { useContext, useEffect, useState } from 'react';
import Wall from '../wall/Wall';
import WallHeader from '../wallHeader/WallHeader';
import TweetActions from '../tweetActions/TweetActions';
import TweetsContext from '../../context/TweetsContext';
import UserContext from '../../context/UserContext';
import MenuItem from '../menuItem/MenuItem';
import Backdrop from '../backdrop/Backdrop';
import useFollow from '../../hooks/useFollow';
import Modal from '../modal/Modal';
import { format } from 'date-fns';
import { convertFromRaw, EditorState, Editor } from 'draft-js';
import { compositeDecorator } from '../../helpers/decorators';
import { ReactComponent as ChevronIcon } from '../../assets/icons/chevron.svg';
import { ReactComponent as TrashIcon } from '../../assets/icons/trash.svg';
import { ReactComponent as PinIcon } from '../../assets/icons/pin.svg';
import { ReactComponent as FollowIcon } from '../../assets/icons/follow.svg';
import { ReactComponent as UnfollowIcon } from '../../assets/icons/unfollow.svg';
import { useParams } from 'react-router-dom';

import './status.scss';

const convertToEditorState = (text) => {
    const content = convertFromRaw(JSON.parse(text));
    const editorState = EditorState.createWithContent(content, compositeDecorator);
    return editorState;
};

const Status = () => {
    const [accordion, setAccordion] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { tweetId } = useParams();
    const { tweet, getTweet, destroy } = useContext(TweetsContext);
    const { currentUser } = useContext(UserContext);
    const { startFollowing } = useFollow();

    useEffect(() => {
        let isSubscribed = true;
        if (Object.keys(tweet).length === 0 && isSubscribed) getTweet(tweetId);
        return () => (isSubscribed = false);
    }, [getTweet, tweetId]);

    return (
        <Wall>
            <WallHeader arrow>Tweet</WallHeader>
            <div className="status">
                {isModalOpen && (
                    <Modal
                        heading="Delete Tweet?"
                        info="This can’t be undone and it will be removed from your profile, 
                          the timeline of any accounts that follow 
                          you, and from Twitter search results. "
                        primaryButtonText="Delete"
                        primaryButtonProps={{
                            styleType: 'danger',
                            size: 'md',
                            onClick: () => destroy(tweet._id, setIsModalOpen),
                        }}
                        buttonProps={{ onClick: () => setIsModalOpen((prev) => !prev) }}
                        backdropProps={{
                            onClick: (ev) => ev.target === ev.currentTarget && setIsModalOpen((prev) => !prev),
                        }}
                    />
                )}
                <div className="status__header">
                    <div className="status__header-left">
                        <div
                            className="status__header-profile-image"
                            style={{ backgroundImage: `url(${tweet.user.profile_image_url})` }}
                        ></div>
                        <div className="nav__profile-info">
                            <div className="nav__profile-name-container">
                                <span className="nav__profile-name">{tweet.user.name}</span>
                            </div>
                            <div className="nav__profile-handle-container">
                                <span className="nav__profile-handle">{tweet.user.handle}</span>
                            </div>
                        </div>
                    </div>
                    <div data-id="chevron" className="tweet__dropdown-icon-container" tabIndex="0">
                        <span
                            className="tweet__dropdown-icon"
                            tabIndex="-1"
                            data-id="chevron"
                            onClick={(ev) => {
                                ev.preventDefault();
                                setAccordion({ id: ev.target.dataset.id });
                            }}
                        >
                            <ChevronIcon />
                        </span>
                        {accordion.id === 'chevron' && (
                            <Backdrop
                                noBg
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    ev.stopPropagation();
                                    setAccordion({});
                                }}
                            />
                        )}
                        <ul
                            tabIndex="-1"
                            className={`tweet__actions-menu ${
                                accordion.id === 'chevron' && 'tweet__actions-menu--active'
                            }`}
                        >
                            {tweet.user._id === currentUser._id && (
                                <>
                                    <MenuItem
                                        icon={<TrashIcon />}
                                        danger={true}
                                        onClick={(ev) => {
                                            ev.preventDefault();
                                            setIsModalOpen((prev) => !prev);
                                            setAccordion({});
                                        }}
                                    >
                                        Delete
                                    </MenuItem>
                                    <MenuItem icon={<PinIcon />}>Pin to your profile</MenuItem>
                                </>
                            )}
                            {!currentUser.following.includes(tweet.user._id) && currentUser._id !== tweet.user._id ? (
                                <MenuItem
                                    icon={<FollowIcon />}
                                    onClick={() => {
                                        startFollowing(tweet.user._id);
                                        setAccordion({});
                                    }}
                                >
                                    Follow {tweet.user.handle}
                                </MenuItem>
                            ) : currentUser._id === tweet.user._id ? null : (
                                <MenuItem
                                    icon={<UnfollowIcon />}
                                    onClick={() => {
                                        startFollowing(tweet.user._id);
                                        setAccordion({});
                                    }}
                                >
                                    Unfollow {tweet.user.handle}
                                </MenuItem>
                            )}
                        </ul>
                    </div>
                </div>
                <div className="status__content">
                    <Editor editorState={convertToEditorState(tweet.text)} readOnly />
                </div>
                <div className="status__date">
                    <span>{format(new Date(tweet.createdAt), 'hh:mm a')}</span>
                    <span className="status__date-middle-dot">&#183;</span>
                    <span>{format(new Date(tweet.createdAt), 'MMM dd, yyyy')}</span>
                </div>
                <div className="status__metrics">
                    <div className="status__metric">
                        <span className="status__metric-count">46</span>
                        <a className="status__metric-link">
                            <span className="status__metric-text">Retweets and comments</span>
                        </a>
                    </div>
                    <div className="status__retweet-comment-metric">
                        <span className="status__metric-count">428</span>
                        <a className="status__metric-link">
                            <span className="status__metric-text">Likes</span>
                        </a>
                    </div>
                </div>
                <TweetActions size="lg" tweet={tweet} style={{ justifyContent: 'space-around' }} />
            </div>
        </Wall>
    );
};

export default Status;
