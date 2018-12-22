"use strict";

const tts = (() => {
    let testWindow;
    let testingEnabled = false;

    /**
     * Enable test mode.
     *
     * @param {Object=} mockWindow - The mock window object.
     */
    const enableTesting = (mockWindow) => {
        testWindow = mockWindow;
        testingEnabled = true;
    };

    /**
     * Disable test mode and return to production mode.
     */
    const disableTesting = () => {
        testWindow = null;
        testingEnabled = false;
    };

    /**
     * Check if we're in test mode or not.
     *
     * @returns {Boolean}
     */
    const isTestingEnabled = () => (
        testingEnabled
    );

    /**
     * Get the window object, depending on whether we're in test mode or not.
     *
     * @returns {Window}
     */
    const getWindow = () => (
        isTestingEnabled() ? testWindow : window
    );

    /**
     * Check if text-to-speech is supported.
     *
     * @returns {Boolean} - Whether text-to-speech is supported.
     */
    const isSupported = () => {
        const window = getWindow();

        if (typeof(window) !== "object") {
            console.warn("window is undefined!");
            return false;
        }

        if (typeof(window.speechSynthesis) !== "object") {
            console.warn("speechSynthesis is undefined!");
            return false;
        }

        if (typeof(window.speechSynthesis.getVoices) !== "function") {
            console.warn("speechSynthesis.getVoices is undefined!");
            return false;
        }

        if (typeof(window.SpeechSynthesisUtterance) !== "function") {
            console.warn("SpeechSynthesisUtterance is undefined!");
            return false;
        }

        return true;
    };

    /**
     * Check if text-to-speech is supported and error if it's not.
     */
    const errOnUnsupported = () => {
        if (!isSupported()) {
            throw "Text-to-speech is not supported!";
        }
    };

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
                const voices = getWindow().speechSynthesis.getVoices();

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
        errOnUnsupported();

        const defaultAttempts = 10;
        attempts = Math.min(Math.max(attempts ||
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
         * @param {Object=} props - A dictionary of properties for our
         *     SpeechSynthesisUtterance class.
         */
        constructor(props) {
            errOnUnsupported();

            this._props = props || {};
            this._window = getWindow();
            this._speaker = this._window.speechSynthesis;
        }

        /**
         * Construct our SpeechSynthesisUtterance for speaking.
         *
         * @param {String} text - The text to speak.
         * @returns {SpeechSynthesisUtterance}
         */
        getUtterance(text) {
            const utterance = new this._window.SpeechSynthesisUtterance(text);

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
     * @param {Object=} props - A dictionary of properties for our
     *     SpeechSynthesisUtterance class.
     * @returns {Speaker}
     */
    const createSpeaker = (props) => (
        new Speaker(props)
    );

    return {
        // Main methods.
        checkVoices,
        isSupported,
        createSpeaker,

        // Test methods.
        enableTesting,
        disableTesting,
        isTestingEnabled,
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
