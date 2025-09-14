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

  describe("with async functions", () => {
    test("should preserve async keyword when converting to declarations", () => {
      ruleTester.run("func-style-async-to-declaration", funcStyleRule, {
        valid: [
          // Async function declarations should be valid
          {
            code: "async function fetchData() { return await fetch('/api'); }",
            options: ["declaration"],
          },
        ],
        invalid: [
          // Async function expression should convert to async declaration
          {
            code: "const fetchData = async function() { return await fetch('/api'); };",
            options: ["declaration"],
            errors: [{ messageId: "declaration" }],
            output:
              "async function fetchData() { return await fetch('/api'); }",
          },
          // Async arrow function should convert to async declaration
          {
            code: "const processAsync = async (data) => { return await processData(data); };",
            options: ["declaration", { allowArrowFunctions: false }],
            errors: [{ messageId: "declaration" }],
            output:
              "async function processAsync(data) { return await processData(data); }",
          },
          // Async arrow function with expression body
          {
            code: "const quickFetch = async (url) => await fetch(url);",
            options: ["declaration", { allowArrowFunctions: false }],
            errors: [{ messageId: "declaration" }],
            output:
              "async function quickFetch(url) {\n  return await fetch(url);\n}",
          },
          // Complex async arrow function with multiple statements
          {
            code: `const copyToClipboard = async (text) => {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
          };`,
            options: ["declaration", { allowArrowFunctions: false }],
            errors: [{ messageId: "declaration" }],
            output: `async function copyToClipboard(text) {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
          }`,
          },
          // Exported async function expression
          {
            code: "export const apiCall = async function(endpoint) { return await fetch(endpoint); };",
            options: [
              "declaration",
              { overrides: { namedExports: "declaration" } },
            ],
            errors: [{ messageId: "declaration" }],
            output:
              "export async function apiCall(endpoint) { return await fetch(endpoint); }",
          },
        ],
      });
    });

    test("should preserve async keyword when converting to expressions", () => {
      ruleTester.run("func-style-async-to-expression", funcStyleRule, {
        valid: [
          // Async function expressions should be valid
          {
            code: "const fetchData = async function() { return await fetch('/api'); };",
            options: ["expression"],
          },
        ],
        invalid: [
          // Async function declaration should convert to async expression
          {
            code: "async function fetchData() { return await fetch('/api'); }",
            options: ["expression"],
            errors: [{ messageId: "expression" }],
            output:
              "const fetchData = async function() { return await fetch('/api'); }",
          },
          // Complex async function declaration
          {
            code: `async function processData(data) {
            const result = await transformData(data);
            return result.filter(item => item.valid);
          }`,
            options: ["expression"],
            errors: [{ messageId: "expression" }],
            output: `const processData = async function(data) {
            const result = await transformData(data);
            return result.filter(item => item.valid);
          }`,
          },
          // Exported async function declaration with override
          {
            code: "export async function saveData(data) { return await database.save(data); }",
            options: [
              "expression",
              { overrides: { namedExports: "expression" } },
            ],
            errors: [{ messageId: "expression" }],
            output:
              "export const saveData = async function(data) { return await database.save(data); }",
          },
        ],
      });
    });

    test("should handle async functions with TypeScript types", () => {
      ruleTester.run("func-style-async-typescript", funcStyleRule, {
        valid: [
          // Async function declarations with types should be valid
          {
            code: "async function fetchUser(id: string): Promise<User> { return await api.getUser(id); }",
            options: ["declaration"],
          },
        ],
        invalid: [
          // Async function expression with types
          {
            code: "const fetchUser = async function(id: string): Promise<User> { return await api.getUser(id); };",
            options: ["declaration"],
            errors: [{ messageId: "declaration" }],
            output:
              "async function fetchUser(id: string): Promise<User> { return await api.getUser(id); }",
          },
          // Async arrow function with types
          {
            code: "const createUser = async (data: UserData): Promise<User> => await userService.create(data);",
            options: ["declaration", { allowArrowFunctions: false }],
            errors: [{ messageId: "declaration" }],
            output:
              "async function createUser(data: UserData): Promise<User> {\n  return await userService.create(data);\n}",
          },
          // Convert async declaration to expression with types
          {
            code: "async function updateUser(id: string, data: Partial<User>): Promise<User> { return await api.updateUser(id, data); }",
            options: ["expression"],
            errors: [{ messageId: "expression" }],
            output:
              "const updateUser = async function(id: string, data: Partial<User>): Promise<User> { return await api.updateUser(id, data); }",
          },
        ],
      });
    });

    test("should handle async functions with generics", () => {
      ruleTester.run("func-style-async-generics", funcStyleRule, {
        valid: [
          // Async generic function declarations should be valid
          {
            code: "async function fetchData<T>(url: string): Promise<T> { return await fetch(url).then(r => r.json()); }",
            options: ["declaration"],
          },
        ],
        invalid: [
          // Async generic function expression
          {
            code: "const fetchData = async function<T>(url: string): Promise<T> { return await fetch(url).then(r => r.json()); };",
            options: ["declaration"],
            errors: [{ messageId: "declaration" }],
            output:
              "async function fetchData<T>(url: string): Promise<T> { return await fetch(url).then(r => r.json()); }",
          },
          // Async generic arrow function
          {
            code: "const processItems = async <T>(items: T[], processor: (item: T) => Promise<T>): Promise<T[]> => Promise.all(items.map(processor));",
            options: ["declaration", { allowArrowFunctions: false }],
            errors: [{ messageId: "declaration" }],
            output:
              "async function processItems<T>(items: T[], processor: (item: T) => Promise<T>): Promise<T[]> {\n  return Promise.all(items.map(processor));\n}",
          },
          // Convert async generic declaration to expression
          {
            code: "async function transform<T, U>(data: T, transformer: (input: T) => Promise<U>): Promise<U> { return await transformer(data); }",
            options: ["expression"],
            errors: [{ messageId: "expression" }],
            output:
              "const transform = async function<T, U>(data: T, transformer: (input: T) => Promise<U>): Promise<U> { return await transformer(data); }",
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
