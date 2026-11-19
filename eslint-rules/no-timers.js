const DEFAULT_NAMES = ['setTimeout'];
const GLOBAL_OBJECTS = ['window', 'globalThis', 'self'];

export default {
  meta: {
    type: 'problem',
    schema: [
      {
        type: 'object',
        properties: { names: { type: 'array', items: { type: 'string' } } },
        additionalProperties: false,
      },
    ],
    messages: {
      banned: '禁止使用 {{name}}',
    },
  },
  create(context) {
    const names = new Set(context.options[0]?.names ?? DEFAULT_NAMES);

    return {
      CallExpression(node) {
        const { callee } = node;
        // setTimeout(...)
        if (callee.type === 'Identifier' && names.has(callee.name)) {
          context.report({ node: callee, messageId: 'banned', data: { name: callee.name } });
        }
        // window.setTimeout(...)
        if (
          callee.type === 'MemberExpression' &&
          callee.object.type === 'Identifier' &&
          GLOBAL_OBJECTS.includes(callee.object.name) &&
          callee.property.type === 'Identifier' &&
          names.has(callee.property.name)
        ) {
          context.report({
            node: callee,
            messageId: 'banned',
            data: { name: callee.property.name },
          });
        }
      },
    };
  },
};
