# mysql-zod

Generate Zod interfaces from MySQL database

## Installation

Install `mysql-zod` with npm

```bash
npm install mysql-zod --save-dev
```

## Usage/Examples

Create a file named `mysql-zod.json` and fill it as follows (adjust to your needs):

```json
{
  "host": "127.0.0.1",
  "port": 3306,
  "user": "root",
  "password": "secret",
  "database": "myapp"
}
```

Create User table:

```sql
CREATE TABLE `User` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `profilePicture` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
);
```
Then run the command:

```bash
npx mysql-zod
```

The above command will create a `User.ts` file with the following contents:

```typescript
import z from 'zod'

export const User = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  password: z.string(),
  profilePicture: z.string().nullish(),
})
```
## Config

`mysql-zod.json`
```json
{
  "host": "127.0.0.1",
  "port": 3306,
  "user": "root",
  "password": "secret",
  "database": "myapp",
  "tables": ["User", "Log"],
  "ignore": ["Log"],
  "folder": "@zod",
  "suffix": "table"
}
```

| Option | Description |
| ------ | ----------- |
| tables | Filter the tables to include only those specified. |
| ignore | Filter the tables to exclude those specified. |
| folder | Specify the output directory. |
| suffix | Suffix to the name of a generated file. (eg: `User.table.ts`) |
