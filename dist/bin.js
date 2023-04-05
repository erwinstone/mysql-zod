#!/usr/bin/env node
import e from"node:path";import r from"fs-extra";import{generate as n}from"./main.js";const o=r.readJSONSync(e.join(process.cwd(),"mysql-zod.json"));o.folder&&o.folder!==""&&r.emptyDirSync(o.folder),await n(o);
