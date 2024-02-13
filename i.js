const { NlpManager } = require('node-nlp');
const express = require('express');
const app = express();

const manager = new NlpManager({ languages: ['en'], forceNER: true });

// Train and save the model using corpus.json
const corpus = require('./corpus2.json');
corpus.data.forEach(intent => {
    intent.utterances.forEach(utterance => {
        manager.addDocument('en', utterance, intent.intent);
    });
    intent.answers.forEach(answer => {
        manager.addAnswer('en', intent.intent, answer);
    });
});

(async() => {
    await manager.train();
    manager.save('new');
})();

// Route for handling requests to /bot endpoint
app.get('/bot', async (req, res) => {
    try {
        // Process the text query sent as a query parameter named 'text'
        const response = await manager.process('en', req.query.text);
        // Send the response back to the client
        res.json(response.answer);
    } catch (error) {
        // If there's an error, send an error response
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the Express server

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});