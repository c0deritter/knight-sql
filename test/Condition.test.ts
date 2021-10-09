import { expect } from 'chai'
import 'mocha'
import sql, { Brackets, Comparison, Condition, ParameterTokens, value } from '../src'

describe('Condition', function () {
  describe('mysql', function () {
    it('should ignore empty strings', function() {
      let condition = new Condition('', 'a', '=', value(1), '')
      expect(condition.mysql()).to.equal('a = ?')
      expect(condition.values()).to.deep.equal([1])
    })

    it('should ignore undefined', function() {
      let condition = new Condition(undefined, 'a', '=', value(1), undefined)
      expect(condition.mysql()).to.equal('a = ?')
      expect(condition.values()).to.deep.equal([1])
    })

    it('should render a simple comparison', function () {
      let condition = new Condition('column', '=', value(1))
      expect(condition.mysql()).to.equal('column = ?')
      expect(condition.values()).to.deep.equal([1])
    })

    it('should render two simple comparisons connected by a logical operator', function () {
      let condition = new Condition('column', '>', value(0), 'AND', 'column', '<', value(10))
      expect(condition.mysql()).to.equal('column > ? AND column < ?')
      expect(condition.values()).to.deep.equal([0, 10])
    })

    it('should render a number', function() {
      let condition = new Condition('column =', 1, 'AND')
      expect(condition.mysql()).to.equal('column = 1 AND')
      expect(condition.values()).to.deep.equal([])
    })

    it('should render multiple values', function() {
      let condition = new Condition(value(1), value(2))
      expect(condition.mysql()).to.equal('? ?')
      expect(condition.values()).to.deep.equal([1,2])
    })

    it('should render an alias', function () {
      let condition = new Condition('alias.', 'column', '=', value(1))
      expect(condition.mysql()).to.equal('alias.column = ?')
      expect(condition.values()).to.deep.equal([1])
    })

    it('should render an array to values in brackets', function() {
      let condition = new Condition([1,2,3])
      expect(condition.mysql()).to.equal('(1, 2, 3)')
      expect(condition.values()).to.deep.equal([])
    })

    it('should render a value which is an array to parameter tokens in brackets', function() {
      let condition = new Condition(value(0), value([1,2,3]), value(4))
      expect(condition.mysql()).to.equal('? (?, ?, ?) ?')
      expect(condition.values()).to.deep.equal([0,1,2,3,4])
    })

    it('should render null to an SQL NULL string', function() {
      let condition = new Condition(value(0), value(null), value(1))
      expect(condition.mysql()).to.equal('? NULL ?')
      expect(condition.values()).to.deep.equal([0,1])
    })

    it('should render a condition', function() {
      let condition = new Condition(new Condition('column'))
      expect(condition.mysql()).to.equal('column')
      expect(condition.values()).to.deep.equal([])
    })

    it('should render a comparison', function() {
      let condition = new Condition(new Comparison('column', 1))
      expect(condition.mysql()).to.equal('column = ?')
      expect(condition.values()).to.deep.equal([1])
    })

    it('should render brackets', function() {
      let condition = new Condition(new Brackets(new Comparison('column', 1)))
      expect(condition.mysql()).to.equal('(column = ?)')
      expect(condition.values()).to.deep.equal([1])
    })

    it('should render a condition with values', function() {
      let condition = new Condition(value(1), new Condition(value(2)), value(3))
      expect(condition.mysql()).to.equal('? ? ?')
      expect(condition.values()).to.deep.equal([1,2,3])
    })

    it('should render a sub query', function() {
      let condition = new Condition(value(0), sql.select('COUNT(*)').from('table').where('column =', value(1)), value(2))
      expect(condition.mysql()).to.equal('? (SELECT COUNT(*) FROM table WHERE column = ?) ?')
      expect(condition.values()).to.deep.equal([0,1,2])
    })

    it('should add a date as a parameter', function() {
      let date = new Date
      let condition = new Condition(value(0), date, value(1))
      expect(condition.mysql()).to.equal('? ? ?')
      expect(condition.values()).to.deep.equal([0,date,1])
    })
  })

  describe('postgres', function () {
    it('should ignore empty strings', function() {
      let condition = new Condition('', 'a', '=', value(1), '')
      expect(condition.postgres()).to.equal('a = $1')
      expect(condition.values()).to.deep.equal([1])
    })

    it('should ignore undefined', function() {
      let condition = new Condition(undefined, 'a', '=', value(1), undefined)
      expect(condition.postgres()).to.equal('a = $1')
      expect(condition.values()).to.deep.equal([1])
    })

    it('should render a simple comparison', function () {
      let condition = new Condition('column', '=', value(1))
      expect(condition.postgres()).to.equal('column = $1')
      expect(condition.values()).to.deep.equal([1])
    })

    it('should render two simple comparisons connected by a logical operator', function () {
      let condition = new Condition('column', '>', value(0), 'AND', 'column', '<', value(10))
      expect(condition.postgres()).to.equal('column > $1 AND column < $2')
      expect(condition.values()).to.deep.equal([0, 10])
    })

    it('should render a number', function() {
      let condition = new Condition('column =', 1, 'AND')
      expect(condition.postgres()).to.equal('column = 1 AND')
      expect(condition.values()).to.deep.equal([])
    })

    it('should render multiple values', function() {
      let condition = new Condition(value(1), value(2))
      expect(condition.postgres()).to.equal('$1 $2')
      expect(condition.values()).to.deep.equal([1,2])
    })

    it('should render an alias', function () {
      let condition = new Condition('alias.', 'column', '=', value(1))
      expect(condition.postgres()).to.equal('alias.column = $1')
      expect(condition.values()).to.deep.equal([1])
    })

    it('should render an array to values in brackets', function() {
      let condition = new Condition([1,2,3])
      expect(condition.postgres()).to.equal('(1, 2, 3)')
      expect(condition.values()).to.deep.equal([])
    })

    it('should render a value which is an array to parameter tokens in brackets', function() {
      let condition = new Condition(value(0), value([1,2,3]), value(4))
      expect(condition.postgres()).to.equal('$1 ($2, $3, $4) $5')
      expect(condition.values()).to.deep.equal([0,1,2,3,4])
    })

    it('should render null to an SQL NULL string', function() {
      let condition = new Condition(value(0), value(null), value(1))
      expect(condition.postgres()).to.equal('$1 NULL $2')
      expect(condition.values()).to.deep.equal([0,1])
    })

    it('should render a condition', function() {
      let condition = new Condition(new Condition('column'))
      expect(condition.postgres()).to.equal('column')
      expect(condition.values()).to.deep.equal([])
    })

    it('should render a comparison', function() {
      let condition = new Condition(new Comparison('column', 1))
      expect(condition.sql('postgres', new ParameterTokens(2))).to.equal('column = $2')
      expect(condition.values()).to.deep.equal([1])
    })

    it('should render brackets', function() {
      let condition = new Condition(new Brackets(new Comparison('column', 1)))
      expect(condition.sql('postgres', new ParameterTokens(2))).to.equal('(column = $2)')
      expect(condition.values()).to.deep.equal([1])
    })

    it('should render a condition with values', function() {
      let condition = new Condition(value(1), new Condition(value(2)), value(3))
      expect(condition.postgres()).to.equal('$1 $2 $3')
      expect(condition.values()).to.deep.equal([1,2,3])
    })

    it('should render a sub query', function() {
      let condition = new Condition(value(0), sql.select('COUNT(*)').from('table').where('column =', value(1)), value(2))
      expect(condition.postgres()).to.equal('$1 (SELECT COUNT(*) FROM table WHERE column = $2) $3')
      expect(condition.values()).to.deep.equal([0, 1,2])
    })

    it('should add a date as a parameter', function() {
      let date = new Date
      let condition = new Condition(value(0), date, value(1))
      expect(condition.postgres()).to.equal('$1 $2 $3')
      expect(condition.values()).to.deep.equal([0,date,1])
    })
  })
})