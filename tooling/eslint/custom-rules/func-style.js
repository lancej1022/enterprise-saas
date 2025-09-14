// vibe coded with claude but this seems to work great

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    dialects: ["javascript", "typescript"],
    language: "javascript",
    type: "layout",
    fixable: "code",

    defaultOptions: [
      "expression",
      {
        allowArrowFunctions: false,
        allowTypeAnnotation: false,
        overrides: {},
      },
    ],

    docs: {
      description:
        "Enforce the consistent use of either `function` declarations or expressions assigned to variables",
      recommended: false,
      frozen: true,
      url: "https://eslint.org/docs/latest/rules/func-style",
    },

    schema: [
      {
        enum: ["declaration", "expression"],
      },
      {
        type: "object",
        properties: {
          allowArrowFunctions: {
            type: "boolean",
          },
          allowTypeAnnotation: {
            type: "boolean",
          },
          overrides: {
            type: "object",
            properties: {
              namedExports: {
                enum: ["declaration", "expression", "ignore"],
              },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
    ],

    messages: {
      expression: "Expected a function expression.",
      declaration: "Expected a function declaration.",
    },
  },

  create(context) {
    const [style, { allowArrowFunctions, allowTypeAnnotation, overrides }] =
      context.options;
    const enforceDeclarations = style === "declaration";
    const { namedExports: exportFunctionStyle } = overrides;
    /** @type {boolean[]} */
    const stack = [];

    /**
     * Checks if a function declaration is part of an overloaded function
     * @param {any} node The function declaration node to check
     * @returns {boolean} True if the function is overloaded
     */
    function isOverloadedFunction(node) {
      const functionName = node.id.name;

      if (node.parent.type === "ExportNamedDeclaration") {
        return node.parent.parent.body.some(
          (/** @type {any} */ member) =>
            member.type === "ExportNamedDeclaration" &&
            member.declaration?.type === "TSDeclareFunction" &&
            member.declaration.id.name === functionName,
        );
      }

      if (node.parent.type === "SwitchCase") {
        return node.parent.parent.cases.some((/** @type {any} */ switchCase) =>
          switchCase.consequent.some(
            (/** @type {any} */ member) =>
              member.type === "TSDeclareFunction" &&
              member.id.name === functionName,
          ),
        );
      }

      return (
        Array.isArray(node.parent.body) &&
        node.parent.body.some(
          (/** @type {any} */ member) =>
            member.type === "TSDeclareFunction" &&
            member.id.name === functionName,
        )
      );
    }

    /**
     * Creates autofix to convert function expression to function declaration
     * @param {any} fixer
     * @param {any} variableDeclarator
     * @param {any} functionNode
     * @returns {any}
     */
    function fixToDeclaration(fixer, variableDeclarator, functionNode) {
      const sourceCode = context.getSourceCode();
      const variableDeclaration = variableDeclarator.parent;
      const functionName = variableDeclarator.id.name;

      const isAsync = functionNode.async || false;
      const asyncKeyword = isAsync ? "async " : "";

      // Get generic type parameters if present
      const typeParameters = functionNode.typeParameters
        ? sourceCode.getText(functionNode.typeParameters)
        : "";

      // Get function parameters
      const params = functionNode.params
        .map((/** @type {any} */ param) => sourceCode.getText(param))
        .join(", ");

      // Get function body - handle both block statements and expression bodies
      let bodyText;
      if (functionNode.body.type === "BlockStatement") {
        bodyText = sourceCode.getText(functionNode.body);
      } else {
        // Arrow function with expression body
        bodyText = `{\n  return ${sourceCode.getText(functionNode.body)};\n}`;
      }

      // Get return type annotation if present
      const returnType = functionNode.returnType
        ? sourceCode.getText(functionNode.returnType)
        : "";

      // Construct the function declaration
      const functionDeclaration = `${asyncKeyword}function ${functionName}${typeParameters}(${params})${returnType} ${bodyText}`;

      return fixer.replaceText(variableDeclaration, functionDeclaration);
    }

    /**
     * Creates autofix to convert function declaration to function expression
     * @param {any} fixer
     * @param {any} functionDeclaration
     * @returns {any}
     */
    function fixToExpression(fixer, functionDeclaration) {
      const sourceCode = context.getSourceCode();
      const functionName = functionDeclaration.id.name;

      const isAsync = functionDeclaration.async || false;
      const asyncKeyword = isAsync ? "async " : "";

      // Get generic type parameters if present
      const typeParameters = functionDeclaration.typeParameters
        ? sourceCode.getText(functionDeclaration.typeParameters)
        : "";

      const params = functionDeclaration.params
        .map((/** @type {any} */ param) => sourceCode.getText(param))
        .join(", ");
      const body = sourceCode.getText(functionDeclaration.body);

      // Get return type annotation if present
      const returnType = functionDeclaration.returnType
        ? sourceCode.getText(functionDeclaration.returnType)
        : "";

      const functionExpression = `const ${functionName} = ${asyncKeyword}function${typeParameters}(${params})${returnType} ${body}`;

      return fixer.replaceText(functionDeclaration, functionExpression);
    }

    /** @type {any} */
    const nodesToCheck = {
      FunctionDeclaration(/** @type {any} */ node) {
        stack.push(false);

        if (
          !enforceDeclarations &&
          node.parent.type !== "ExportDefaultDeclaration" &&
          (typeof exportFunctionStyle === "undefined" ||
            node.parent.type !== "ExportNamedDeclaration") &&
          !isOverloadedFunction(node)
        ) {
          context.report({
            node,
            messageId: "expression",
            fix: (fixer) => fixToExpression(fixer, node),
          });
        }

        if (
          node.parent.type === "ExportNamedDeclaration" &&
          exportFunctionStyle === "expression" &&
          !isOverloadedFunction(node)
        ) {
          context.report({
            node,
            messageId: "expression",
            fix: (fixer) => fixToExpression(fixer, node),
          });
        }
      },
      "FunctionDeclaration:exit"() {
        stack.pop();
      },

      FunctionExpression(/** @type {any} */ node) {
        stack.push(false);

        if (
          enforceDeclarations &&
          node.parent.type === "VariableDeclarator" &&
          (typeof exportFunctionStyle === "undefined" ||
            node.parent.parent.parent.type !== "ExportNamedDeclaration") &&
          !(
            allowTypeAnnotation &&
            /** @type {any} */ node.parent.id.typeAnnotation
          )
        ) {
          context.report({
            node: node.parent,
            messageId: "declaration",
            fix: (fixer) => fixToDeclaration(fixer, node.parent, node),
          });
        }

        if (
          node.parent.type === "VariableDeclarator" &&
          node.parent.parent.parent.type === "ExportNamedDeclaration" &&
          exportFunctionStyle === "declaration" &&
          !(
            allowTypeAnnotation &&
            /** @type {any} */ node.parent.id.typeAnnotation
          )
        ) {
          context.report({
            node: node.parent,
            messageId: "declaration",
            fix: (fixer) => fixToDeclaration(fixer, node.parent, node),
          });
        }
      },
      "FunctionExpression:exit"() {
        stack.pop();
      },

      "ThisExpression, Super"() {
        if (stack.length > 0) {
          stack[stack.length - 1] = true;
        }
      },
    };

    if (!allowArrowFunctions) {
      nodesToCheck.ArrowFunctionExpression = function () {
        stack.push(false);
      };

      nodesToCheck["ArrowFunctionExpression:exit"] = function (
        /** @type {any} */ node,
      ) {
        const hasThisOrSuperExpr = stack.pop();

        if (!hasThisOrSuperExpr && node.parent.type === "VariableDeclarator") {
          if (
            enforceDeclarations &&
            (typeof exportFunctionStyle === "undefined" ||
              node.parent.parent.parent.type !== "ExportNamedDeclaration") &&
            !(
              allowTypeAnnotation &&
              /** @type {any} */ node.parent.id.typeAnnotation
            )
          ) {
            context.report({
              node: node.parent,
              messageId: "declaration",
              fix: (fixer) => fixToDeclaration(fixer, node.parent, node),
            });
          }

          if (
            node.parent.parent.parent.type === "ExportNamedDeclaration" &&
            exportFunctionStyle === "declaration" &&
            !(
              allowTypeAnnotation &&
              /** @type {any} */ node.parent.id.typeAnnotation
            )
          ) {
            context.report({
              node: node.parent,
              messageId: "declaration",
              fix: (fixer) => fixToDeclaration(fixer, node.parent, node),
            });
          }
        }
      };
    }

    return nodesToCheck;
  },
};
