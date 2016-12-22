var assert = require('assert');
var FilterOperationModule = require('../modules/operation/FilterOperationModule');
var FilterOperation = require('../models/FilterOperation');
var _ = require('lodash');

function daoMockFactory(filterOperation) {
    return {
        get: function (id, callback) {
            this.filterOperationCalled = id;
            callback(filterOperation);
        },
        bodyToHelper: function (id, helper) {
            this.bodyToHelperCalled = [id, helper];
        },
        setBody: function (id, body) {
            this.setBodyCalled = [id, body];
        },
        helperToBody: function (id, body) {
            this.helperToBodyCalled = [id, body];
        },
        setHelper: function (id, helper) {
            this.setHelperCalled = [id, helper];
        },
        save: function (filterOperation, callback) {
            this.saveCalledWith = filterOperation;
            callback();
        }
    };
}


describe('FilterOperationModule', function () {
    before(function () {
        this.helperMock = {
            add: function (helper, sourceId, programId, operation, callback) {
                this.addCalled = true;
            }
        };

        this.bodyMock = {
            add: function (body, operation, callback) {
                this.addCalled = true;
            }
        };

        this.filterOperationMock = new FilterOperation(
            'mock',
            {name: "source"},
            {name: "destination"}
        );

        this.filterOperationWithBodyMock = new FilterOperation(
            'mock',
            {name: "source"},
            {name: "destination"}
        );

        this.filterOperationWithBodyMock.addBody("body");

        this.filterOperationWithHelperMock = new FilterOperation(
            'mock',
            {name: "source"},
            {name: "destination"}
        );

        this.filterOperationWithHelperMock.addHelper("helper");

        this.dao = daoMockFactory(this.filterOperationMock);
        this.daoWithBody = daoMockFactory(this.filterOperationWithBodyMock);
        this.daoWithHelper = daoMockFactory(this.filterOperationWithHelperMock);

        this.fo = new FilterOperationModule(
            this.helperMock, this.bodyMock, this.dao
        );

        this.foWithBody = new FilterOperationModule(
            this.helperMock, this.bodyMock, this.daoWithBody
        );

        this.foWithHelper = new FilterOperationModule(
            this.helperMock, this.bodyMock, this.daoWithHelper
        );
    });

    describe('AddWithHelper', function () {
        it('should call withhelper', function () {
            this.fo.addWithHelper(
                "helper", "sourceId", "programId", "operation", "callback"
            );
            assert(this.helperMock.addCalled);
        });
    });

    describe('AddWithBody', function () {
        it('should call withbody', function () {
            this.fo.addWithBody("body", 'operation', 'callback');
            assert(this.bodyMock.addCalled);
        });
    });

    describe("Edit", function () {
        it('gets the current filter operation', function () {
            this.fo.editFilter({id: 'mock'}, () => {});
            assert(this.dao.filterOperationCalled);
        });

        it('sets new name when the output name changed', function () {
            var newName = "new";
            this.fo.editFilter({id: 'mock', name: newName}, () => {});
            assert.equal(newName, this.filterOperationMock.destination.name);
        });

        it('sets new body when the body changed', function () {
            var id = 'mock';
            var body = "changed";
            this.foWithBody.editFilter({id: id, body: body}, () => {});
            assert(_.isEqual([id, body], this.daoWithBody.setBodyCalled));
        });

        it('sets new helper when the helper changed', function() {
            var id = 'mock';
            var helper = "changed";
            this.foWithHelper.editFilter({id: id, helper: helper}, () => {});
            assert(_.isEqual([id, helper], this.daoWithHelper.setHelperCalled));
        });

        it('removes helper and sets body when changed from helper to body', function() {
            var id = 'mock';
            var body = "changed";
            this.foWithHelper.editFilter({id: id, body: body}, () => {});
            assert(_.isEqual([id, body], this.daoWithHelper.helperToBodyCalled));
        });

        it('removes body and sets helper when changed from body to helper', function() {
            var id = 'mock';
            var helper = "changed";
            this.foWithBody.editFilter({id: id, helper: helper}, () => {});
            assert(_.isEqual([id, helper], this.daoWithBody.bodyToHelperCalled));
        });

        it("saves the filter operation", function() {
            var id = "mock";
            this.fo.editFilter({id: id}, () => {});
            assert.equal(id, this.dao.saveCalledWith.id);
        });

        it("calls back after saving", function(done) {
            var id = "mock";
            this.fo.editFilter({id: id}, done);
        })
    });
});
