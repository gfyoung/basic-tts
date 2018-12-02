"use strict";

const tts = (() => {
    /**
     * Check if text-to-speech is supported.
     *
     * @returns {Boolean} - Whether text-to-speech is supported.
     */
    const isSupported = () => (
        (typeof(window) !== "undefined" && "speechSynthesis" in window
            && "SpeechSynthesisUtterance" in window)
    );

    /**
     * Simple wrapper around a reject function for a Promise.
     *
     * @param {Function} reject - The Promise rejection function.
     * @param {String} msg - The message to send.
     */
    const rejectWithMsg = (reject, msg) => {
        reject({ msg });
    };

    /**
     * Check that we have voices available for speaking.
     *
     * @returns {Promise}
     */
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
        });
    };

    class Speaker {
        /**
         * Construct a new speaker instance.
         *
         * @param {Object} props - A dictionary of properties for our
         *     SpeechSynthesisUtterance class.
         */
        constructor(props) {
            if (!isSupported()) {
                throw "Text-to-speech is not supported!";
            }

            this._props = props || {};
            this._speaker = window.speechSynthesis;
        }

        /**
         * Construct our SpeechSynthesisUtterance for speaking.
         *
         * @param {String} text - The text to speak.
         * @returns {SpeechSynthesisUtterance}
         */
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

            return utterance;
        }

        /**
         * Speak a piece of text.
         *
         * @param {String} text - The text to speak.
         * @returns {Promise}
         */
        speak(text) {
            const self = this;

            return new Promise((resolve, reject) => {
                checkVoices().then(() => {
                    const utterance = self.getUtterance(text);

                    if (!utterance) {
                        rejectWithMsg(reject, "Speech could not be " +
                            "initialized due to invalid voice");
                    }

                    utterance["onend"] = resolve;
                    utterance["onerror"] = () => {
                        rejectWithMsg(reject, "Unable to speak " +
                            "the provided text");
                    };

                    self._speaker.speak(utterance);
                }).catch((err) => {
                    rejectWithMsg(reject, err.msg);
                });
            });
        }
    }

    /**
     * Convenience function for initialization our Speaker class.
     *
     * Doing this places an abstraction layer above the Speaker class, giving
     * us freedom to modify however we want without disrupting end-user code.
     *
     * @param {Object} props - A dictionary of properties for our
     *     SpeechSynthesisUtterance class.
     * @returns {Speaker}
     */
    const createSpeaker = (props) => (
        new Speaker(props)
    );

    return {
        checkVoices,
        isSupported,
        createSpeaker,
    };
})();

// Node.
if (typeof(module) === "object" && typeof(module.exports) === "object") {
    module.exports = tts;
}

// AMD.
if (typeof(define) === "function" && define.amd) {
    define("basic-tts", [], () => {
        return tts;
    });
}
