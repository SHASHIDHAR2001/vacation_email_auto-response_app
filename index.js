const { google } = require('googleapis');

const { OAuth2Client } = require('google-auth-library');
const express = require('express');
const app = express();

// Define your routes and middleware here

app.listen(3000, () => {
  console.log('Server started on port 3000');
});

const CLIENT_ID = '148668078807-9edds6bbdjirpgevur5e4cp0odg8d29l.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

const oAuth2Client = new OAuth2Client(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
// generate the authorization URL
const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/gmail.modify']
});

console.log('Authorize this app by visiting this URL:', authUrl);

const TOKEN = 'your_token'; // replace with actual token

oAuth2Client.getToken(TOKEN, (err, token) => {
  if (err) {
    console.error('Error retrieving access token', err);
    return;
  }

  oAuth2Client.setCredentials(token);

  // use the oAuth2Client to make API requests
});



gmail.users.messages.list(
    {
      userId: 'me',
      q: 'is:unread',
    },
    (err, res) => {
      if (err) {
        console.error('The API returned an error:', err);
        return;
      }
  
      const messages = res.data.messages;
  
      // process the list of messages
      messages.forEach((message) => {
        gmail.users.messages.get(
          {
            userId: 'me',
            id: message.id,
            format: 'full',
          },
          (err, res) => {
            if (err) {
              console.error('The API returned an error:', err);
              return;
            }
  
            const thread = res.data.threadId;
            // check if user has sent any previous email in the thread
            // ...
          }
        );
      });
    }
  );
  


    // Step 4: Send Replies to Emails with No Prior Replies
async function sendRepliesToEmailsWithNoPriorReplies() {
    try {
      // Fetch all the threads from the mailbox
      const threads = await fetchAllThreadsFromMailbox();
  
      // Filter threads to include only those threads that have no prior emails sent by us
      const threadsWithNoPriorReplies = threads.filter(thread => {
        const messages = thread.messages;
        const lastMessage = messages[messages.length - 1];
        const senderEmail = lastMessage.payload.headers.find(header => header.name === 'From').value;
        return senderEmail !== 'youremail@gmail.com';
      });
 
      

      // Send a reply to each email in the threads with no prior replies
      for (const thread of threadsWithNoPriorReplies) {
        const messages = thread.messages;
        const lastMessage = messages[messages.length - 1];
        const recipientEmail = lastMessage.payload.headers.find(header => header.name === 'To').value;
        const threadId = thread.id;
        await sendEmailReply(recipientEmail, threadId);
      }
    } catch (error) {
      console.error(`Error in sendRepliesToEmailsWithNoPriorReplies: ${error}`);
    }
  }

  
//   In the above code, we're using the fetchAllThreadsFromMailbox function to fetch all the threads from 
//   the mailbox. We then filter these threads using the filter method to include only those threads that 
//   have no prior emails sent by us. We're doing this by checking the sender email of the last message in 
//   each thread. If the sender email is not our email, we consider the thread to have no prior replies from us.

// We then iterate over each thread in threadsWithNoPriorReplies and send a reply to each email in the thread 
// using the sendEmailReply function. In the sendEmailReply function, we're using the Gmail API to send an email 
// reply to the recipient email.

// Add a Label to the Email and Move the Email to the Label
// After sending the reply, we'll add a label to the email and move the email to the label. We'll create a new
//  label if the label doesn't exist already.


// Step 5: Add a Label to the Email and Move the Email to the Label
async function addLabelToEmailAndMoveToLabel() {
    try {
    // Fetch all the threads from the mailbox
    const threads = await fetchAllThreadsFromMailbox();
    // Iterate over each thread and add a label to the email and move the email to the label
for (const thread of threads) {
    const messages = thread.messages;
    const lastMessage = messages[messages.length - 1];
    const threadId = thread.id;
    const labelName = 'Vacation Replies';
  
    // Check if the label already exists, and create it if it doesn't
    let label = await checkIfLabelExists(labelName);
    if (!label) {
      label = await createLabel(labelName);
    }
  


    // Check if the email has already been labelled with the "Vacation Replies" label
    const labels = lastMessage.labelIds;
    if (!labels.includes(label.id)) {
      // Add the label to the email and move the email to the label
      await gmail.users.messages.modify({
        userId: 'me',
        id: lastMessage.id,
        resource: {
          addLabelIds: [label.id],
          removeLabelIds: ['INBOX'],
        },
      });
      console.log(`Email moved to label "${labelName}".`);
    }
  }
} catch (error) {
    console.error("Error in addLabelToEmailAndMoveToLabel: " + error);
    }
    }
   
    

    // Helper function to add a label to the email and move the email to the label
    async function addLabelToEmailAndMoveToLabelWithThreadId(threadId, labelName) {
    try {
    // Check if the label already exists, and create it if it doesn't
    let label = await checkIfLabelExists(labelName);
    if (!label) {
    label = await createLabel(labelName);
    }
    // Get the last message from the thread
const lastMessage = await fetchLastMessageFromThread(threadId);



// Check if the email has already been labelled with the "Vacation Replies" label
const labels = lastMessage.labelIds;
if (!labels.includes(label.id)) {
  // Add the label to the email and move the email to the label
  await gmail.users.messages.modify({
    userId: 'me',
    id: lastMessage.id,
    resource: {
      addLabelIds: [label.id],
      removeLabelIds: ['INBOX'],
    },
  });
  console.log(`Email moved to label "${labelName}".`);
}
} catch (error) {
    console.error("Error in addLabelToEmailAndMoveToLabelWithThreadId: " + error);

    }
    }
  


    // Helper function to check if a label exists
    async function checkIfLabelExists(labelName) {
    try {
    const response = await gmail.users.labels.list({
    userId: 'me',
    });
    const labels = response.data.labels;
    const label = labels.find((label) => label.name === labelName);
    return label;
    } catch (error) {
    console.error("Error in checkIfLabelExists: " + error);

    }
    }
    
    // Helper function to create a label
    async function createLabel(labelName) {
        try {
          const response = await gmail.users.labels.create({
            userId: 'me',
            resource: {
              name: labelName,
              labelListVisibility: 'labelShow',
              messageListVisibility: 'show',
              color: {
                backgroundColor: '#fce8c3',
                textColor: '#000000',
              },
            },
          });
          const responseLabel = response.data;
          
          console.log(`${responseLabel.name} created.`);
        } catch (error) {
          console.error(`Error creating label ${labelName}: ${error}`);
        }
      }
      
 //console.log("{responseLabel}"+ "${labelName}" created.);


//   Set up a watch on the Gmail mailbox to listen for new emails
// To continuously monitor the mailbox for new emails, we can set up a watch on the mailbox. 
// This can be done using the Gmail API watch method. The watch method returns a watch ID, which 
// can be used to stop the watch later. We'll store this watch ID in a variable for later use.

// Set up a watch on the mailbox to listen for new emails
async function watchMailbox() {
    const res = await gmail.users.watch({
      userId: 'me',
      resource: {
        labelIds: ['INBOX'],
        topicName: 'projects/vacation-gmail/topics/gmail-webhook'
      }
    });
    console.log('Mailbox watch started. Watch ID:', res.data.id);
    return res.data.id;
  }
  
  async function startWatching() {
    const watchId = await watchMailbox();
    // rest of the code that depends on the watchId
  }
  
  startWatching();
  


//   Handle incoming webhook notifications
// Whenever a new email is received in the mailbox, Google sends a webhook notification to our
//  specified endpoint. We need to handle these incoming notifications and process the new email.
//   This can be done by creating a new HTTP endpoint using Express and setting it as the push 
//   notification endpoint in the watch request.
  // Set up an endpoint to handle incoming webhook notifications
app.post('/webhook', async (req, res) => {
  const { message } = req.body;
  console.log('New message received:', message);
  

  // Check if the message has any prior replies
  const threadId = message.threadId;
  const thread = await gmail.users.threads.get({ userId: 'me', id: threadId });
  const messages = thread.data.messages;
  const hasReplies = messages.some(message => message.labelIds.includes('SENT'));
  
  // If the message has no prior replies, send a response and apply the "auto-reply" label
  if (!hasReplies) {
    const response = await sendAutoReply(message.id);
    await applyLabel(message.threadId, 'auto-reply');
    console.log('Auto-reply sent:', response);
  } else {
    console.log('Message already has replies, no auto-reply sent');
  }
  
  res.sendStatus(200);
});
// In this code, we first extract the message object from the request body. We then retrieve the
//  entire email thread using the threadId property of the message object. We check if any of the messages
//   in the thread have the SENT label, indicating that a reply has already been sent. If no replies are found,
//    we send an auto-reply using the sendAutoReply function and apply the "auto-reply" label to the thread using 
//    the applyLabel function.


// Set up a timer to repeat the process in random intervals
// Finally, we need to set up a timer that repeats the entire process in random intervals between 45 to 120 seconds.
//  This can be done using the setInterval function in JavaScript. We'll call the watchMailbox function to start the 
//  mailbox watch and handle incoming webhook notifications using the Express endpoint we set up earlier
// Set up a timer to repeat the process in random intervals
setInterval(async () => {
    console.log('Checking for new emails...');
    await watchMailbox();
  }, getRandomInterval());
  
  function getRandomInterval() {
    // Returns a random interval between 45 and 120 seconds
    return (Math.floor(Math.random() * 76) + 45) * 1000;
  }

  
//   Create a label if it doesn't exist:
//   Before tagging the email with the label, we need to make sure that the label exists. If it doesn't exist,
//    we'll create it using the Gmail API. Add the following code to check if the label exists and create it if it 
//    doesn't:
async function myFunction() {
    const labelName = 'Vacation Auto-Reply';
    let label;
  
    try {
      label = await gmail.users.labels.get({ userId: 'me', id: labelName });
    } catch (err) {
      // Label doesn't exist, create it
      label = await gmail.users.labels.create({ userId: 'me', requestBody: { name: labelName } });
    }
  
    // Do something with the label
    console.log(`Label ${labelName} found or created`);
  }
  
  myFunction();
  





// Tag the email with the label:
// Now that we have the label, we can tag the email with it using the Gmail API. Add the following code to tag the email:
async function addLabelToEmail(gmail, message, labelName) {
    const label = await gmail.users.labels.get({ userId: 'me', id: labelName }).catch(async (err) => {
      // Label doesn't exist, create it
      return await gmail.users.labels.create({ userId: 'me', requestBody: { name: labelName } });
    });
  
    await gmail.users.messages.modify({
      userId: 'me',
      id: message.id,
      requestBody: { addLabelIds: [label.data.id] },
    });
  
    console.log(`Email tagged with label ${labelName}`);
  }
  

  

//   Wait for a random interval before repeating:
//   Finally, we need to wait for a random interval before repeating the sequence of steps. Add the following 
//   code to wait for a random interval between 45 and 120 seconds:
// const interval = Math.floor(Math.random() * 76) + 45;
// console.log(`Waiting for ${interval} seconds before repeating`);
// setTimeout(() => checkEmails(), interval * 1000);



// //Call the checkEmails function:
// // Now that we've defined the checkEmails function, we can call it to start the process. 
// // Add the following code at the end of the file to call the checkEmails function:

// checkEmails();