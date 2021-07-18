import { autoCast } from './src/utils';

describe('fitbit-settings/utils', () => {
    test('autoCast() converts string booleans to booleans', () => {
        expect(autoCast("true")).toBe(true);
        expect(autoCast("false")).toBe(false);
    });

    test('autoCast() converts colors to normal strings', () => {
        // Names of Colors
        expect(autoCast("\"aquamarine\"")).toBe("aquamarine");
        expect(autoCast("\"tomato\"")).toBe("tomato");
        expect(autoCast("\"deepskyblue\"")).toBe("deepskyblue");

        // Short Color Hexs
        expect(autoCast("\"#fff\"")).toBe("#fff");
        expect(autoCast("\"#1ddef6\"")).toBe("#1ddef6");
    });
});