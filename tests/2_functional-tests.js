const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  test('Create an issue with every field', function (done) {
    chai
      .request(server)
      .post('/api/issues/testproject')
      .send({
        issue_title: 'Test issue',
        issue_text: 'This is a test',
        created_by: 'Tester',
        assigned_to: 'John Doe',
        status_text: 'In progress',
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Test issue');
        done();
      });
  });   
    
  test('Create an issue with only required fields', function (done) {
    chai
      .request(server)
      .post('/api/issues/testproject')
      .send({
        issue_title: 'Required fields issue',
        issue_text: 'Only required fields',
        created_by: 'Tester',
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Required fields issue');
        assert.equal(res.body.issue_text, 'Only required fields');
        assert.equal(res.body.created_by, 'Tester');
        assert.equal(res.body.assigned_to, ''); // Default value
        assert.equal(res.body.status_text, ''); // Default value
        done();
      });
  });

  test('Create an issue with missing required fields', function (done) {
    chai
      .request(server)
      .post('/api/issues/testproject')
      .send({
        issue_title: 'Missing fields issue',
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  test('View issues on a project', function (done) {
    chai
      .request(server)
      .get('/api/issues/testproject')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        if (Array.isArray(res.body)) {
          assert.isArray(res.body);
        } else {
          assert.property(res.body, 'error'); // Ensure proper error response
        }
        done();
      });
  });
  

  test('View issues on a project with one filter', function (done) {
    chai
      .request(server)
      .get('/api/issues/testproject')
      .query({ open: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach((issue) => {
          assert.equal(issue.open, true);
        });
        done();
      });
  });
  

  test('View issues on a project with multiple filters', function (done) {
    chai
      .request(server)
      .get('/api/issues/testproject')
      .query({ open: true, created_by: 'Tester' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach((issue) => {
          assert.equal(issue.open, true);
          assert.equal(issue.created_by, 'Tester');
        });
        done();
      });
  });
  

 test('Update one field on an issue', function (done) {
  chai
    .request(server)
    .post('/api/issues/testproject')
    .send({
      issue_title: 'Test issue to update',
      issue_text: 'Initial text',
      created_by: 'Tester',
    })
    .end(function (err, res) {
      const issueId = res.body._id; // Capture the created issue's ID
      
      chai
        .request(server)
        .put('/api/issues/testproject')
        .send({ _id: issueId, issue_text: 'Updated text' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, issueId);
          done();
        });
    });
});


test('Update multiple fields on an issue', function (done) {
  // First, create an issue to get a valid ID
  chai
    .request(server)
    .post('/api/issues/testproject')
    .send({
      issue_title: 'Issue to update multiple fields',
      issue_text: 'Initial text',
      created_by: 'Tester',
    })
    .end(function (err, res) {
      const issueId = res.body._id; // Capture the issue ID
      
      // Then, update multiple fields
      chai
        .request(server)
        .put('/api/issues/testproject')
        .send({
          _id: issueId,
          issue_title: 'Updated title',
          issue_text: 'Updated text',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, issueId);
          done();
        });
    });
});


test('Update an issue with missing _id', function (done) {
  chai
    .request(server)
    .put('/api/issues/testproject')
    .send({ issue_text: 'Updated text' })
    .end(function (err, res) {
      assert.equal(res.status, 200);
      assert.property(res.body, 'error');
      assert.equal(res.body.error, 'missing _id');
      done();
    });
});


test('Update an issue with no fields to update', function (done) {
  chai
    .request(server)
    .put('/api/issues/testproject')
    .send({ _id: 'validId123' })
    .end(function (err, res) {
      assert.equal(res.status, 200);
      assert.property(res.body, 'error');
      assert.equal(res.body.error, 'no update field(s) sent');
      done();
    });
});

test('Update an issue with an invalid _id', function (done) {
  chai
    .request(server)
    .put('/api/issues/testproject')
    .send({ _id: 'invalidId', issue_text: 'Updated text' })
    .end(function (err, res) {
      assert.equal(res.status, 200);
      assert.property(res.body, 'error');
      assert.equal(res.body.error, 'could not update');
      done();
    });
});


test('Delete an issue', function (done) {
  
  chai
  .request(server)
  .post('/api/issues/testproject')
  .send({
    issue_title: 'Issue to delete',
    issue_text: 'Initial text',
    created_by: 'Tester',
  })
  .end(function (err, res) {
    const issueId = res.body._id;
    chai
    .request(server)
    .delete('/api/issues/testproject')
    .send({ _id: issueId })
    .end(function (err, res) {
      assert.equal(res.status, 200);
      assert.equal(res.body.result, 'successfully deleted');
      assert.equal(res.body._id, issueId);
      done();
    });

  });

});


test('Delete an issue with an invalid _id', function (done) {
  chai
    .request(server)
    .delete('/api/issues/testproject')
    .send({ _id: 'invalidId' })
    .end(function (err, res) {
      assert.equal(res.status, 200);
      assert.property(res.body, 'error');
      assert.equal(res.body.error, 'could not delete');
      done();
    });
});

test('Delete an issue with missing _id', function (done) {
  chai
    .request(server)
    .delete('/api/issues/testproject')
    .send({})
    .end(function (err, res) {
      assert.equal(res.status, 200);
      assert.property(res.body, 'error');
      assert.equal(res.body.error, 'missing _id');
      done();
    });
});


  
  



  
  
  
  


});