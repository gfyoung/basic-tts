const tts = require("./basic-tts");

/**
 * Function that does nothing.
 */
const NOP = () => {};

const basicMockSpeechSynthesis = {
    getVoices: NOP,
    speak: NOP,
};

const basicMockWindow = {
    speechSynthesis: basicMockSpeechSynthesis,
    SpeechSynthesisUtterance: NOP,
};

class MockSpeechSynthesisUtterance {
    constructor(text) {
        this.voice = null;
        this.text = text;

        this.lang = "en-US";
        this.volume = -1;
        this.pitch = -1;
        this.rate = -1;

        this.onerror = NOP;
        this.onend = NOP;
    }
}

/**
 * Generate a mock Window instance with specific getVoices behavior.
 *
 * The mocked getVoices will return an empty array for `n` times,
 * after which it will return the provided data.
 *
 * @param {Number} n - The number of attempts before returning data.
 * @param {Object=} data - The data to return. Should have a length attribute.
 *     Otherwise, the input will be overwritten with an empty array.
 * @returns {Object}
 */
const getMockWindowWithAttempts = (n, data) => (
    {
        SpeechSynthesisUtterance: MockSpeechSynthesisUtterance,
        speechSynthesis: {
            getVoices: mockGetVoices(n, data),
            speak: NOP,
        }
    }
);

/**
 * Check that the properties of two utterances are equal.
 *
 * @param {SpeechSynthesisUtterance|MockSpeechSynthesisUtterance} utterance -
 *    The utterance to check.
 * @param {Object} props - The expected property values.
 */
const assertUtterancePropsEqual = (utterance, props) => {
    for (key of ["rate", "voice", "pitch", "text", "volume", "lang"]) {
        expect(utterance[key]).toEqual(props[key]);
    }
};

/**
 * Create a mock Window with a duck-typed utterance class.
 *
 * @param names - The names of the speakers to provide as data.
 * @returns {Object}
 */
const getMockWindowWithVoices = (...names) => (
    getMockWindowWithAttempts(0, names.map(name => (
        {name}
    )))
);

/**
 * Force an object to be an array-like.
 *
 * If the input does not have a length attribute, it will be
 * overwritten as an empty array.
 *
 * @param {Object} obj - The force to force to be an array.
 * @returns {Array}
 */
const forceAsArray = (obj) => {
    obj = obj || [];
    return "length" in obj ? obj : [];
};

/**
 * Check the behavior of checkVoices.
 *
 * If valid return data is provided, we expect no rejected Promises. If no
 * valid data is provided, we expected no resolved Promises.
 *
 * @param {Function} done - Jasmine function used indicating a finished test.
 * @param {Number} n - The number of attempts to retrieve voices.
 * @param {Object=} data - The data to return. Should have a length attribute.
 *     Otherwise, the input will be overwritten with an empty array.
 * @returns {Promise}
 */
const checkCheckVoices = (done, n, data) => {
    data = forceAsArray(data);

    tts.enableTesting(getMockWindowWithAttempts(n, data));

    return tts.checkVoices(n).then((result) => {
        if (data.length === 0) {
            done(new Error(`Unexpected data received: ${result}`));
        } else {
            expect(result.voices).toEqual(data);
            done();
        }
    }).catch((err) => {
        if (data.length === 0) {
            expect(err).toEqual({
                msg: "No voices available for use."
            });

            done();
        } else {
            done(new Error(`Unexpected error: ${JSON.stringify(err)}`));
        }
    });
};

/**
 * Wrapper around test functions to check `console.warns` content.
 *
 * @param {Function} fn - The test function to call.
 * @param stmts - List of strings to check in log content.
 */
const checkWarns = (fn, ...stmts) => {
    const log = [];
    const original = console.warn;

    global.console.warn = (content) => {
        log.push(content);
    };

    fn();

    for (const stmt of stmts) {
        expect(log).toContain(stmt);
    }

    global.console.warn = original;
};

/**
 * Mock getting voices and returning data after a certain number of attempts.
 *
 * @param {Number} n - The number of attempts before returning data.
 * @param {Object=} data - The data to return. Should have a length attribute.
 *     Otherwise, the input will be overwritten with an empty array.
 * @returns {Function}
 */
const mockGetVoices = (n, data) => {
    data = forceAsArray(data);

    let counter = 0;

    return () => {
        if (counter < n) {
            counter++;
            return [];
        } else {
            return data;
        }
    };
};

module.exports = {
    NOP,
    basicMockSpeechSynthesis,
    basicMockWindow,
    getMockWindowWithVoices,
    getMockWindowWithAttempts,
    assertUtterancePropsEqual,
    checkCheckVoices,
    checkWarns,
};
