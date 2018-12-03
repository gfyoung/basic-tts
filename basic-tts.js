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

    const loadVoices = () => {
        return new Promise((resolve, reject) => {
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

    /**
     * Check that we have voices available for speaking.
     *
     * @param {Number=} attempts - The number of attempts to retrieve
     *     voices. The default is 10 times.
     * @returns {Promise}
     */
    const checkVoices = (attempts) => {
        if (isSupported()) {
            throw "Text-to-speech is not supported!";
        }

        const defaultAttempts = 10;
        attempts = Math.min(Math.max(parseInt(attempts) ||
            defaultAttempts, 0), defaultAttempts);

        return loadVoices().catch((err) => {
            if (attempts === 0) {
                throw err;
            } else {
                return checkVoices(attempts - 1);
            }
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
         * @param {Number=} attempts - The number of attempts to retrieve
         *     voices before attempting to speak.
         * @returns {Promise}
         */
        speak(text, attempts) {
            const self = this;

            return new Promise((resolve, reject) => {
                checkVoices(attempts).then(() => {
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
//
// One of the following define calls should work.
if (typeof(define) === "function" && define.amd) {
    define("basic-tts", [], () => {
        return tts;
    });

    define([], () => {
        return tts;
    });
}
