[![Build Status](https://travis-ci.com/gfyoung/basic-tts.svg?branch=master)](https://travis-ci.com/gfyoung/basic-tts)

# basic-tts

Basic wrapper around the [Speech Synthesis API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis).

This is a bare-bones wrapper with no dependencies besides a browser that supports text-to-speech.
Installation is relatively straightforward via [NPM Package Registry](https://github.com/gfyoung/basic-tts):

~~~
npm install basic-tts
~~~

Afterwards, you can check the support of your browser in Node, for example, as follows:

```javascript
const tts = require("basic-tts");
console.log(tts.isSupported());
```

The repository also contains a demo HTML file ([demo.html](https://github.com/gfyoung/basic-tts/blob/master/demo.html)) where you can also
see whether your browser supports text-to-speech. If it does, you can then see
the package in action.
