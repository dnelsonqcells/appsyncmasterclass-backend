const TweetTypes = {
	TWEET: "Tweet",
	REPLY: "Reply",
	RETWEET: "Retweet",
};

const SearchModes = {
	PEOPLE: "People",
	LATEST: "Latest",
};

const HashTagModes = {
	PEOPLE: "People",
	LATEST: "Latest",
};

const DynamoDB = {
	MAX_BATCH_SIZE: 25,
};

module.exports = {
	TweetTypes,
	DynamoDB,
	SearchModes,
	HashTagModes,
};
