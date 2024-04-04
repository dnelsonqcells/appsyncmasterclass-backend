import { util } from '@aws-appsync/utils';

export function request(ctx) {
    const {username} = ctx.identity
    const {id} = ctx.source
    return {
        operation: 'GetItem',
        key: util.dynamodb.toMapValues({userId: username, tweetId: id}),
    };
}

export function response(ctx) {
    return !!ctx.result;
}