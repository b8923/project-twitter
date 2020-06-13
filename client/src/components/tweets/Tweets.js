import React from 'react';
import Tweet from '../tweet/Tweet';
import Loader from '../loader/Loader';

const Tweets = ({ tweets, loading }) => {
    return (
        <div className="relative">
            {loading && <Loader />}
            {tweets.map((tweet, index) => (
                <Tweet key={index} tweet={tweet} />
            ))}
        </div>
    );
};
export default Tweets;