'use strict';
require('dotenv').config(); // Load environment variables from .env

console.log('NODE_ENV:', process.env.NODE_ENV); // Debug the environment variable

module.exports = function (app) {
  // Store issues in memory (replace with a database later)
  const issues = {};

  app.route('/api/issues/:project')

     // GET: Fetch issues for a project, with optional filters
     .get(function (req, res) {
      const project = req.params.project;
      const query = req.query; // Get query parameters for filtering
    
      try {
        // Filter the issues for the project
        const filteredIssues = issues[project]?.filter(issue => {
          // Check if all query filters match
          return Object.keys(query).every(key => issue[key] == query[key]);
        });
    
        // If no issues exist for the project, return an empty array
        res.json(filteredIssues || []);
      } catch (err) {
        res.status(500).json({ error: 'Failed to fetch issues' });
      }
    })   
      
        // POST: Create a new issue for a project
    .post(function (req, res) {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
    
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }
    
      const newIssue = {
        _id: Date.now().toString(), // Simple ID generation (replace for production)
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || '',
        created_on: new Date(),
        updated_on: new Date(),
        open: true,
      };
    
      issues[project] = issues[project] || [];
      issues[project].push(newIssue);
    
      res.json(newIssue);
    })
   

    // PUT: Update one or more fields of an issue
    .put(function (req, res) {
      const project = req.params.project;
      const { _id, ...updates } = req.body;
    
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
    
      if (Object.keys(updates).length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }
    
      const projectIssues = issues[project] || [];
      const issue = projectIssues.find(issue => issue._id === _id);
    
      if (!issue) {
        return res.json({ error: 'could not update', _id });
      }
    
      Object.assign(issue, updates, { updated_on: new Date() });
      res.json({ result: 'successfully updated', _id });
    })
    
    

    // DELETE: Delete an issue by ID
    .delete(function (req, res) {
      const project = req.params.project;
      const { _id } = req.body;
    
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
    
      const projectIssues = issues[project] || [];
      const issueIndex = projectIssues.findIndex(issue => issue._id === _id);
    
      if (issueIndex === -1) {
        return res.json({ error: 'could not delete', _id });
      }
    
      projectIssues.splice(issueIndex, 1); // Remove issue from array
      res.json({ result: 'successfully deleted', _id });
    });   };