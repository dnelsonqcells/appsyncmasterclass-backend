import { util, runtime } from '@aws-appsync/utils';

export function request(ctx) {
    if (ctx.info.selectionSetList.length === 1 && ctx.info.selectionSetList[0] === 'id') {
        const result = {id: ctx.source.creator}

        if (ctx.source.creator === ctx.identity.username) {
            result['__typename'] = 'MyProfile'
        } else {
            result['__typename'] = 'OtherProfile'
        }

        runtime.earlyReturn(result)
    }

    return {
        operation: 'GetItem',
        key: util.dynamodb.toMapValues({id: ctx.source.creator}),
    };
}

export function response(ctx) {
    if (ctx.result) {
        if (ctx.result.id === ctx.identity.username) {
            ctx.result['__typename'] = 'MyProfile'
        } else {
            ctx.result['__typename'] = 'OtherProfile'
        }
    }
    return ctx.result;
}