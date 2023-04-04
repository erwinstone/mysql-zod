# mysql-zod

Generate Zod interfaces from MySQL database

## Installation

Install `mysql-zod` with npm

```bash
npm install mysql-zod --save-dev
```

## Usage/Examples

Create a file and fill it as follows (adjust to your needs):

```typescript
import { generate } from "mysql-zod/generator";

await generate({
  host: process.env.HOST,
  port: process.env.PORT,
  user: process.env.USER_NAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});
```

Create user table:

```sql
CREATE TABLE `user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `role` enum('admin','user') NOT NULL,
  PRIMARY KEY (`id`)
);
```

The above command will create a `user.ts` file with the following contents:

```typescript
import z from 'zod';

export const user = z.object({
  id: z.number().nonnegative(),
  name: z.string(),
  username: z.string(),
  password: z.string(),
  profile_picture: z.string().nullable(),
  role: z.enum(['admin', 'user']),
});

export type userType = z.infer<typeof user>;
```

## Config

```typescript
{
  "host": "127.0.0.1",
  "port": 3306,
  "user": "root",
  "password": "secret",
  "database": "myapp",
  "tables": ["user", "log"],
  "ignore": ["log"],
  "folder": "@zod",
  "suffix": "table",
  "camelCase": false,
  "nullish": false,
  "requiredString": false
}
```

| Option | Description |
| ------ | ----------- |
| tables | Filter the tables to include only those specified. |
| ignore | Filter the tables to exclude those specified. |
| folder | Specify the output directory. |
| suffix | Suffix to the name of a generated file. (eg: `user.table.ts`) |
| camelCase | Convert all table names and their properties to camelcase. (eg: `profile_picture` becomes `profilePicture`) |
| nullish | Set schema as `nullish` instead of `nullable` |
| requiredString | Add `min(1)` for string schema |
