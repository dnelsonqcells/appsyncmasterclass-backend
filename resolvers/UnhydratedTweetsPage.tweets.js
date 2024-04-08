import { util, runtime } from '@aws-appsync/utils';

export function request(ctx) {
    if (!ctx.source.tweets.length) {
        runtime.earlyReturn([])
    }

    return {
        operation: 'BatchGetItem',
        tables: {
            '#TWEETS_TABLE#': {
                keys: ctx.source.tweets.map(tweet => {
                   return  util.dynamodb.toMapValues({id: tweet.tweetId})
                })
            }
        }
    }
}

export function response(ctx) {
    return ctx.result.data['#TWEETS_TABLE#'];
}