#!/usr/bin/env node

import path from 'node:path'
import fs from 'fs-extra'
import { generate } from './main.js'

const config = fs.readJSONSync(path.join(process.cwd(), 'mysql-zod.json'))
if (config.folder && config.folder !== '')
  fs.emptyDirSync(config.folder)

await generate(config)
