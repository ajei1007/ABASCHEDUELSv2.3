// routes/tickets.js
const express = require('express');
const router = require('../utils/createRouter')();
const JiraService = require('../services/tickets/jiraService');
const multer = require('multer');

const storage = multer.memoryStorage(); // or use diskStorage
const upload = multer({ storage });

router.post('/', upload.array('attachments'), async (req, res) => {
  try {
    const {
      supportType,
      issueType,
      board,
      description,
      firstName,
      lastName,
      company,
      email,
      loomVideoUrl,
      summary,
      urgency
    } = req.body;

    // Validate basic mandatory fields
    // if (!subject) {
    //   return res.status(400).json({ error: 'Missing required fields: summary.' });
    // }

    // For "Bug" issues, ensure additional fields are provided
    // if (issueType.toLowerCase() === 'bug') {
    //   if (!firstName || !lastName ) {
    //     return res.status(400).json({ error: 'For bug issues, firstName, lastName are required.' });
    //   }
    // }

    // Prepare the payload to send to Jira. Feel free to adjust these fields as needed.
    const ticketData = {
      supportType,
      issueType,
      board,
      urgency,
      summary,
      description,
      userId: req.currentUser?.id ?? '',
      firstName: firstName ?? req.currentUser?.firstName ?? '',
      lastName: lastName ?? req.currentUser?.lastName ?? '',
      company,
      companyId: req.currentUser.companyId ?? '',
      host: req.headers.origin ?? '',
      email,
      loomVideoUrl,
      attachments: req.files ?? [],
    };

    // Directly create a Jira issue using the JiraService.
    // The JiraService should be responsible for constructing the Jira payload and calling the API.
    const jiraIssue = await JiraService.createJiraIssue(ticketData);

    // Respond with success and the created Jira issue details.
    res.status(201).json({
      message: 'Ticket submitted and Jira issue created successfully',
      jiraIssue,
    });
  } catch (error) {
    console.error('Error processing ticket submission:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
