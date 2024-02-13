const { NlpManager } = require('node-nlp');
const express = require('express');
const app = express();
const path = require('path');

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set the directory for views
app.set('views', path.join(__dirname, 'views'));

// Define a route for the homepage
app.get('/', (req, res) => {
    // Render the homepage using the index.ejs template
    res.render('index', { pageTitle: 'Homepage' });
});

const manager = new NlpManager({ languages: ['en'], forceNER: true });

manager.load();
// Check if the model has been trained and saved before
const fs = require('fs');
const modelPath = './model.nlp';
if (fs.existsSync(modelPath)) {
    manager.load(modelPath);
} else {
    // If the model hasn't been trained and saved before, train it and save it
    const corpus = require('./corpus.json');
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
        await manager.save(modelPath);
    })();
}

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
