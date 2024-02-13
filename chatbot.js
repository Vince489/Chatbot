const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['en'] });

// Train and save the model using corpus.json
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
    manager.save('new');
    const response = await manager.process('en', 'can i join');
    console.log(response.answer);
})();


