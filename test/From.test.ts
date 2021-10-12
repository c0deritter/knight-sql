import { expect } from 'chai'
import 'mocha'
import { From } from '../src'

describe('From', function() {
  describe('constructor', function() {
    it('should initialize with table and alias', function() {
      let from = new From('table', 't')
      expect(from.table).to.equal('table')
      expect(from.alias).to.equal('t')
    })
  })

  describe('sql', function() {
    it('should render a FROM with alias', function() {
      let from = new From('table', 't')
      expect(from.sql('mysql')).to.equal('table t')
    })
  })
})