import { util } from '@aws-appsync/utils';

export function request(ctx) {
    const { nextToken, limit, userId } = ctx.args;

    if (limit > 25) {
        return util.error('max limit is 25')
    }

    return {
        operation: 'Query',
        query: {
            expression: 'userId = :userId',
            expressionValues: util.dynamodb.toMapValues({ ':userId': userId }),
        },
        nextToken,
        limit,
        select: 'ALL_ATTRIBUTES',
        scanIndexForward: false,
        consistentRead: false,
    };
}

export function response(ctx) {
    return {tweets: ctx.result.items, nextToken: ctx.result.nextToken};
}