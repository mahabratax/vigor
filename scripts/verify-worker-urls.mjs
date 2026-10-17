import { readFile, readdir, access } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import ts from 'typescript';

// Check the client-side constructor emitted by the actual multi-stage build.
// Executing only the worker body does not exercise URL resolution in its caller.
export async function verifyWorkerUrls(directory = 'dist/client') {
  const files = (await readdir(directory, { recursive: true })).filter((f) => f.endsWith('.js'));
  let verified = 0;
  const urls = [];
  for (const file of files) {
    const code = await readFile(join(directory, file), 'utf8');
    if (!code.includes('new Worker(')) continue;
    const ast = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const bindings = new Map();
    for (const statement of ast.statements) {
      if (ts.isVariableStatement(statement))
        for (const declaration of statement.declarationList.declarations)
          if (ts.isIdentifier(declaration.name) && declaration.initializer)
            bindings.set(declaration.name.text, declaration.initializer);
    }
    const constructors = [];
    function visit(node) {
      if (ts.isNewExpression(node) && node.expression.getText(ast) === 'Worker')
        constructors.push(node);
      ts.forEachChild(node, visit);
    }
    visit(ast);
    for (const constructor of constructors) {
      for (const page of [
        'https://vigor-greenhouse-aldi.brawnycoin1.chatgpt.site/',
        'https://preview.example.test/nested/path?tab=storage',
      ]) {
        const location = new URL(page);
        function evaluate(node, depth = 0) {
          assert(node && depth < 10, 'Cannot resolve emitted Worker URL.');
          if (ts.isStringLiteralLike(node)) return node.text;
          if (ts.isIdentifier(node) && bindings.has(node.text))
            return evaluate(bindings.get(node.text), depth + 1);
          if (ts.isPropertyAccessExpression(node)) {
            if (node.getText(ast) === 'window.location.origin') return location.origin;
            if (node.getText(ast) === 'window.location.href') return location.href;
          }
          if (ts.isNewExpression(node) && node.expression.getText(ast) === 'URL')
            return new URL(...node.arguments.map((arg) => evaluate(arg, depth + 1)));
          throw new Error(`Unverified Worker URL expression: ${node.getText(ast)}`);
        }
        const url = new URL(evaluate(constructor.arguments[0]), page);
        assert.equal(url.protocol, 'https:', `Worker uses a non-web URL in ${file}: ${url}`);
        assert.equal(
          url.origin,
          location.origin,
          `Worker must use the current Site origin: ${url}`,
        );
        assert.match(url.pathname, /\/_next\/static\/browser\.worker-[^/]+\.js$/);
        await access(join(directory, url.pathname));
        urls.push({ chunk: file, page, worker: url.href });
      }
      verified++;
    }
  }
  assert(verified > 0, 'No production Worker constructor was checked.');
  return urls;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]))
  console.log(JSON.stringify(await verifyWorkerUrls()));
