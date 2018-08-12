// go through each song, and each line
// and for every word that's in the emotion-lexicon
// add a 1 to the emotions of that line

const fs = require('fs');
const _ = require('lodash');

// load in song lyrics
let lyrics = fs.readFileSync('./lyrics.json', {encoding: 'utf-8'});
lyrics = JSON.parse(lyrics);
// load in emotion lexicon
let emotionsLex = fs.readFileSync('./emotion-lexicon.json', {encoding: 'utf-8'})
emotionsLex = JSON.parse(emotionsLex);

const songs = _.chain(lyrics)
  .map(song => {
    if (!song.album) return;

    let totalCount = 0;
    const lyrics = _.chain(song.lyrics.split('\n'))
      .map(line => {
        let words = line.match(/(\w+)/g);
        if (!words) return;

        // remember number of words in the line
        const count = words.length;
        // add that count to the total num of words in the song
        totalCount += count;

        // go through array of words, and remember emotions
        // filter out words that didn't match emotions
        words = _.chain(words)
          .map(word => {
            if (!emotionsLex[word]) return;
            return {word, emotions: emotionsLex[word]};
          }).filter().value();

        const emotions = _.chain(words).map('emotions').flatten().countBy().value();
        const normalized = _.reduce(emotions, (obj, numWords, emotion) => {
          // absolute number of this emotion divided by total num words in the line
          obj[emotion] = numWords / count;
          return obj;
        }, {})

        return {
          line, words, count,
          emotions, normalized,
        }
      }).filter().value();

    const emotions = _.chain(lyrics).map('emotions')
      .reduce((obj, emotions) => {
        // object of emotions, key: emotion, val: sum across the lines
        _.each(emotions, (val, emotion) => {
          if (!obj[emotion]) {
            obj[emotion] = 0;
          }
          obj[emotion] += val;
        });
        return obj;
      }, {}).value();

    const normalized = _.reduce(emotions, (obj, numWords, emotion) => {
      obj[emotion] = numWords / totalCount;
      return obj;
    }, {});

    return Object.assign(song, {
      lyrics,
      totalCount,
      emotions, normalized,
    });
  }).filter().value();

fs.writeFileSync(`./all_songs.json`, JSON.stringify(songs),
  {encoding: 'utf-8'});
