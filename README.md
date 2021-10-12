# Knight SQL by Coderitter

A data structure to create SQL queries. It mainly concatenates given strings which can be combined with objects that do magic while being rendered to strings.

## Related packages

Use [knight-orm](https://github.com/c0deritter/knight-orm) if you are looking for a powerful solution to access a database.

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

### Condition

A condition is used for `WHERE` and `HAVING` clauses. It is basically an array which can contain value of any type. The following will happen.

- Strings and numbers are concatenated into the resulting SQL string
- An object of type `Query` will be surrounded with brackets to represent a sub query
- There can be objects following the `SqlPiece` interface which can to magic while rendering to SQL strings
- A `null` value is becoming an SQL `NULL`
- An array will be converted to `(value1, value2, ...)`
- An object of type `Value` will be replaced through a parameter token i.e. `?` for MySql
- Any other values like of type `Date` will also be replaced through a parameter token

#### Strings and numbers

A condition can be a list of strings or numbers that will be concatenated together.

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

#### SqlPiece

An object of type `SqlPiece` renders to SQL. It is used to do some magic while converting to an SQL string. 

Here is a simple example for a new class implemented by you.

```typescript
import sql, { ParameterTokens, SqlPiece } from 'knight-sql'

class MoreIntelligent extends SqlPiece {

  iq: number

  constructor(iq: number) {
    super()
    this.iq = iq
  }

  // return the SQL string which can include parameters
  abstract sql(db: string, parameterTokens: ParameterTokens = new ParameterTokens): string {
    return 'iq > ' + parameterToken.create(db)
  }
  
  // return the values for parameters contained in the SQL string
  abstract values(): any[] {
    return [ this.iq ]
  }
}
```

The class `ParameterTokens` creates a parameter token specific to the used database system. In the case of PostgreSQL it also keeps track of the last parameter index to create the parameter tokens like `$1`, `$2` and `$3`.

#### Comparison (SqlPiece)

The class `Comparison` helps in creating simple comparisons which follow the pattern `<column> <operator> <value>`.

```typescript
import { comparison } from `knight-sql`

let c1 = comparison('iq', 100)
c1.mysql() == 'iq = ?'
c1.values() == [ 100 ]

let c2 = comparison('iq', '>', 100)
c2.mysql() == 'iq > ?'
c2.values() == [ 100 ]
```

It will also help with `IS NULL` and `IS NOT NULL`.

```typescript
let c1 = comparison('iq', null)
c1.mysql() == 'iq IS NULL'
c1.values() == []

let c2 = comparison('iq', '=', null)
c2.mysql() == 'iq IS NULL'
c2.values() == []

let c3 = comparison('iq', '!=', null)
c3.mysql() == 'iq IS NOT NULL'
c3.values() == []

let c4 = comparison('iq', '<>', null)
c4.mysql() == 'iq IS NOT NULL'
c4.values() == []
```

And it will help with the `IN` operator.

```typescript
let c1 = comparison('iq', [ 100 ])
c1.mysql() == 'iq IN (?)'
c1.values() == [ 100 ]

let c2 = comparison('iq', '=', [ 100 ])
c2.mysql() == 'iq IN (?)'
c2.values() == [ 100 ]

let c3 = comparison('iq', '!=', [ 100 ])
c3.mysql() == 'iq NOT IN (?)'
c3.values() == []

let c4 = comparison('iq', '<>', [])
c4.mysql() == 'iq NOT IN (?)'
c4.values() == []

// in the case the array is empty, undefined or null,
// the value of the column is never inside the given set
let c5 = comparison('iq', '=', [])
c5.mysql() == '1 = 2'
c5.values() == []

// in the case the array is empty, undefined or null,
// the value of the column is never not inside the given set
let c5 = comparison('iq', '!=', [])
c5.mysql() == '1 = 1'
c5.values() == []
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

#### Arbitrary value

Arbitrary values like of type `Date` will be replaced by a parameter token and are put into the array of values.

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
