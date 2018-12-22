const tts = require("../basic-tts");

afterEach(() => {
    tts.disableTesting();
});

describe("isSupported", () => {
    describe("returns false because", () => {
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

        describe("window is", () => {
            const content = "window is undefined!";

            test("undefined", () => {
                checkWarns(() => {
                    tts.enableTesting(undefined);
                    expect(tts.isSupported()).toBeFalsy();
                }, content);
            });

            test("not an object", () => {
                checkWarns(() => {
                    tts.enableTesting(2);
                    expect(tts.isSupported()).toBeFalsy();
                }, content);
            });

        });

        describe("speechSynthesis is", () => {
            const content = "speechSynthesis is undefined!";

            test("undefined", () => {
                checkWarns(() => {
                    tts.enableTesting({});
                    expect(tts.isSupported()).toBeFalsy();
                }, content);
            });

            test("not an object", () => {
                checkWarns(() => {
                    tts.enableTesting({speechSynthesis: "foo"});
                    expect(tts.isSupported()).toBeFalsy();
                }, content);
            });
        });

        describe("SpeechSynthesisUtterance is", () => {
            const content = "SpeechSynthesisUtterance is undefined!";

            test("undefined", () => {
                checkWarns(() => {
                    tts.enableTesting({speechSynthesis: {},});
                    expect(tts.isSupported()).toBeFalsy();
                }, content);
            });

            test("is not a function", () => {
                checkWarns(() => {
                    tts.enableTesting({
                        speechSynthesis: {},
                        SpeechSynthesisUtterance: [],
                    });
                    expect(tts.isSupported()).toBeFalsy();
                }, content);
            });
        });
    });

    test("returns true", () => {
        tts.enableTesting({
            speechSynthesis: {}, SpeechSynthesisUtterance: () => {}
        });

        expect(tts.isSupported()).toBeTruthy();
    });
});

describe("testing framework is", () => {
    test("disabled by default", () => {
        expect(tts.isTestingEnabled()).toBeFalsy();
    });

    test("disabled when already default disabled", () => {
        tts.disableTesting();
        expect(tts.isTestingEnabled()).toBeFalsy();
    });

    test("enabled", () => {
        tts.enableTesting();
        expect(tts.isTestingEnabled()).toBeTruthy();
    });

    test("enabled, then disabled", () => {
        tts.enableTesting();
        tts.disableTesting();

        expect(tts.isTestingEnabled()).toBeFalsy();
    });

    test("enabled, disabled, and then re-enabled", () => {
        tts.enableTesting();
        tts.disableTesting();
        tts.enableTesting();

        expect(tts.isTestingEnabled()).toBeTruthy();
    });
});
