import React, { useState, useContext, useCallback } from 'react';
import Button from '../button/Button';
import UserContext from '../../context/UserContext';
import useHttp from '../../hooks/useHttp';
import { ReactComponent as ImageIcon } from '../../assets/icons/image.svg';
import { ReactComponent as GifIcon } from '../../assets/icons/gif.svg';
import { ReactComponent as SmileIcon } from '../../assets/icons/smile.svg';
import './tweetTextarea.scss';

const TweetTextarea = () => {
    const [tweet, setTweet] = useState('');
    const { request, loading } = useHttp();
    const {
        user: { profileImageUrl, userId },
    } = useContext(UserContext);

    const handleTweetSubmit = useCallback(async () => {
        try {
            const response = await request('/api/tweet/create', 'POST', {
                tweet,
                userId,
            });
        } catch (e) {}
    }, []);

    return (
        <>
            <div className="tweet-textarea">
                <div className="tweet-textarea__profile-image" tabIndex="0">
                    <img src={profileImageUrl} />
                </div>
                <div className="tweet-textarea__right">
                    <div
                        className="tweet-textarea__editable"
                        placeholder="What's happening?"
                        contentEditable="true"
                        onInput={({ target }) => {
                            if (!target.innerText.trim().length) {
                                target.innerText = '';
                            }
                            setTweet(target.innerText);
                        }}
                    ></div>{' '}
                    <div className="tweet-textarea__bottom">
                        <div className="tweet-textarea__bottom--left">
                            <span className="tweet-textarea__icon" tabIndex="0">
                                <ImageIcon />
                            </span>
                            <span className="tweet-textarea__icon" tabIndex="0">
                                <GifIcon />
                            </span>
                            <span className="tweet-textarea__icon" tabIndex="0">
                                <SmileIcon />
                            </span>
                        </div>
                        <Button
                            className="button__filled tweet-textarea__btn"
                            style={{ padding: '8px 14px' }}
                            disabled={tweet.length > 280 || tweet.length < 1 ? true : false}
                            tabIndex="0"
                            onClick={handleTweetSubmit}
                        >
                            Tweet
                        </Button>
                    </div>
                </div>
            </div>
            <div className="divider"></div>
        </>
    );
};

export default TweetTextarea;
