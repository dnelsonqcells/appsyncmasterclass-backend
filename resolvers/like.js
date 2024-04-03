import { util } from '@aws-appsync/utils';

export function request(ctx) {
    const {username} = ctx.identity;
    const {tweetId} = ctx.args
    return {
        operation: 'TransactWriteItems',
        transactItems: [
            {
                table: '#LIKES_TABLE#',
                operation: 'PutItem',
                key: util.dynamodb.toMapValues({userId: username, tweetId}),
                condition: util.transform.toDynamoDBConditionExpression({
                    tweetId: { not: tweetId },
                }),
            },
            {
                table: '#TWEETS_TABLE#',
                operation: 'UpdateItem',
                key: util.dynamodb.toMapValues({ id: tweetId }),
                update: {
                    expression: 'ADD likes :one',
                    expressionValues: util.dynamodb.toMapValues({ ':one': 1 }),
                },
                condition: util.transform.toDynamoDBConditionExpression({
                    tweetId: { attribute_exists: tweetId },
                }),
            },
            {
                table: '#USERS_TABLE#',
                operation: 'UpdateItem',
                key: util.dynamodb.toMapValues({ id: username }),
                update: {
                    expression: 'ADD likesCounts :one',
                    expressionValues: util.dynamodb.toMapValues({ ':one': 1 }),
                },
                condition: util.transform.toDynamoDBConditionExpression({
                    id: { attribute_exists: username },
                }),
            },
        ],
    };
}

export function response(ctx) {
    if (ctx.result.cancellationReasons) return util.error('DynamoDB transaction error');
    if (ctx.error) return util.error('Failed to execute DynamoDB transaction');
    return true;
}