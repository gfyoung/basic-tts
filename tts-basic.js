const tts = (() => {
    const isSupported = () => (
        (typeof(window) !== "undefined" && "speechSynthesis" in window
            && "SpeechSynthesisUtterance" in window)
    );

    class Speaker {
        constructor(props) {
            if (!isSupported()) {
                throw "Text-to-speech is not defined!";
            }

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
    }

    const createSpeaker = (props) => (
        new Speaker(props)
    );

    return {
        isSupported,
        createSpeaker,
    }
})();

if (typeof(module) !== "undefined") {
    module.exports = tts;
}
