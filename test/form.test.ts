import { describe, expect, test } from "bun:test";
import { formLines } from "../src/form";

const plain = (_tone: "accent" | "muted", text: string) => text;

describe("formLines", () => {
  test("single question with selected option marked", () => {
    const details = {
      question: "Coffee or tea?",
      options: ["Coffee", "Tea"],
      multi: false,
      selectedOptions: ["Tea"],
    };
    expect(formLines(details, plain)).toEqual([
      "Coffee or tea?",
      "○ Coffee",
      "● Tea",
    ]);
  });

  test("accepts {label} option objects", () => {
    const details = {
      question: "Pick one",
      options: [{ label: "A" }, { label: "B" }],
      selectedOptions: ["A"],
    };
    expect(formLines(details, plain)).toEqual(["Pick one", "● A", "○ B"]);
  });

  test("multi-select uses checkbox markers per selection", () => {
    const details = {
      question: "Additions?",
      options: ["Milk", "Sugar", "Honey"],
      multi: true,
      selectedOptions: ["Milk", "Honey"],
    };
    expect(formLines(details, plain)).toEqual([
      "Additions?",
      "☑ Milk",
      "☐ Sugar",
      "☑ Honey",
    ]);
  });

  test("multiple questions render separated by a blank line", () => {
    const details = {
      results: [
        {
          id: "q1",
          question: "First?",
          options: ["A", "B"],
          selectedOptions: ["A"],
        },
        {
          id: "q2",
          question: "Second?",
          options: ["C"],
          multi: true,
          selectedOptions: [],
        },
      ],
    };
    expect(formLines(details, plain)).toEqual([
      "First?",
      "● A",
      "○ B",
      "",
      "Second?",
      "☐ C",
    ]);
  });

  test("tone marks selected vs unselected lines", () => {
    const details = {
      question: "Q",
      options: ["A", "B"],
      selectedOptions: ["B"],
    };
    const tones: string[] = [];
    formLines(details, (tone) => {
      tones.push(tone);
      return tone;
    });
    expect(tones).toEqual(["muted", "accent"]);
  });

  test("unknown or empty details render nothing", () => {
    expect(formLines(undefined, plain)).toEqual([]);
    expect(formLines({}, plain)).toEqual([]);
    expect(
      formLines({ question: "Q", options: [], selectedOptions: [] }, plain),
    ).toEqual(["Q"]);
  });
});
