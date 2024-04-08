import { util } from '@aws-appsync/utils';

export function request(ctx) {
    const { id } = ctx.source;

    return {
        operation: 'Query',
        query: {
            expression: 'creator = :userId',
            expressionValues: util.dynamodb.toMapValues({ ':userId': id }),
        },
        index: 'byCreator',
        limit: 10,
        select: 'ALL_ATTRIBUTES',
        scanIndexForward: false,
        consistentRead: false,
    };
}

export function response(ctx) {
    return {tweets: ctx.result.items, nextToken: ctx.result.nextToken};
}