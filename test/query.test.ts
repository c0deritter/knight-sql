import { expect } from 'chai'
import 'mocha'
import sql, { value } from '../src'

describe('Query', function() {
  describe('select', function() {
    it('should select a single column', function() {
      let query = sql.select('column')
      expect(query._selects.length).to.equal(1)
      expect(query._selects[0]).to.equal('column')
    })
  
    it('should select a single column with an alias', function() {
      let query = sql.select('column', 'c')
      expect(query._selects.length).to.equal(1)
      expect(query._selects[0]).to.equal('column c')
    })
  
    it('should select an expresssion', function() {
      let query = sql.select('column c')
      expect(query._selects.length).to.equal(1)
      expect(query._selects[0]).to.equal('column c')
    })
  })

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
      it('should create a select SQL statement', function() {
        let query = sql.select('*').from('table').where('a =', value('a')).and('b >', value('b'))
        expect(query.mysql()).to.equal('SELECT * FROM table WHERE a = ? AND b > ?')
        expect(query.values()).to.deep.equal(['a','b'])
      })

      it('should create a select SQL statement connected through OR', function() {
        let query = sql.select('*').from('table').where('a =', value('a')).and('b >', value('b'))
        expect(query.mysql()).to.equal('SELECT * FROM table WHERE a = ? AND b > ?')
        expect(query.values()).to.deep.equal(['a','b'])
      })

      it('should create a select SQL statement without a where clause', function() {
        let query = sql.select('*').from('table')
        expect(query.mysql()).to.equal('SELECT * FROM table')
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
    })

    describe('USING', function() {
      it('should accept arbitrary many using statements', function() {
        let query = sql.deleteFrom('table1').using('table2', 'table3')
        expect(query.mysql()).to.equal('DELETE FROM table1 USING table2, table3')
      })

      it('should accept a statement containing comma separated using statements', function() {
        let query = sql.deleteFrom('table1').using('table2,       table3')
        expect(query.mysql()).to.equal('DELETE FROM table1 USING table2, table3')
      })

      it('should accept a mix of statements containing either one or comma separated using statements', function() {
        let query = sql.deleteFrom('table1').using('table2', 'table3,     table4', 'table5')
        expect(query.mysql()).to.equal('DELETE FROM table1 USING table2, table3, table4, table5')
      })

      it('should eliminate duplicates', function() {
        let query = sql.deleteFrom('table1').using('table2', 'table3,     table2', 'table2')
        expect(query.mysql()).to.equal('DELETE FROM table1 USING table2, table3')
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
      it('should create a select SQL statement', function() {
        let query = sql.select('*').from('table').where('a =', value('a')).and('b >', value('b'))
        expect(query.postgres()).to.equal('SELECT * FROM table WHERE a = $1 AND b > $2')
        expect(query.values()).to.deep.equal(['a','b'])
      })

      it('should create a select SQL statement connected through OR', function() {
        let query = sql.select('*').from('table').where('a =', value('a')).and('b >', value('b'))
        expect(query.postgres()).to.equal('SELECT * FROM table WHERE a = $1 AND b > $2')
        expect(query.values()).to.deep.equal(['a','b'])
      })

      it('should create a select SQL statement without a where clause', function() {
        let query = sql.select('*').from('table')
        expect(query.postgres()).to.equal('SELECT * FROM table')
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
    })

    describe('USING', function() {
      it('should accept arbitrary many using statements', function() {
        let query = sql.deleteFrom('table1').using('table2', 'table3')
        let sqlString = query.postgres()
        expect(sqlString).to.equal('DELETE FROM table1 USING table2, table3')
      })

      it('should accept a statement containing comma separated using statements', function() {
        let query = sql.deleteFrom('table1').using('table2,       table3')
        expect(query.postgres()).to.equal('DELETE FROM table1 USING table2, table3')
      })

      it('should accept a mix of statements containing either one or comma separated using statements', function() {
        let query = sql.deleteFrom('table1').using('table2', 'table3,     table4', 'table5')
        expect(query.postgres()).to.equal('DELETE FROM table1 USING table2, table3, table4, table5')
      })

      it('should eliminate duplicates', function() {
        let query = sql.deleteFrom('table1').using('table2', 'table3,     table2', 'table2')
        expect(query.postgres()).to.equal('DELETE FROM table1 USING table2, table3')
      })
    })
  })
})