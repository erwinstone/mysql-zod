#!/usr/bin/env node
import f from"path";import c from"fs-extra";import x from"knex";import b from"camelcase";process.stdout.write(process.platform==="win32"?"\x1B[2J\x1B[0f":"\x1B[2J\x1B[3J\x1B[H");const a=c.readJSONSync(f.join(process.cwd(),"mysql-zod.json"));a.folder&&a.folder!==""&&c.emptyDirSync(a.folder);const h=a.camelCase&&a.camelCase===!0,w=a.nullish&&a.nullish===!0;function C(e,r){const u=e.split("(")[0],t=r==="YES",s=["z.string()"],i=["z.number()"],l=w?"nullish()":"nullable()",n="nonnegative()";switch(u){case"date":case"datetime":case"timestamp":case"time":case"year":case"char":case"varchar":case"tinytext":case"text":case"mediumtext":case"longtext":case"json":case"decimal":return t&&s.push(l),s.join(".");case"tinyint":case"smallint":case"mediumint":case"int":case"bigint":case"float":case"double":return e.endsWith(" unsigned")&&i.push(n),t&&i.push(l),i.join(".");case"enum":return`z.enum([${e.replace("enum(","").replace(")","").replaceAll(",",", ")}])`}}async function $(e){const r=x({client:"mysql2",connection:{host:e.host,port:e.port,user:e.user,password:e.password,database:e.database}});let t=(await r.raw("SELECT table_name FROM information_schema.tables WHERE table_schema = ?",[e.database]))[0].map(s=>s.table_name).filter(s=>!s.startsWith("knex_")).sort();e.tables&&e.tables.length&&(t=t.filter(s=>e.tables.includes(s))),e.ignore&&e.ignore.length&&(t=t.filter(s=>!e.ignore.includes(s)));for(let s of t){const l=(await r.raw(`DESC ${s}`))[0];h&&(s=b(s));let n=`import z from 'zod'

export const ${s} = z.object({`;for(const o of l){const y=h?b(o.Field):o.Field,g=C(o.Type,o.Null);n=`${n}
  ${y}: ${g},`}n=`${n}

})

export type ${s}Type = z.infer<typeof ${s}>
`;const d=e.folder&&e.folder!==""?e.folder:".",m=e.suffix&&e.suffix!==""?`${s}.${e.suffix}.ts`:`${s}.ts`,p=f.join(d,m);console.log("Created:",p),c.outputFileSync(p,n)}await r.destroy()}(async()=>await $(a))();
