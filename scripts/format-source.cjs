/* Development utility: deterministic TypeScript printer, no additional dependency. */
const fs=require('node:fs'),path=require('node:path');let ts;try{ts=require('typescript')}catch{ts=require('/usr/local/slides_js/node_modules/typescript')}
const root=path.resolve(__dirname,'..'),files=[];function walk(d){for(const f of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,f.name);if(f.isDirectory())walk(p);else if(/\.tsx?$/.test(p))files.push(p)}}walk(path.join(root,'src'));
const printer=ts.createPrinter({newLine:ts.NewLineKind.LineFeed});for(const f of files){const text=fs.readFileSync(f,'utf8');const ast=ts.createSourceFile(f,text,ts.ScriptTarget.Latest,true);fs.writeFileSync(f,printer.printFile(ast));}
console.log('Formatted '+files.length+' TypeScript modules.');
