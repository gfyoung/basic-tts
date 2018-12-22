const tts = require("../basic-tts");

/**
 * Wrapper around a test function to check `console.warns` content as well.
 *
 * @param {Function} fn - The test function to call.
 * @param stmts - The list of strings to check for membership in the content.
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

test("window undefined", () => {
    checkWarns(() => {
        tts.enableTesting(undefined);
        expect(tts.isSupported()).toBeFalsy();
    }, "window is undefined!");
});

test("window is not an object", () => {
    checkWarns(() => {
        tts.enableTesting(2);
        expect(tts.isSupported()).toBeFalsy();
    }, "window is undefined!");
});

test("speechSynthesis undefined", () => {
    checkWarns(() => {
        tts.enableTesting({});
        expect(tts.isSupported()).toBeFalsy();
    }, "speechSynthesis is undefined!");
});

test("speechSynthesis is not a function", () => {
    checkWarns(() => {
        tts.enableTesting({speechSynthesis: "foo"});
        expect(tts.isSupported()).toBeFalsy();
    }, "speechSynthesis is undefined!");
});

test("SpeechSynthesisUtterance undefined", () => {
    checkWarns(() => {
        tts.enableTesting({speechSynthesis: {},});
        expect(tts.isSupported()).toBeFalsy();
    }, "SpeechSynthesisUtterance is undefined!");
});

test("SpeechSynthesisUtterance is not a function", () => {
    checkWarns(() => {
        tts.enableTesting({
            speechSynthesis: {},
            SpeechSynthesisUtterance: [],
        });
        expect(tts.isSupported()).toBeFalsy();
    }, "SpeechSynthesisUtterance is undefined!");
});
