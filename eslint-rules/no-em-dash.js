/**
 * no-em-dash - ESLint rule that disallows em dash characters.
 * Use a regular hyphen (-), comma, or colon instead.
 */

/** @type {import('eslint').Rule.RuleModule} */
export const noEmDash = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow em dash characters (\u2014) in strings, comments, and template literals',
    },
    messages: {
      noEmDash: 'Em dash (\u2014) is not allowed. Use a hyphen (-), comma, or colon instead.',
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    return {
      Program() {
        // Check all comments for em dashes
        for (const comment of sourceCode.getAllComments()) {
          const indices = findEmDashes(comment.value);
          for (const idx of indices) {
            context.report({
              loc: offsetToLoc(comment, idx + 2), // +2 for "//" or "/*" prefix
              messageId: 'noEmDash',
            });
          }
        }
      },

      Literal(node) {
        if (typeof node.value === 'string' && node.value.includes('\u2014')) {
          context.report({ node, messageId: 'noEmDash' });
        }
      },

      TemplateLiteral(node) {
        for (const quasi of node.quasis) {
          if (quasi.value.raw.includes('\u2014')) {
            context.report({ node: quasi, messageId: 'noEmDash' });
          }
        }
      },
    };
  },
};

/**
 * Find all indices of em dash in a string.
 */
function findEmDashes(str) {
  const indices = [];
  let i = str.indexOf('\u2014');
  while (i !== -1) {
    indices.push(i);
    i = str.indexOf('\u2014', i + 1);
  }
  return indices;
}

/**
 * Convert an offset within a comment to a loc object for reporting.
 */
function offsetToLoc(comment, offset) {
  return {
    start: {
      line: comment.loc.start.line,
      column: comment.loc.start.column + offset,
    },
    end: {
      line: comment.loc.start.line,
      column: comment.loc.start.column + offset + 1,
    },
  };
}
