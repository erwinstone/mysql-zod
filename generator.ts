#!/usr/bin/env node

/* eslint-disable no-case-declarations */
import path from 'path'
import fs from 'fs-extra'
import knex from 'knex'

// Cross platform clear console.
process.stdout.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H')

function getType(descType: Desc['Type'], descNull: Desc['Null']) {
  const type = descType.split('(')[0]
  const isNull = descNull === 'YES'
  switch (type) {
    case 'date':
    case 'datetime':
    case 'timestamp':
    case 'time':
    case 'year':
    case 'char':
    case 'varchar':
    case 'tinytext':
    case 'text':
    case 'mediumtext':
    case 'longtext':
    case 'json':
    case 'decimal':
      return isNull ? 'z.string().nullish()' : 'z.string()'
    case 'tinyint':
    case 'smallint':
    case 'mediumint':
    case 'int':
    case 'bigint':
    case 'float':
    case 'double':
      return isNull ? 'z.number().nullish()' : 'z.number()'
    case 'enum':
      const value = descType.replace('enum(', '').replace(')', '').replaceAll(',', ', ')
      return `z.enum([${value}])`
  }
}

const config = fs.readJSONSync(path.join(process.cwd(), 'mysql-zod.json')) as Config
if (config.folder && config.folder !== '')
  fs.emptyDirSync(config.folder)

async function generate(config: Config) {
  const db = knex({
    client: 'mysql2',
    connection: {
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
    },
  })

  const t = await db.raw('SELECT table_name FROM information_schema.tables WHERE table_schema = ?', [config.database])
  let tables = t[0].map((row: any) => row.table_name).filter((table: string) => !table.startsWith('knex_')).sort() as Tables

  if (config.tables && config.tables.length)
    tables = tables.filter(table => config.tables!.includes(table))

  if (config.ignore && config.ignore.length)
    tables = tables.filter(table => !config.ignore!.includes(table))

  for (const table of tables) {
    const d = await db.raw(`DESC ${table}`)
    const describes = d[0] as Desc[]
    let content = `import z from 'zod'

export const ${table} = z.object({`
    for (const desc of describes) {
      const field = desc.Field
      const type = getType(desc.Type, desc.Null)
      content = `${content}
  ${field}: ${type},`
    }
    content = `${content}
})
`
    const dir = config.folder && config.folder !== '' ? config.folder : '.'
    const file = config.suffix && config.suffix !== '' ? `${table}.${config.suffix}.ts` : `${table}.ts`
    const dest = path.join(dir, file)
    console.log('Created:', dest)
    fs.outputFileSync(dest, content)
  }
  await db.destroy()
}

(async () => {
  await generate(config)
})()

type Tables = string[]
interface Desc {
  Field: string
  Type: string
  Null: 'YES' | 'NO'
}
interface Config {
  host: string
  port: number
  user: string
  password: string
  database: string
  tables?: string[]
  ignore?: string[]
  folder?: string
  suffix?: string
}
