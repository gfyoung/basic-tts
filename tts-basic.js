if (!(window && window.speechSynthesis)) {
    throw "Text-to-speech is not defined!";
}

window.speechSynthesis.onvoiceschanged = () => {
    class Speaker {
        constructor(props) {
            this._props = props || {};
            this._speaker = window.speechSynthesis;
        }

        getUtterance(text) {
            const utterance = new SpeechSynthesisUtterance(text);

            for (const key of ["lang", "volume", "pitch", "rate"]) {
                const value = utterance[key];
                utterance[key] = this._props[key] || value;
            }

            if (this._props["voice"]) {
                const propVoice = this._props["voice"];
                let speakerVoice;

                for (const voice of this._speaker.getVoices()) {
                    if (voice.name === propVoice) {
                        speakerVoice = voice;
                        break;
                    }
                }

                if (speakerVoice === undefined) {
                    throw `No voice found with voice: ${propVoice}`;
                }

                utterance.voice = speakerVoice;
            }

            return utterance
        }

        speak(text) {
            const utterance = this.getUtterance(text);
            const self = this;

            return new Promise((resolve, reject) => {
                utterance["onend"] = resolve;
                utterance["onerror"] = reject;

                self._speaker.speak(utterance);
            });
        }
    };

    const speak = () => {
        const speaker = new Speaker({
            voice: "Google US English",
            lang: "en-US",
            volume: 1,
            pitch: 1,
            rate: 1
        });

        speaker.speak("Hello! This is text to speech").then(() => {
            console.log("The speaker has spoken!");
        }).catch(() => {
            console.log("Sigh...the speaker did not speak :(");
        });
    };

    const button = document.getElementById("activate");
    button.onclick = speak;

    console.log("READY!");
    console.log(window.speechSynthesis.getVoices());
    window.speechSynthesis.onvoiceschanged = () => {};
};