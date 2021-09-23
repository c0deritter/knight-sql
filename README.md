# Knight SQL by Coderitter

A data structure to create SQL queries. I behaves like a string concatenation tool with some SQL specific caveats.

## Related packages

Use [knight-orm](https://github.com/c0deritter/knight-orm) if you are looking for a more powerful solution to access a database.

## Install

`npm install knight-sql`

## Overview

### INSERT, SELECT, UPDATE, DELETE (ISUD)

```typescript
import sql from 'knight-sql'

sql.insertInto('table').value('name', 'Josa')
sql.select('*').from('table').where('id = 1')
sql.update('table').set('name', 'Sebastian').where('id = 1')
sql.deleteFrom('table').where('id = 1')
```

The parameter of `insertInto`, `update` and `deleteFrom` is just a string. You can input anything you like.

```typescript
sql.update('ONLY table AS t')
// UPDATE ONLY table AS t
```

The parameter of select is a list of strings that will be concatenated with seperating commas. Here, you also can input anything you like.

```typescript
sql.select('DISTINCT ON (a) a', 'b, c')
// SELECT DISTINCT ON (a) a, b, c
```

### Render to SQL and get values array

```typescript
let query = sql.select('*').from('table').where('id =', value(1))

// create MySQL string
query.mysql() == 'SELECT * FROM table WHERE id = ?'

// create PostgreSQL string
query.postgres() == 'SELECT * FROM table WHERE id = $1'

// get the values as an array
query.values() == [ 1 ]
```

### FROM

```typescript
// set a table
sql.select('*').from('table')

// add an alias
sql.select('*').from('table', 't')

// use an expression
sql.select('*').from('table t')
sql.select('*').from('table AS t')
```

### JOIN

```typescript
let query = sql.select('t1.id, t2.name').from('table1 t1').join('table2 t2', 't1.id = t2.table1Id')
let query = sql.select('t1.id, t2.name').from('table1 t1').join('table2', 't2', 't1.id = t2.table1Id')

query.sql() == 'SELECT t1.id, t2.name FROM table1 t1 JOIN table2 t2 ON t1.id = t2.table1Id'
```

```typescript
let query = sql.select('t1.id, t2.name').from('table1 t1').join('left', 'table2 t2', 't1.id = t2.table1Id')
let query = sql.select('t1.id, t2.name').from('table1 t1').join('left', 'table2', 't2', 't1.id = t2.table1Id')

query.sql() == 'SELECT t1.id, t2.name FROM table1 t1 LEFT JOIN table2 t2 ON t1.id = t2.table1Id'
```

### WHERE conditions

A where condition can contain any JavaScript value. The following sections describe what will happen.

#### Strings and numbers

A WHERE condition can be a list of strings or numbers that will be concatenated together.

```typescript
sql.select('*').from('table').where('id', '=', '1')
sql.select('*').from('table').where('id =', '1')
sql.select('*').from('table').where('id', '= 1')
sql.select('*').from('table').where('id = 1')
sql.select('*').from('table').where('id', '=', 1)
sql.select('*').from('table').where('id =', 1)

// all of these definitions yield the same result

query.mysql() == 'SELECT * FROM table WHERE id = 1'
query.postgres() == 'SELECT * FROM table WHERE id = 1'

query.values() == []
```

#### Values

You can also denote a value which will be replaced through a parameter token.

```typescript
sql.select('*').from('table').where('id =', value(1))

query.mysql() == 'SELECT * FROM table WHERE id = ?'
query.postgres() == 'SELECT * FROM table WHERE id = $1'

query.values() == [ 1 ]
```

#### Aliases

You can give aliases seperately and they will be concatenated to the next string without a space.

```typescript
sql.select('*').from('table AS t').where('t.', 'id =', value(1))

query.mysql() == 'SELECT * FROM table AS t WHERE t.id = ?'
query.postgres() == 'SELECT * FROM table AS t WHERE t.id = $1'

query.values() == [ 1 ]
```

#### IS NULL helpers

It will translate a JavaScript `null` value into the corresponding SQL representation.

```typescript
sql.select('*').from('table').where('id IS', null)

query.mysql() == 'SELECT * FROM table WHERE id IS NULL'
query.postgres() == 'SELECT * FROM table WHERE id IS NULL'

query.values() == []

// is also works if null is marked as a value

sql.select('*').from('table').where('id IS', value(null))

query.mysql() == 'SELECT * FROM table WHERE id IS NULL'
query.postgres() == 'SELECT * FROM table WHERE id IS NULL'

query.values() == [ null ]
```

It can even replace your operator if you were giving it separately. It works for `=`, `<>` and `!=`.

```typescript
sql.select('*').from('table').where('id', '=', null)
// SELECT * FROM table WHERE id IS NULL

sql.select('*').from('table').where('id', '!=', null)
// SELECT * FROM table WHERE id IS NOT NULL

sql.select('*').from('table').where('id', '<>', null)
// SELECT * FROM table WHERE id IS NOT NULL
```

#### IN helpers

It will translate an array into the corresponding SQL representation.

```typescript
sql.select('*').from('table').where('id IN', [1,2,3])

query.mysql() == 'SELECT * FROM table WHERE id IN (1, 2, 3)'
query.postgres() == 'SELECT * FROM table WHERE id IN (1, 2, 3)'

query.values() == []

// it also works if the array is marked as a value

sql.select('*').from('table').where('id IN', value([1,2,3]))

query.mysql() == 'SELECT * FROM table WHERE id IN (?, ?, ?)'
query.postgres() == 'SELECT * FROM table WHERE id IN ($1, $2, $3)'

query.values() == [ 1, 2, 3 ]
```

It can even replace your operator if you were giving it separately. It works for `=`, `<>` and `!=`.

```typescript
sql.select('*').from('table').where('id', '=', [1,2,3])
// SELECT * FROM table WHERE id IN (1, 2, 3)

sql.select('*').from('table').where('id', '!=', [1,2,3])
// SELECT * FROM table WHERE id NOT IN (1, 2, 3)

sql.select('*').from('table').where('id', '<>', [1,2,3])
// SELECT * FROM table WHERE id NOT IN (1, 2, 3)
```

#### AND, OR, XOR

You can easily add logical operators.

```typescript
sql.select('*').from('table').where('id > 10').and('id < 20')
sql.select('*').from('table').where('id > 10', 'AND', 'id < 20')
sql.select('*').from('table').where('id > 10 AND id < 20')

query.mysql() == 'SELECT * FROM table WHERE id > 10 AND id < 20'
query.postgres()) == 'SELECT * FROM table WHERE id > 10 AND id < 20'

query.values() == []
```

Another more complex example.

```typescript
sql.select('*').from('table')
  .where('age >', value(10))
  .and('(')
  .where('name LIKE', value('%ert%'))
  .or('name LIKE ', value('%tre%'))
  .where(')')

query.mysql() == 'SELECT * FROM table WHERE age > ? AND (name LIKE ? OR name LIKE ?)'
query.postgres()) == 'SELECT * FROM table WHERE age > $1 AND (name LIKE $2 OR name LIKE $3)'

query.values() == [ 10, '%ert%', '%tre%' ]
```

#### Sub queries

```typescript
sql.select('*').from('table')
  .where(
    'id =', 
    select('MAX(id)').from('table').where('age >', value(30)), 
    'AND name LIKE',
    value('%ert%')
  )

query.mysql() == 'SELECT * FROM table WHERE id = (SELECT MAX(id) FROM table WHERE age > ?) AND name LIKE ?'
query.postgres()) == 'SELECT * FROM table WHERE id = (SELECT MAX(id) FROM table WHERE age > $1) AND name LIKE $2'

query.values() == [ 30, '%ert%' ]
```

#### Any other value

Any other value like a `Date` will be replaced by a parameter token and is put into the array of values.

```typescript
let birthday = new Date(1982, 3, 28)
let query = sql.select('*').from('table').where('birthday =', birthday)

query.mysql() == 'SELECT * FROM table WHERE birthday = ?'
query.values() == [ birthday ]
```

### GROUP BY

```typescript
sql.select('*').from('table').groupBy('id', 'name, email')
// SELECT * FROM table GROUP BY id, name, email
```

The parameters for `groupBy` is just a list of strings that will be concatenated separated by a comma.

### ORDER BY, LIMIT, OFFSET

```typescript
sql.select('*').from('table').orderBy('id', 'name DESC', 'age, email ASC').limit(10).offset(100)
// SELECT * FROM table ORDER BY id, name DESC, age, email ASC LIMIT 10 OFFSET 100
```

The parameters for `orderBy` is just a list of strings that will be concatenated separated by a comma.

### RETURNING (Postgres)

```typescript
sql.select('*').from('table').returning('*')
// SELECT * FROM table RETURNING *
```
