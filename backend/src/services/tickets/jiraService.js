// services/jiraService.js
const axios = require('axios');
const config = require('../../config');
const FormData = require('form-data');
const { sendToSlack } = require('./sendToSlack');

function createAdfDescription(ticketData) {
  const paragraphs = [];

  function addParagraph(label, value) {
    if (!value) return;
  
    paragraphs.push({
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: label ? `${label}: ` : '',
          marks: [{ type: 'strong' }],
        },
        {
          type: 'text',
          text: value,
        },
      ],
    });
  }

  addParagraph('Description', ticketData.description);
  addParagraph('Support Type', ticketData.supportType);
  addParagraph('Issue Type', ticketData.issueType);
  addParagraph('Urgency', ticketData.urgency);

  addParagraph('', "From:")

  addParagraph('First Name', ticketData.firstName);
  addParagraph('Last Name', ticketData.lastName);
  addParagraph('Email', ticketData.email);
  addParagraph('User Id', ticketData.userId);
  addParagraph('Company', ticketData.company);
  addParagraph('Company Id', ticketData.companyId);
  

  if (ticketData.issueType.toLowerCase() === 'bug') {
    const userName = `${ticketData.firstName || ''} ${
      ticketData.lastName || ''
    }`.trim();
    addParagraph('Submitter', userName);
    addParagraph('Company', ticketData.company);
    addParagraph('Email', ticketData.email);
  }

  if (ticketData.host) {
    paragraphs.push({
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Website: ', marks: [{ type: 'strong' }]},
        {
          type: 'text',
          text: ticketData.host,
          marks: [{
            type: 'link',
            attrs: { href: ticketData.host }
          }]
        }
      ]
    });
  }
  if (ticketData.loomVideoUrl) {
    paragraphs.push({
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Loom Video: ', marks: [{ type: 'strong' }]},
        {
          type: 'text',
          text: ticketData.loomVideoUrl,
          marks: [{
            type: 'link',
            attrs: { href: ticketData.loomVideoUrl }
          }]
        }
      ]
    });
  }

  return {
    type: 'doc',
    version: 1,
    content: paragraphs,
  };
}

module.exports = {
  async createJiraIssue(ticketData) {

    const mapping = config.jira.projectKey; 
    const category = "bugs"
    
    const projectKey = mapping[category]

    // Step 1: Create the issue with the ADF description
    const descriptionAdf = createAdfDescription(ticketData);
    const jiraPayload = {
      fields: {
        project:  { key: projectKey },
        summary: ticketData.summary,
        description: descriptionAdf,
        issuetype: { name: 'Task' },
        labels : ["Bot"],
      },
    };

    try {
      const response = await axios.post(
        `https://${config.jira.domain}/rest/api/3/issue`,
        jiraPayload,
        {
          auth: {
            username: config.jira.email,
            password: config.jira.apiToken,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const issueKey = response.data.key;

      // Step 2: Upload attachments (if any) using the Jira attachments endpoint
      if (ticketData.attachments && ticketData.attachments.length > 0) {
        const form = new FormData();

        // Append each file (assuming buffer or stream or file path)
        ticketData.attachments.forEach((file) => {
          form.append('file', file.buffer, file.originalname);
        });

        await axios.post(
          `https://${config.jira.domain}/rest/api/3/issue/${issueKey}/attachments`,
          form,
          {
            auth: {
              username: config.jira.email,
              password: config.jira.apiToken,
            },
            headers: {
              'X-Atlassian-Token': 'no-check',
              ...form.getHeaders(),
            },
          },
        );
      }
      // Step 3: Send a notification to Slack
      const slackConfigMap = {
        'Bug': {
          channel: config.slack.webhookUrls.bugsChannel,
          emoji: ':beetle:',
          label: 'Bug Reported',
        },
        'Feature Requested': {
          channel: config.slack.webhookUrls.featureRequestsChannel,
          emoji: ':bulb:',
          label: 'Feature Requested',
        },
        'Admin': {
          channel: config.slack.webhookUrls.adminTasksChannel,
          emoji: ':clipboard:',
          label: 'Admin Task',
        },
      };

      const slackMessageConfig = slackConfigMap[ticketData.issueType];

      if (slackMessageConfig) {
        const message = `${slackMessageConfig.emoji} ${slackMessageConfig.label}:\n${ticketData.summary}\nLink: https://${config.jira.domain}/browse/${issueKey}`;
        await sendToSlack(slackMessageConfig.channel, message);
      }


      return response.data;
    } catch (error) {
      console.error(
        'Error creating Jira issue:',
        error.response ? error.response.data : error.message,
      );
      throw error;
    }
  },
};
