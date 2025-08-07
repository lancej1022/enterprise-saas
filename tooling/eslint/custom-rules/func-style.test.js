// vibe coded with claude

import { describe, test } from "node:test";
import * as tsParser from "@typescript-eslint/parser";
import { RuleTester } from "eslint";

import funcStyleRule from "./func-style.js";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    parser: tsParser,
    parserOptions: {
      ecmaFeatures: {
        jsx: false,
      },
    },
  },
});

describe("func-style rule", () => {
  describe('with "declaration" style', () => {
    test("should enforce function declarations", () => {
      ruleTester.run("func-style-declaration", funcStyleRule, {
        valid: [
          // Function declarations should be valid
          {
            code: "function foo() { return true; }",
            options: ["declaration"],
          },
          {
            code: "function foo(a, b) { return a + b; }",
            options: ["declaration"],
          },
          // Export default declarations should be allowed
          {
            code: "export default function foo() { return true; }",
            options: ["declaration"],
          },

          // Arrow functions when allowArrowFunctions is true
          {
            code: "const foo = (a, b) => a + b;",
            options: ["declaration", { allowArrowFunctions: true }],
          },
        ],
        invalid: [
          // Function expressions should trigger error and be auto-fixable
          {
            code: "const foo = function() { return true; };",
            options: ["declaration"],
            errors: [{ messageId: "declaration" }],
            output: "function foo() { return true; }",
          },
          {
            code: "const add = function(a, b) { return a + b; };",
            options: ["declaration"],
            errors: [{ messageId: "declaration" }],
            output: "function add(a, b) { return a + b; }",
          },
          // Arrow functions should trigger error and be auto-fixable
          {
            code: "const multiply = (x, y) => x * y;",
            options: ["declaration", { allowArrowFunctions: false }],
            errors: [{ messageId: "declaration" }],
            output: "function multiply(x, y) {\n  return x * y;\n}",
          },
          {
            code: "const greet = (name) => { console.log(`Hello ${name}`); };",
            options: ["declaration", { allowArrowFunctions: false }],
            errors: [{ messageId: "declaration" }],
            output: "function greet(name) { console.log(`Hello ${name}`); }",
          },
          // Complex arrow function with multiple statements
          {
            code: `const processData = (data) => {
            const processed = data.map(x => x * 2);
            return processed.filter(x => x > 10);
          };`,
            options: ["declaration", { allowArrowFunctions: false }],
            errors: [{ messageId: "declaration" }],
            output: `function processData(data) {
            const processed = data.map(x => x * 2);
            return processed.filter(x => x > 10);
          }`,
          },
          // Exported function expressions
          {
            code: "export const helper = function(data) { return data.length; };",
            options: [
              "declaration",
              { overrides: { namedExports: "declaration" } },
            ],
            errors: [{ messageId: "declaration" }],
            output: "export function helper(data) { return data.length; }",
          },
          // Simple function expression
          {
            code: "const calculate = function(a, b) { return a + b; };",
            options: ["declaration"],
            errors: [{ messageId: "declaration" }],
            output: "function calculate(a, b) { return a + b; }",
          },
        ],
      });
    });
  });

  describe('with "expression" style', () => {
    test("should enforce function expressions", () => {
      ruleTester.run("func-style-expression", funcStyleRule, {
        valid: [
          // Function expressions should be valid
          {
            code: "const foo = function() { return true; };",
            options: ["expression"],
          },
          {
            code: "const add = function(a, b) { return a + b; };",
            options: ["expression"],
          },
          // Arrow functions should be valid when allowArrowFunctions is true
          {
            code: "const multiply = (x, y) => x * y;",
            options: ["expression", { allowArrowFunctions: true }],
          },
          // Export default should be allowed
          {
            code: "export default function foo() { return true; }",
            options: ["expression"],
          },
        ],
        invalid: [
          // Function declarations should trigger error and be auto-fixable
          {
            code: "function foo() { return true; }",
            options: ["expression"],
            errors: [{ messageId: "expression" }],
            output: "const foo = function() { return true; }",
          },
          {
            code: "function calculate(a, b) { return a + b; }",
            options: ["expression"],
            errors: [{ messageId: "expression" }],
            output: "const calculate = function(a, b) { return a + b; }",
          },
          // Complex function with multiple parameters
          {
            code: `function processArray(arr, callback, options) {
            return arr.map(callback).filter(options.filter);
          }`,
            options: ["expression"],
            errors: [{ messageId: "expression" }],
            output: `const processArray = function(arr, callback, options) {
            return arr.map(callback).filter(options.filter);
          }`,
          },
          // Exported function declarations when override is set
          {
            code: "export function utility(data) { return data.reverse(); }",
            options: [
              "expression",
              { overrides: { namedExports: "expression" } },
            ],
            errors: [{ messageId: "expression" }],
            output:
              "export const utility = function(data) { return data.reverse(); }",
          },
        ],
      });
    });
  });

  describe("edge cases", () => {
    test("should handle edge cases correctly", () => {
      ruleTester.run("func-style-edge-cases", funcStyleRule, {
        valid: [
          // Immediately invoked function expressions (IIFE)
          {
            code: '(function() { console.log("IIFE"); })();',
            options: ["declaration"],
          },
          // Function as method
          {
            code: `const obj = {
            method: function() { return true; }
          };`,
            options: ["declaration"],
          },
          // Callback functions
          {
            code: "array.map(function(item) { return item * 2; });",
            options: ["declaration"],
          },
          // Functions with complex parameters
          {
            code: "function destructure({a, b = 5}, ...rest) { return a + b + rest.length; }",
            options: ["declaration"],
          },
        ],
        invalid: [
          // Multiple variable declarations
          {
            code: "const a = 1, func = function() { return true; }, b = 2;",
            options: ["declaration"],
            errors: [{ messageId: "declaration" }],
            output: "function func() { return true; }",
          },
          // Arrow function with destructuring
          {
            code: "const extract = ({name, age}) => ({ name, age });",
            options: ["declaration", { allowArrowFunctions: false }],
            errors: [{ messageId: "declaration" }],
            output:
              "function extract({name, age}) {\n  return { name, age };\n}",
          },
          // Arrow function with default parameters
          {
            code: 'const greet = (name = "World") => `Hello ${name}!`;',
            options: ["declaration", { allowArrowFunctions: false }],
            errors: [{ messageId: "declaration" }],
            output:
              'function greet(name = "World") {\n  return `Hello ${name}!`;\n}',
          },
        ],
      });
    });
  });

  describe("with overrides", () => {
    test("should respect override configurations", () => {
      ruleTester.run("func-style-overrides", funcStyleRule, {
        valid: [
          // Named export should ignore rule when override is 'ignore'
          {
            code: "export function helper() { return true; }",
            options: ["expression", { overrides: { namedExports: "ignore" } }],
          },
          {
            code: "export const helper = function() { return true; };",
            options: ["declaration", { overrides: { namedExports: "ignore" } }],
          },
        ],
        invalid: [
          // Named export should follow override rule
          {
            code: "export function helper() { return true; }",
            options: [
              "declaration",
              { overrides: { namedExports: "expression" } },
            ],
            errors: [{ messageId: "expression" }],
            output: "export const helper = function() { return true; }",
          },
          {
            code: "export const helper = function() { return true; };",
            options: [
              "expression",
              { overrides: { namedExports: "declaration" } },
            ],
            errors: [{ messageId: "declaration" }],
            output: "export function helper() { return true; }",
          },
        ],
      });
    });
  });

  describe("with allowTypeAnnotation option", () => {
    test("should handle allowTypeAnnotation correctly", () => {
      ruleTester.run("func-style-type-annotations", funcStyleRule, {
        valid: [
          // Basic function expressions should be valid when testing this option
          {
            code: 'const callback = function() { console.log("callback"); };',
            options: ["expression", { allowTypeAnnotation: true }],
          },
        ],
        invalid: [
          // Function expressions should still trigger error when allowTypeAnnotation doesn't apply
          {
            code: "const untyped = function(x) { return x * 2; };",
            options: ["declaration", { allowTypeAnnotation: true }],
            errors: [{ messageId: "declaration" }],
            output: "function untyped(x) { return x * 2; }",
          },
        ],
      });
    });
  });

  describe("with TypeScript generic type parameters", () => {
    test("should preserve generics when converting to declarations", () => {
      ruleTester.run("func-style-generics-to-declaration", funcStyleRule, {
        valid: [
          // Generic function declarations should be valid
          {
            code: "function identity<T>(arg: T): T { return arg; }",
            options: ["declaration"],
          },
        ],
        invalid: [
          // Simple generic function expression
          {
            code: "const identity = function<T>(arg: T): T { return arg; };",
            options: ["declaration"],
            errors: [{ messageId: "declaration" }],
            output: "function identity<T>(arg: T): T { return arg; }",
          },
          // Generic arrow function with single type parameter
          {
            code: "const map = <T, U>(items: T[], fn: (item: T) => U): U[] => items.map(fn);",
            options: ["declaration", { allowArrowFunctions: false }],
            errors: [{ messageId: "declaration" }],
            output:
              "function map<T, U>(items: T[], fn: (item: T) => U): U[] {\n  return items.map(fn);\n}",
          },
          // Complex generic with constraints and defaults (like the FormField example)
          {
            code: `const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return props;
};`,
            options: ["declaration", { allowArrowFunctions: false }],
            errors: [{ messageId: "declaration" }],
            output: `function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) {
  return props;
}`,
          },
          // Multiple type parameters with constraints
          {
            code: "const compare = <T extends string | number, U extends T>(a: T, b: U): boolean => a === b;",
            options: ["declaration", { allowArrowFunctions: false }],
            errors: [{ messageId: "declaration" }],
            output:
              "function compare<T extends string | number, U extends T>(a: T, b: U): boolean {\n  return a === b;\n}",
          },
        ],
      });
    });

    test("should preserve generics when converting to expressions", () => {
      ruleTester.run("func-style-generics-to-expression", funcStyleRule, {
        valid: [
          // Generic function expressions should be valid
          {
            code: "const identity = function<T>(arg: T): T { return arg; };",
            options: ["expression"],
          },
        ],
        invalid: [
          // Simple generic function declaration
          {
            code: "function identity<T>(arg: T): T { return arg; }",
            options: ["expression"],
            errors: [{ messageId: "expression" }],
            output: "const identity = function<T>(arg: T): T { return arg; }",
          },
          // Generic function with multiple type parameters
          {
            code: "function merge<T, U>(obj1: T, obj2: U): T & U { return { ...obj1, ...obj2 }; }",
            options: ["expression"],
            errors: [{ messageId: "expression" }],
            output:
              "const merge = function<T, U>(obj1: T, obj2: U): T & U { return { ...obj1, ...obj2 }; }",
          },
          // Complex generic with multiline parameters
          {
            code: `function createComponent<
  TProps extends Record<string, any>,
  TState = {}
>(initialProps: TProps, initialState?: TState) {
  return { props: initialProps, state: initialState };
}`,
            options: ["expression"],
            errors: [{ messageId: "expression" }],
            output: `const createComponent = function<
  TProps extends Record<string, any>,
  TState = {}
>(initialProps: TProps, initialState?: TState) {
  return { props: initialProps, state: initialState };
}`,
          },
        ],
      });
    });

    test("should handle generics with named exports", () => {
      ruleTester.run("func-style-generics-named-exports", funcStyleRule, {
        valid: [
          // Ignore when override is set to ignore
          {
            code: "export function helper<T>(data: T): T { return data; }",
            options: ["expression", { overrides: { namedExports: "ignore" } }],
          },
        ],
        invalid: [
          // Convert exported generic function declaration to expression
          {
            code: "export function utility<T extends string>(data: T): T { return data.toUpperCase() as T; }",
            options: [
              "expression",
              { overrides: { namedExports: "expression" } },
            ],
            errors: [{ messageId: "expression" }],
            output:
              "export const utility = function<T extends string>(data: T): T { return data.toUpperCase() as T; }",
          },
          // Convert exported generic function expression to declaration
          {
            code: "export const processor = function<T, U>(input: T, transform: (val: T) => U): U { return transform(input); };",
            options: [
              "declaration",
              { overrides: { namedExports: "declaration" } },
            ],
            errors: [{ messageId: "declaration" }],
            output:
              "export function processor<T, U>(input: T, transform: (val: T) => U): U { return transform(input); }",
          },
        ],
      });
    });
  });
});
