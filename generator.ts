#!/usr/bin/env node
/* eslint-disable key-spacing */
/* eslint-disable no-case-declarations */
/* eslint-disable no-multi-spaces */

import path from 'path'
import fs from 'fs-extra'
import knex from 'knex'
import camelCase from 'camelcase'

// Cross platform clear console.
process.stdout.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H')

const isCamelCase =(config: Config)=> config.camelCase && config.camelCase === true
const isNullish =(config: Config)=> config.nullish && config.nullish === true
const isRequiredString =(config: Config)=>config.requiredString && config.requiredString === true

function getType(descType: Desc['Type'], descNull: Desc['Null'], config: Config) {
  const type        = descType.split('(')[0]
  const isNull      = descNull === 'YES'
  const string      = ['z.string()']
  const number      = ['z.number()']
  const nullable    = isNullish(config) ? 'nullish()' : 'nullable()'
  const nonnegative = 'nonnegative()'
  const min1        = 'min(1)'
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
      if (isNull)
        string.push(nullable)
      else if (isRequiredString(config))
        string.push(min1)
      return string.join('.')
    case 'tinyint':
    case 'smallint':
    case 'mediumint':
    case 'int':
    case 'bigint':
    case 'float':
    case 'double':
      const unsigned = descType.endsWith(' unsigned')
      if (unsigned)
        number.push(nonnegative)
      if (isNull)
        number.push(nullable)
      return number.join('.')
    case 'enum':
      const value = descType.replace('enum(', '').replace(')', '').replaceAll(',', ', ')
      return `z.enum([${value}])`
  }
}

export async function generate(config: Config) {
  const db = knex({
    client: 'mysql2',
    connection: {
      host    : config.host,
      port    : config.port,
      user    : config.user,
      password: config.password,
      database: config.database,
    },
  })

  const t = await db.raw('SELECT table_name as table_name FROM information_schema.tables WHERE table_schema = ?', [config.database])
  let tables = t[0].map((row: any) => row.table_name).filter((table: string) => !table.startsWith('knex_')).sort() as Tables

  if (config.tables && config.tables.length)
    tables = tables.filter(table => config.tables.includes(table))

  if (config.ignore && config.ignore.length)
    tables = tables.filter(table => !config.ignore.includes(table))

  for (let table of tables) {
    const d = await db.raw(`DESC ${table}`)
    const describes = d[0] as Desc[]
    if (isCamelCase(config))
      table = camelCase(table)
    let content = `import z from 'zod'

export const ${table} = z.object({`
    for (const desc of describes) {
      const field = isCamelCase(config) ? camelCase(desc.Field) : desc.Field
      const type = getType(desc.Type, desc.Null, config)
      content = `${content}
  ${field}: ${type},`
    }
    content = `${content}
})

export type ${camelCase(`${table}Type`)} = z.infer<typeof ${table}>
`
    const dir  = config.folder && config.folder !== '' ? config.folder : '.'
    const file = config.suffix && config.suffix !== '' ? `${table}.${config.suffix}.ts` : `${table}.ts`
    const dest = path.join(dir, file)
    console.log('Created:', dest)
    fs.outputFileSync(dest, content)
  }
  await db.destroy()
}

type Tables = string[]
interface Desc {
  Field: string
  Type: string
  Null: 'YES' | 'NO'
}
export interface Config {
  host: string
  port: number
  user: string
  password: string
  database: string
  tables?: string[]
  ignore?: string[]
  folder?: string
  suffix?: string
  camelCase?: boolean
  nullish?: boolean
  requiredString?: boolean
}
