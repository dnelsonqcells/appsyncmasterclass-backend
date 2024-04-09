const TweetTypes = {
	TWEET: "Tweet",
	REPLY: "Reply",
	RETWEET: "Retweet",
};

const DynamoDB = {
	MAX_BATCH_SIZE: 25,
};

module.exports = {
	TweetTypes,
	DynamoDB,
};
