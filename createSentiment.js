// parsing NRC emotion lexicon text into JSON
const fs = require('fs');

// synchronously load in text file
const text = fs.readFileSync('./emotion-lexicon.txt', {encoding: 'utf-8'});

const data = {};
text.split('\n').forEach(t => {
  // for each line, format is
  // word \t emotion \t 0 or 1
  let [word, emotion, score] = t.split(/\t/g);
  score = parseInt(score);
  if (!score) return;
  if (!data[word]) {
    data[word] = [];
  }
  data[word].push(emotion);
});

fs.writeFileSync('./emotion-lexicon.json',
  JSON.stringify(data), {encoding: 'utf-8'});
