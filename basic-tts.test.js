const tts = require("./basic-tts");
const utils = require("./utils");

const basicMockWindow = utils.basicMockWindow;

// beforeEach(() => {
//     jest.setTimeout(100000);
// });

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
        describe("window is", () => {
            const content = "window is undefined!";

            test("undefined", () => {
                utils.checkWarns(() => {
                    tts.enableTesting(undefined);
                    expect(tts.isSupported()).toBeFalsy();
                }, content);
            });

            test("not an object", () => {
                utils.checkWarns(() => {
                    tts.enableTesting(2);
                    expect(tts.isSupported()).toBeFalsy();
                }, content);
            });

        });

        describe("speechSynthesis is", () => {
            const content = "speechSynthesis is undefined!";

            test("undefined", () => {
                utils.checkWarns(() => {
                    tts.enableTesting({});
                    expect(tts.isSupported()).toBeFalsy();
                }, content);
            });

            test("not an object", () => {
                utils.checkWarns(() => {
                    tts.enableTesting({speechSynthesis: "foo"});
                    expect(tts.isSupported()).toBeFalsy();
                }, content);
            });

            describe("configured with getVoices that is", () => {
                const content = "speechSynthesis.getVoices is undefined!";

                test("undefined", () => {
                    utils.checkWarns(() => {
                        tts.enableTesting({speechSynthesis: {}});
                        expect(tts.isSupported()).toBeFalsy();
                    }, content);
                });

                test("not a function", () => {
                    utils.checkWarns(() => {
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
                utils.checkWarns(() => {
                    tts.enableTesting({
                        speechSynthesis: utils.basicMockSpeechSynthesis
                    });

                    expect(tts.isSupported()).toBeFalsy();
                }, content);
            });

            test("is not a function", () => {
                utils.checkWarns(() => {
                    tts.enableTesting({
                        speechSynthesis: utils.basicMockSpeechSynthesis,
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

describe("checkVoices", () => {
    describe("fails because", () => {
        test("unsupported", () => {
            tts.enableTesting(undefined);

            expect(() => {
                tts.checkVoices();
            }).toThrow("not supported");
        });

        describe("all attempts failed, with", () => {
            test("zero remaining", (done) => {
                return utils.checkCheckVoices(done, 0);
            });

            test("one remaining", (done) => {
                return utils.checkCheckVoices(done, 1);
            });
        });
    });

    describe("succeeds after", () => {
        const data = [1, 2];

        test("one try", (done) => {
            return utils.checkCheckVoices(done, 0, data);
        });

        test("two tries", (done) => {
            return utils.checkCheckVoices(done, 1, data);
        });
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
