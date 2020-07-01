import React, { useContext, useEffect, useState, useCallback } from 'react';
import Button from '../button/Button';
import Wall from '../wall/Wall';
import WallHeader from '../wallHeader/WallHeader';
import UserContext from '../../context/UserContext';
import Tab from '../tab/Tab';
import Tweets from '../tweets/Tweets';
import ProfileSettings from '../profileSettings/ProfileSettings';
import useHttp from '../../hooks/useHttp';
import FollowingFollowers from '../followingFollowers/FollowingFollowers';
import { format } from 'date-fns';
import { Switch, Route, Link, withRouter } from 'react-router-dom';
import { ReactComponent as LocationIcon } from '../../assets/icons/location.svg';
import { ReactComponent as ExternalLinkIcon } from '../../assets/icons/external-link.svg';
import { ReactComponent as CalendarIcon } from '../../assets/icons/calendar.svg';

import './profile.scss';

const Profile = ({ match }) => {
    const { currentUser, setCurrentUser, fetchTweets, tweets, tweetsLoading } = useContext(UserContext);

    const { handle } = match.params;
    const { request } = useHttp();
    const [user, setUser] = useState(currentUser);

    useEffect(() => {
        let isSubscribed = true;
        if (isSubscribed) fetchTweets(handle);
        return () => (isSubscribed = false);
    }, [fetchTweets, handle]);

    const getUser = useCallback(
        async (handle) => {
            try {
                const response = await request(`/api/users/user/profile?handle=${handle}`, 'POST');
                if (response && response.status === 200 && response.status !== 500) {
                    setUser(response.user);
                }
            } catch (e) {}
        },
        [request],
    );

    const startFollowing = useCallback(
        async ({ dataset }) => {
            try {
                await request(`/api/users/user/follow/${dataset.usertofollowid}`);
            } catch (e) {}
        },
        [request],
    );

    useEffect(() => {
        let isSubscribed = true;
        if (isSubscribed) getUser(handle);
        return () => (isSubscribed = false);
    }, [handle, getUser]);

    return (
        <Wall className="wall wall--320">
            <WallHeader
                subheading={tweets.length > 1 ? `${tweets.length} Tweets` : tweets.length === 1 ? '1 Tweet' : null}
                arrow="true"
            >
                {user.name || 'Profile'}
            </WallHeader>
            <Switch>
                <Route exact path={`${match.path}/following`}>
                    <FollowingFollowers userHandle={user.handle} list="following" />
                </Route>
                <Route exact path={`${match.path}/followers`}>
                    <FollowingFollowers userHandle={user.handle} list="followers" />
                </Route>
                <Route path={match.path}>
                    <div className="profile">
                        <section
                            className="profile__banner"
                            style={{
                                backgroundImage: `url(${user.banner_image_url})`,
                            }}
                        ></section>
                        <div className="profile__container">
                            <section className="profile__top-bar">
                                <div
                                    className="profile__picture"
                                    style={{
                                        backgroundImage: `url(${user.profile_image_url})`,
                                    }}
                                ></div>
                                {user.handle !== currentUser.handle ? (
                                    <Button
                                        size="md"
                                        fit
                                        styleType={currentUser.following.includes(user._id) && 'unfollow'}
                                        style={{ marginBottom: '22px' }}
                                        data-usertofollowid={user._id}
                                        onClick={({ target }) => {
                                            if (currentUser.following.includes(target.dataset.usertofollowid)) {
                                                setCurrentUser((prev) => ({
                                                    ...prev,
                                                    following: prev.following.filter(
                                                        (id) => id !== target.dataset.usertofollowid,
                                                    ),
                                                }));
                                                return startFollowing(target);
                                            }
                                            setCurrentUser((prev) => ({
                                                ...prev,
                                                following: [...prev.following, target.dataset.usertofollowid],
                                            }));
                                            startFollowing(target);
                                        }}
                                    >
                                        {currentUser.following.includes(user._id) ? null : 'Follow'}
                                    </Button>
                                ) : (
                                    <Link to="/settings/profile">
                                        <Button styleType="outlined" size="md" style={{ marginBottom: '22px' }}>
                                            Edit profile
                                        </Button>
                                    </Link>
                                )}
                            </section>
                            <p className="profile__name">{user.name}</p>
                            <p className="profile__handle">{user.handle}</p>
                            {user.bio && <p className="profile__bio">{user.bio}</p>}
                            <ul className="profile__items">
                                {user.location && (
                                    <li className="profile__item">
                                        <span className="profile__item-icon">
                                            <LocationIcon />
                                        </span>
                                        {user.location}
                                    </li>
                                )}
                                {user.website && (
                                    <li className="profile__item">
                                        <span className="profile__item-icon">
                                            <ExternalLinkIcon />
                                        </span>
                                        <a href={user.website}>{user.website}</a>
                                    </li>
                                )}
                                <li className="profile__item">
                                    <span className="profile__item-icon">
                                        <CalendarIcon />
                                    </span>
                                    Joined {format(new Date(user.createdAt), 'MMMM yyyy')}
                                </li>
                            </ul>
                            <ul className="profile__stats">
                                <li className="profile__following" tabIndex="0">
                                    <Link exact to={`${match.url}/following`}>
                                        <span className="profile__following-count">{user.following.length}</span>
                                        Following
                                    </Link>
                                </li>
                                <li className="profile__followers" tabIndex="0">
                                    <Link exact to={`${match.url}/followers`}>
                                        <span className="profile__followers-count">{user.followers.length}</span>
                                        Followers
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className="profile__tabs">
                            <Tab exact to={match.url}>
                                Tweets
                            </Tab>
                            <Tab exact to={`${match.url}/media`}>
                                Media
                            </Tab>
                            <Tab exact to={`${match.url}/likes`}>
                                Likes
                            </Tab>
                        </div>
                    </div>
                    <Tweets tweets={tweets} loading={tweetsLoading} />
                </Route>
            </Switch>
            <Switch>
                <Route path="/settings/profile">
                    <ProfileSettings />
                </Route>
            </Switch>
        </Wall>
    );
};

export default withRouter(Profile);
