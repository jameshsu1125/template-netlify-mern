const DEFAULT_ALLOW = ['warn', 'error'];
const GLOBAL_OBJECTS = ['window', 'globalThis', 'self'];

const getPropertyName = (node) => {
  if (!node.computed && node.property.type === 'Identifier') return node.property.name;
  if (node.computed && node.property.type === 'Literal') return String(node.property.value);
  return null;
};

const isConsole = (node) =>
  (node.type === 'Identifier' && node.name === 'console') ||
  (node.type === 'MemberExpression' &&
    node.object.type === 'Identifier' &&
    GLOBAL_OBJECTS.includes(node.object.name) &&
    getPropertyName(node) === 'console');

export default {
  meta: {
    type: 'problem',
    schema: [
      {
        type: 'object',
        properties: { allow: { type: 'array', items: { type: 'string' } } },
        additionalProperties: false,
      },
    ],
    messages: {
      banned: '禁止使用 console.{{name}}',
    },
  },
  create(context) {
    const allow = new Set(context.options[0]?.allow ?? DEFAULT_ALLOW);

    return {
      // console.log(...)、window.console.log(...)
      MemberExpression(node) {
        if (!isConsole(node.object)) return;
        const name = getPropertyName(node);
        if (name === null || allow.has(name)) return;
        context.report({ node, messageId: 'banned', data: { name } });
      },
    };
  },
};
