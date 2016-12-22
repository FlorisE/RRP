var assert = require('assert');
var FilterOperationDao = require('../dao/FilterOperationDao');
var FilterOperation = require('../models/FilterOperation');

describe('FilterOperationDao', function () {
  before(function() {
    this.sessionMock = {
      run: function(query) {
        this.runCalled = query;
        return new Promise(function(resolve) { resolve([new FilterOperation("mock", "", "")]) });
      }
    };
    this.dao = new FilterOperationDao(this.sessionMock);
  });

  describe('getFilterOperation', function(done) {
    it('should call run on session', function () {
      var filterOperation = this.dao.get('mock', done);
    });
  });
});
