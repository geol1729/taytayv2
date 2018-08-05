// go through each song, and each line
// and for every word that's in the emotion-lexicon
// add a 1 to the emotions of that line

const fs = require('fs');
const _ = require('lodash');

// load in song lyrics
let lyrics = fs.readFileSync('./lyrics.json', {encoding: 'utf-8'});
lyrics = JSON.parse(lyrics);
// load in emotion lexicon
let emotions = fs.readFileSync('./emotion-lexicon.json', {encoding: 'utf-8'})
emotions = JSON.parse(emotions);

const songs = _.chain(lyrics)
  .map(song => {
    if (!song.album) return;
    const lyrics = _.chain(song.lyrics.split('\n'))
      .map(line => {
        let words = line.match(/(\w+)/g);
        if (!words) return;
        // go through array of words, and remember emotions
        words = _.chain(words)
          .map(word => {
            if (!emotions[word]) return;
            return {word, emotions: emotions[word]};
          }).filter().value();

        return {
          line, words,
          emotions: _.chain(words).map('emotions').flatten().countBy().value(),
        }
      }).filter().value();

    return Object.assign(song, {
      lyrics,
      emotions: _.chain(lyrics).map('emotions')
        .reduce((obj, emotions) => {
          // object of emotions, key: emotion, val: sum across the lines
          _.each(emotions, (val, emotion) => {
            if (!obj[emotion]) {
              obj[emotion] = 0;
            }
            obj[emotion] += val;
          });
          return obj;
        }, {}).value()
    });
  }).filter().value();

fs.writeFileSync(`./all_songs.json`, JSON.stringify(songs),
  {encoding: 'utf-8'});
