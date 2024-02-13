const { NlpManager } = require('node-nlp');
const corpus = require('./corpus.json');

// Create a new instance of NlpManager
const manager = new NlpManager({ languages: ['en'], forceNER: true });

// Check if the model has been trained and saved before
const fs = require('fs');
const modelPath = './model.nlp';
if (fs.existsSync(modelPath)) {
    manager.load(modelPath);
} else {
    // If the model hasn't been trained and saved before, train it and save it
    corpus.data.forEach(intent => {
        intent.utterances.forEach(utterance => {
            manager.addDocument('en', utterance, intent.intent);
        });
        intent.answers.forEach(answer => {
            manager.addAnswer('en', intent.intent, answer);
        });
    });
    await manager.train();
    await manager.save(modelPath);
}

// Process a sample text
const response = await manager.process('en', `I'm gone`);
console.log(response);
