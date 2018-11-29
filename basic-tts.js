const tts = (() => {
    const isSupported = () => (
        (typeof(window) !== "undefined" && "speechSynthesis" in window
            && "SpeechSynthesisUtterance" in window)
    );

    const rejectWithMsg = (reject, msg) => {
        reject({ msg });
    }

    const checkVoices = () => {
        return new Promise((resolve, reject) => {
            if (!isSupported()) {
                rejectWithMsg(reject, "Text-to-speech is not supported!");
            }

            setTimeout(() => {
                const voices = speechSynthesis.getVoices();

                if (voices.length === 0) {
                    rejectWithMsg(reject, "No voices available for use.");
                } else {
                    resolve({
                        voices
                    });
                }
            }, 100);
        })
    };

    class Speaker {
        constructor(props) {
            if (!isSupported()) {
                throw "Text-to-speech is not supported!";
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
                    return null;
                }

                utterance.voice = speakerVoice;
            }

            return utterance
        }

        speak(text) {
            const self = this;

            return new Promise((resolve, reject) => {
                checkVoices().then(() => {
                    const utterance = self.getUtterance(text);

                    if (!utterance) {
                        rejectWithMsg(reject, "Speech could not be initialized due to invalid voice");
                    }

                    utterance["onend"] = resolve;
                    utterance["onerror"] = () => {
                        rejectWithMsg(reject, "Unable to speak the provided text");
                    };

                    self._speaker.speak(utterance);
                }).catch((err) => {
                    rejectWithMsg(reject, err.msg);
                })
            });
        }
    }

    const createSpeaker = (props) => (
        new Speaker(props)
    );

    return {
        checkVoices,
        isSupported,
        createSpeaker,
    }
})();

if (typeof(module) !== "undefined") {
    module.exports = tts;
}
