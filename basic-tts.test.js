const tts = require("../basic-tts");

/**
 * Function that does nothing.
 */
const NOP = () => {};

const basicMockSpeechSynthesis = {getVoices: NOP};

const basicMockWindow = {
    speechSynthesis: basicMockSpeechSynthesis,
    SpeechSynthesisUtterance: NOP,
};

afterEach(() => {
    tts.disableTesting();
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

            describe("configured with getVoices that is", () => {
                const content = "speechSynthesis.getVoices is undefined!";

                test("undefined", () => {
                    checkWarns(() => {
                        tts.enableTesting({speechSynthesis: {}});
                        expect(tts.isSupported()).toBeFalsy();
                    }, content);
                });

                test("not a function", () => {
                    checkWarns(() => {
                        tts.enableTesting({
                            speechSynthesis: {
                                getVoices: 2
                            }
                        });

                        expect(tts.isSupported()).toBeFalsy();
                    }, content);
                });
            });
        });

        describe("SpeechSynthesisUtterance is", () => {
            const content = "SpeechSynthesisUtterance is undefined!";

            test("undefined", () => {
                checkWarns(() => {
                    tts.enableTesting({
                        speechSynthesis: basicMockSpeechSynthesis
                    });

                    expect(tts.isSupported()).toBeFalsy();
                }, content);
            });

            test("is not a function", () => {
                checkWarns(() => {
                    tts.enableTesting({
                        speechSynthesis: basicMockSpeechSynthesis,
                        SpeechSynthesisUtterance: [],
                    });
                    expect(tts.isSupported()).toBeFalsy();
                }, content);
            });
        });
    });

    test("returns true", () => {
        tts.enableTesting(basicMockWindow);
        expect(tts.isSupported()).toBeTruthy();
    });
});

describe("createSpeaker", () => {
    test("fails because unsupported", () => {
        tts.enableTesting(undefined);
        expect(() => {
            tts.createSpeaker();
        }).toThrow("not supported");
    });

    describe("succeeds with", () => {
        test("no props", () => {
            tts.enableTesting(basicMockWindow);
            const speaker = tts.createSpeaker();

            expect(speaker._props).toEqual({});
            expect(speaker._window).toEqual(basicMockWindow);
            expect(speaker._speaker).toEqual(basicMockWindow.speechSynthesis);
        });

        test("props", () => {
            tts.enableTesting(basicMockWindow);

            const props = {count: 3, value: 5, length: 8};
            const speaker = tts.createSpeaker(props);

            expect(speaker._props).toEqual(props);
            expect(speaker._window).toEqual(basicMockWindow);
            expect(speaker._speaker).toEqual(basicMockWindow.speechSynthesis);
        });
    });
});
