import { expect } from 'chai'
import 'mocha'
import sql, { value } from '../src'

describe('Query', function() {
  describe('MySql', function() {
    describe('INSERT INTO', function() {
      it('should create an insert into SQL statement', function() {
        let query = sql.insertInto('table')
        query.value('a', 'a')
        query.value('b', 'b')
        let sqlString = query.mysql()
        expect(sqlString).to.equal('INSERT INTO table (a, b) VALUES (?, ?)')
      })
    
      it('should create an insert into SQL statement for an empty row', function() {
        let query = sql.insertInto('table')
        let sqlString = query.mysql()
        expect(sqlString).to.equal('INSERT INTO table DEFAULT VALUES')
      })    
    })

    describe('SELECT', function() {
      it('should create a SELECT statement', function() {
        let query = sql.select('*').from('table')
        expect(query.mysql()).to.equal('SELECT * FROM table')
        expect(query.values()).to.deep.equal([])
      })

      it('should create a SELECT DISTINCT statement', function() {
        let query = sql.select('DISTINCT ON (a) a b c').from('table')
        expect(query.mysql()).to.equal('SELECT DISTINCT ON (a) a b c FROM table')
        expect(query.values()).to.deep.equal([])
      })

      it('should add a GROUP BY statement', function () {
        let query = sql.select('*').from('table').groupBy('column1', 'column2').orderBy('column1')
        expect(query.mysql()).to.deep.equal('SELECT * FROM table GROUP BY column1, column2 ORDER BY column1')
      })

      it('should add arbitrary conditions as having', function() {
        let query = sql.select('*').from('table').where('column1 >', value(1)).groupBy('column1', 'column2').having('MAX(column1) >', value(5)).orderBy('column1')
        expect(query.mysql()).to.equal('SELECT * FROM table WHERE column1 > ? GROUP BY column1, column2 HAVING MAX(column1) > ? ORDER BY column1')
        expect(query.values()).to.deep.equal([1,5])
      })

      it('should add an ORDER BY statement', function () {
        let query = sql.select('*').from('table').orderBy('column1', 'column2 ASC', 'column3, column4 DESC')
        expect(query.mysql()).to.deep.equal('SELECT * FROM table ORDER BY column1, column2 ASC, column3, column4 DESC')
      })
    })

    describe('DELETE FROM', function() {
      it('should create a DELETE FROM with the fine grained methods', function() {
        let query = sql.delete_().from('table')
        expect(query.mysql()).to.equal('DELETE FROM table')
      })

      it('should create a DELETE FROM with the shortcut method', function() {
        let query = sql.deleteFrom('table')
        expect(query.mysql()).to.equal('DELETE FROM table')
      })

      it('should create a DELETE table FROM', function() {
        let query = sql.delete_('table1').from('table2')
        expect(query.mysql()).to.equal('DELETE table1 FROM table2')
      })

      it('should create a DELETE USING', function() {
        let query = sql.deleteFrom('table1').using('table2', 'table3', 'table4, table5')
        expect(query.mysql()).to.equal('DELETE FROM table1 USING table2, table3, table4, table5')
      })
    })

    describe('WHERE', function() {
      it('should create a WHERE statement', function() {
        let query = sql.select('*').from('table').where('a =', value('a')).and('b >', value('b'))
        expect(query.mysql()).to.equal('SELECT * FROM table WHERE a = ? AND b > ?')
        expect(query.values()).to.deep.equal(['a','b'])
      })

      it('should create a WHERE statement connected through OR', function() {
        let query = sql.select('*').from('table').where('a =', value('a')).and('b >', value('b'))
        expect(query.mysql()).to.equal('SELECT * FROM table WHERE a = ? AND b > ?')
        expect(query.values()).to.deep.equal(['a','b'])
      })
    })
  })

  describe('PostgreSQL', function() {
    describe('INSERT INTO', function() {
      it('should create an insert into SQL statement', function() {
        let query = sql.insertInto('table')
        query.value('a', 'a')
        query.value('b', 'b')
        let sqlString = query.postgres()
        expect(sqlString).to.equal('INSERT INTO table (a, b) VALUES ($1, $2)')
      })
    
      it('should create an insert into SQL statement for an empty row', function() {
        let query = sql.insertInto('table')
        let sqlString = query.postgres()
        expect(sqlString).to.equal('INSERT INTO table DEFAULT VALUES')
      })    
    })

    describe('SELECT', function() {
      it('should create a select SQL statement without a where clause', function() {
        let query = sql.select('*').from('table')
        expect(query.postgres()).to.equal('SELECT * FROM table')
        expect(query.values()).to.deep.equal([])
      })

      it('should create a SELECT DISTINCT statement', function() {
        let query = sql.select('DISTINCT ON (a) a b c').from('table')
        expect(query.postgres()).to.equal('SELECT DISTINCT ON (a) a b c FROM table')
        expect(query.values()).to.deep.equal([])
      })

      it('should add a GROUP BY statement', function () {
        let query = sql.select('*').from('table').groupBy('column1', 'column2').orderBy('column1')
        expect(query.postgres()).to.deep.equal('SELECT * FROM table GROUP BY column1, column2 ORDER BY column1')
      })

      it('should add arbitrary conditions as having', function() {
        let query = sql.select('*').from('table').where('column1 >', value(1)).groupBy('column1', 'column2').having('MAX(column1) >', value(5)).orderBy('column1')
        expect(query.postgres()).to.equal('SELECT * FROM table WHERE column1 > $1 GROUP BY column1, column2 HAVING MAX(column1) > $2 ORDER BY column1')
        expect(query.values()).to.deep.equal([1,5])
      })

      it('should add an ORDER BY statement', function () {
        let query = sql.select('*').from('table').orderBy('column1', 'column2 ASC', 'column3, column4 DESC')
        expect(query.postgres()).to.deep.equal('SELECT * FROM table ORDER BY column1, column2 ASC, column3, column4 DESC')
      })
    })

    describe('DELETE FROM', function() {
      it('should create a DELETE FROM with the fine grained methods', function() {
        let query = sql.delete_().from('table')
        expect(query.postgres()).to.equal('DELETE FROM table')
      })

      it('should create a DELETE FROM with the shortcut method', function() {
        let query = sql.deleteFrom('table')
        expect(query.postgres()).to.equal('DELETE FROM table')
      })

      it('should create a DELETE table FROM', function() {
        let query = sql.delete_('table1').from('table2')
        expect(query.postgres()).to.equal('DELETE table1 FROM table2')
      })

      it('should create a DELETE USING', function() {
        let query = sql.deleteFrom('table1').using('table2', 'table3', 'table4, table5')
        expect(query.postgres()).to.equal('DELETE FROM table1 USING table2, table3, table4, table5')
      })
    })

    describe('WHERE', function() {
      it('should create a WHERE statement', function() {
        let query = sql.select('*').from('table').where('a =', value('a')).and('b >', value('b'))
        expect(query.postgres()).to.equal('SELECT * FROM table WHERE a = $1 AND b > $2')
        expect(query.values()).to.deep.equal(['a','b'])
      })

      it('should create a WHERE statement connected through OR', function() {
        let query = sql.select('*').from('table').where('a =', value('a')).and('b >', value('b'))
        expect(query.postgres()).to.equal('SELECT * FROM table WHERE a = $1 AND b > $2')
        expect(query.values()).to.deep.equal(['a','b'])
      })
    })
  })
})