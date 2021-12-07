import { expect } from 'chai'
import 'mocha'
import { comparison, Comparison, ParameterToken } from '../src'

describe('Comparison', function () {
  describe('constructor', function() {
    it('should accept a column and a value', function() {
      let comparison = new Comparison('column', 1)
      expect(comparison.column).to.equal('column')
      expect(comparison.operator).to.equal('=')
      expect(comparison.value).to.equal(1)
    })

    it('should accept a column and an array value', function() {
      let comparison = new Comparison('column', [1,2,3])
      expect(comparison.column).to.equal('column')
      expect(comparison.operator).to.equal('=')
      expect(comparison.value).to.deep.equal([1,2,3])
    })

    it('should accept a column, an operator and a value', function() {
      let comparison = new Comparison('column', '<>', 1)
      expect(comparison.column).to.equal('column')
      expect(comparison.operator).to.equal('<>')
      expect(comparison.value).to.equal(1)
    })

    it('should accept a column, an operator and an array value', function() {
      let comparison = new Comparison('column', '<>', [1,2,3])
      expect(comparison.column).to.equal('column')
      expect(comparison.operator).to.equal('<>')
      expect(comparison.value).to.deep.equal([1,2,3])
    })
  })

  describe('comparison', function() {
    it('should accept a column and a value', function() {
      let cmp = comparison('column', 1)
      expect(cmp.column).to.equal('column')
      expect(cmp.operator).to.equal('=')
      expect(cmp.value).to.equal(1)
    })

    it('should accept a column, an operator and a value', function() {
      let cmp = comparison('column', '<>', 1)
      expect(cmp.column).to.equal('column')
      expect(cmp.operator).to.equal('<>')
      expect(cmp.value).to.equal(1)
    })
  })

  describe('mysql', function () {
    it('should render a given column and value while using an = operator', function() {
      let comparison = new Comparison('column', 1)
      expect(comparison.mysql()).to.equal('column = ?')
      expect(comparison.values()).to.deep.equal([1])
    })

    it('should render a given column, operator and value', function() {
      let comparison = new Comparison('column', '<>', 1)
      expect(comparison.mysql()).to.equal('column <> ?')
      expect(comparison.values()).to.deep.equal([1])
    })

    it('should render an IN operator', function() {
      let comparison = new Comparison('column', 'IN', [1,2,3])
      expect(comparison.mysql()).to.equal('column IN (?, ?, ?)')
      expect(comparison.values()).to.deep.equal([1,2,3])
    })

    it('should render 1 = 1 if the array of the IN operator is empty', function() {
      let comparison = new Comparison('column', 'IN', [])
      expect(comparison.mysql()).to.equal('1 = 2')
      expect(comparison.values()).to.deep.equal([])
    })

    it('should render 1 = 2 if the array of the NOT IN operator is empty', function() {
      let comparison = new Comparison('column', 'NOT IN', [])
      expect(comparison.mysql()).to.equal('1 = 1')
      expect(comparison.values()).to.deep.equal([])
    })

    it('should render 1 = 1 if the array of the IN operator is undefined', function() {
      let comparison = new Comparison('column', 'IN', undefined)
      expect(comparison.mysql()).to.equal('1 = 2')
      expect(comparison.values()).to.deep.equal([])
    })

    it('should render 1 = 2 if the array of the NOT IN operator is undefined', function() {
      let comparison = new Comparison('column', 'NOT IN', undefined)
      expect(comparison.mysql()).to.equal('1 = 1')
      expect(comparison.values()).to.deep.equal([])
    })

    it('should render 1 = 1 if the array of the IN operator is null', function() {
      let comparison = new Comparison('column', 'IN', null)
      expect(comparison.mysql()).to.equal('1 = 2')
      expect(comparison.values()).to.deep.equal([])
    })

    it('should render 1 = 2 if the array of the NOT IN operator is null', function() {
      let comparison = new Comparison('column', 'NOT IN', null)
      expect(comparison.mysql()).to.equal('1 = 1')
      expect(comparison.values()).to.deep.equal([])
    })

    it('should render an array to the corresponding SQL representation', function() {
      let comparison = new Comparison('column', '>', [1,2,3])
      expect(comparison.mysql()).to.equal('column > (?, ?, ?)')
      expect(comparison.values()).to.deep.equal([1,2,3])
    })

    it('should replace an = operator with an IN operator', function() {
      let comparison = new Comparison('column', '=', [1,2,3])
      expect(comparison.mysql()).to.equal('column IN (?, ?, ?)')
      expect(comparison.values()).to.deep.equal([1,2,3])
    })

    it('should replace a <> operator with an IS NOT operator', function() {
      let comparison = new Comparison('column', '<>', [1,2,3])
      expect(comparison.mysql()).to.equal('column NOT IN (?, ?, ?)')
      expect(comparison.values()).to.deep.equal([1,2,3])
    })

    it('should replace a != operator with an IS NOT operator', function() {
      let comparison = new Comparison('column', '!=', [1,2,3])
      expect(comparison.mysql()).to.equal('column NOT IN (?, ?, ?)')
      expect(comparison.values()).to.deep.equal([1,2,3])
    })

    it('should replace an equals operator with an IS operator', function() {
      let comparison = new Comparison('column', '=', null)
      expect(comparison.mysql()).to.equal('column IS NULL')
      expect(comparison.values()).to.deep.equal([])
    })

    it('should replace a <> operator with an IS NOT operator', function() {
      let comparison = new Comparison('column', '<>', null)
      expect(comparison.mysql()).to.equal('column IS NOT NULL')
      expect(comparison.values()).to.deep.equal([])
    })

    it('should replace a != operator with an IS NOT operator', function() {
      let comparison = new Comparison('column', '!=', null)
      expect(comparison.mysql()).to.equal('column IS NOT NULL')
      expect(comparison.values()).to.deep.equal([])
    })
  })

  describe('postgres', function () {
    it('should render a given column and value while using an = operator', function() {
      let comparison = new Comparison('column', 1)
      expect(comparison.sql('postgres', new ParameterToken(2))).to.equal('column = $2')
      expect(comparison.values()).to.deep.equal([1])
    })

    it('should render a given column, operator and value', function() {
      let comparison = new Comparison('column', '<>', 1)
      expect(comparison.sql('postgres', new ParameterToken(2))).to.equal('column <> $2')
      expect(comparison.values()).to.deep.equal([1])
    })

    it('should render an IN operator', function() {
      let comparison = new Comparison('column', 'IN', [1,2,3])
      expect(comparison.sql('postgres', new ParameterToken(2))).to.equal('column IN ($2, $3, $4)')
      expect(comparison.values()).to.deep.equal([1,2,3])
    })

    it('should render 1 = 1 if the array of the IN operator is empty', function() {
      let comparison = new Comparison('column', 'IN', [])
      expect(comparison.sql('postgres', new ParameterToken(2))).to.equal('1 = 2')
      expect(comparison.values()).to.deep.equal([])
    })

    it('should render 1 = 2 if the array of the NOT IN operator is empty', function() {
      let comparison = new Comparison('column', 'NOT IN', [])
      expect(comparison.sql('postgres', new ParameterToken(2))).to.equal('1 = 1')
      expect(comparison.values()).to.deep.equal([])
    })

    it('should render 1 = 1 if the array of the IN operator is undefined', function() {
      let comparison = new Comparison('column', 'IN', undefined)
      expect(comparison.sql('postgres', new ParameterToken(2))).to.equal('1 = 2')
      expect(comparison.values()).to.deep.equal([])
    })

    it('should render 1 = 2 if the array of the NOT IN operator is undefined', function() {
      let comparison = new Comparison('column', 'NOT IN', undefined)
      expect(comparison.sql('postgres', new ParameterToken(2))).to.equal('1 = 1')
      expect(comparison.values()).to.deep.equal([])
    })

    it('should render 1 = 1 if the array of the IN operator is null', function() {
      let comparison = new Comparison('column', 'IN', null)
      expect(comparison.sql('postgres', new ParameterToken(2))).to.equal('1 = 2')
      expect(comparison.values()).to.deep.equal([])
    })

    it('should render 1 = 2 if the array of the NOT IN operator is null', function() {
      let comparison = new Comparison('column', 'NOT IN', null)
      expect(comparison.sql('postgres', new ParameterToken(2))).to.equal('1 = 1')
      expect(comparison.values()).to.deep.equal([])
    })

    it('should render an array to the corresponding SQL representation', function() {
      let comparison = new Comparison('column', '>', [1,2,3])
      expect(comparison.sql('postgres', new ParameterToken(2))).to.equal('column > ($2, $3, $4)')
    })

    it('should replace a <> operator with an IS NOT operator', function() {
      let comparison = new Comparison('column', '<>', [1,2,3])
      expect(comparison.sql('postgres', new ParameterToken(2))).to.equal('column NOT IN ($2, $3, $4)')
      expect(comparison.values()).to.deep.equal([1,2,3])
    })

    it('should replace a != operator with an IS NOT operator', function() {
      let comparison = new Comparison('column', '!=', [1,2,3])
      expect(comparison.sql('postgres', new ParameterToken(2))).to.equal('column NOT IN ($2, $3, $4)')
      expect(comparison.values()).to.deep.equal([1,2,3])
    })

    it('should replace an equals operator with an IS operator', function() {
      let comparison = new Comparison('column', '=', null)
      expect(comparison.sql('postgres', new ParameterToken(2))).to.equal('column IS NULL')
      expect(comparison.values()).to.deep.equal([])
    })

    it('should replace a <> operator with an IS NOT operator', function() {
      let comparison = new Comparison('column', '<>', null)
      expect(comparison.sql('postgres', new ParameterToken(2))).to.equal('column IS NOT NULL')
      expect(comparison.values()).to.deep.equal([])
    })

    it('should replace a != operator with an IS NOT operator', function() {
      let comparison = new Comparison('column', '!=', null)
      expect(comparison.sql('postgres', new ParameterToken(2))).to.equal('column IS NOT NULL')
      expect(comparison.values()).to.deep.equal([])
    })
  })
})