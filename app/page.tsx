"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Clock } from "lucide-react";

const sentences = [
  "The quick brown fox jumps over the lazy dog.",
  "A journey of a thousand miles begins with a single step.",
  "To be or not to be, that is the question.",
  "All that glitters is not gold.",
  "Actions speak louder than words.",
  "Where there's a will, there's a way.",
  "The early bird catches the worm.",
  "A picture is worth a thousand words.",
  "When in Rome, do as the Romans do.",
  "Practice makes perfect.",
  "Don't count your chickens before they hatch.",
  "Two wrongs don't make a right.",
  "The pen is mightier than the sword.",
  "When life gives you lemons, make lemonade.",
  "Knowledge is power.",
];

export default function MonkeytypeClone() {
  const [currentText, setCurrentText] = useState<string>("");
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [charIndex, setCharIndex] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [extraChars, setExtraChars] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [rawWpm, setRawWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const inputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const generateText = useCallback(() => {
    const shuffled = [...sentences].sort(() => 0.5 - Math.random());
    setCurrentText(shuffled.slice(0, 10).join(" "));
  }, []);

  useEffect(() => {
    generateText();
  }, [generateText]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (startTime && !isFinished) {
      interval = setInterval(() => {
        const elapsedTime = (Date.now() - startTime) / 60000; // time in minutes
        const calculatedWpm = Math.round(correctChars / 5 / elapsedTime);
        const calculatedRawWpm = Math.round(
          (correctChars + incorrectChars + extraChars) / 5 / elapsedTime
        );
        setWpm(calculatedWpm);
        setRawWpm(calculatedRawWpm);
        setTimeLeft((prev) => {
          const newTimeLeft = Math.max(
            0,
            30 - Math.round((Date.now() - startTime) / 1000)
          );
          if (newTimeLeft === 0) {
            setIsFinished(true);
            calculateResults();
          }
          return newTimeLeft;
        });
      }, 200); // Update more frequently for smoother display
    }
    return () => clearInterval(interval);
  }, [startTime, correctChars, incorrectChars, extraChars, isFinished]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setUserInput(inputValue);

    if (!startTime) {
      setStartTime(Date.now());
    }

    let correctCount = 0;
    let incorrectCount = 0;
    let extraCount = 0;

    for (let i = 0; i < inputValue.length; i++) {
      if (i < currentText.length) {
        if (inputValue[i] === currentText[i]) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      } else {
        extraCount++;
      }
    }

    setCorrectChars(correctCount);
    setIncorrectChars(incorrectCount);
    setExtraChars(extraCount);
    setCharIndex(inputValue.length);

    calculateAccuracy(correctCount, incorrectCount, extraCount);
  };

  const calculateAccuracy = (
    correct: number,
    incorrect: number,
    extra: number
  ) => {
    const totalAttempted = correct + incorrect + extra;
    const calculatedAccuracy =
      totalAttempted > 0 ? Math.round((correct / totalAttempted) * 100) : 100;
    setAccuracy(calculatedAccuracy);
  };

  const calculateResults = () => {
    if (startTime) {
      const endTime = Date.now();
      const timeInMinutes = (endTime - startTime) / 60000;
      const calculatedWpm = Math.round(correctChars / 5 / timeInMinutes);
      const calculatedRawWpm = Math.round(
        (correctChars + incorrectChars + extraChars) / 5 / timeInMinutes
      );
      setWpm(calculatedWpm);
      setRawWpm(calculatedRawWpm);
    }
  };

  const restartTest = () => {
    setUserInput("");
    setStartTime(null);
    setCharIndex(0);
    setCorrectChars(0);
    setIncorrectChars(0);
    setExtraChars(0);
    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    setIsFinished(false);
    setTimeLeft(30);
    generateText();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#323437] text-[#d1d0c5] p-4">
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Button
              onClick={restartTest}
              className="bg-transparent hover:bg-[#2c2e31] text-[#646669] p-2 rounded"
            >
              <RefreshCcw className="w-6 h-6" />
            </Button>
            <div className="flex items-center space-x-2 text-[#646669]">
              <Clock className="w-5 h-5" />
              <span className="text-xl">{timeLeft}s</span>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="text-3xl font-bold">
              {wpm}{" "}
              <span className="text-lg font-normal text-[#646669]">wpm</span>
            </div>
            <div className="text-3xl font-bold">
              {accuracy}%{" "}
              <span className="text-lg font-normal text-[#646669]">acc</span>
            </div>
          </div>
        </div>
        <div
          ref={textRef}
          className="mb-8 text-2xl leading-relaxed font-mono relative overflow-hidden h-32"
        >
          {currentText.split("").map((char, index) => (
            <span
              key={index}
              className={
                index < charIndex
                  ? char === userInput[index]
                    ? "text-[#d1d0c5]"
                    : "text-[#ca4754]"
                  : index === charIndex
                  ? "bg-[#d1d0c5] text-[#323437]"
                  : "text-[#646669]"
              }
            >
              {char}
            </span>
          ))}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          className="w-full p-4 text-2xl bg-[#2c2e31] border-none outline-none text-[#d1d0c5] rounded"
          placeholder="Start typing..."
          disabled={isFinished}
          autoFocus
        />
        {isFinished && (
          <div className="mt-8 p-6 bg-[#2c2e31] rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Test Results</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-[#646669]">WPM</p>
                <p className="text-3xl font-bold">{wpm}</p>
              </div>
              <div>
                <p className="text-[#646669]">Raw WPM</p>
                <p className="text-3xl font-bold">{rawWpm}</p>
              </div>
              <div>
                <p className="text-[#646669]">Accuracy</p>
                <p className="text-3xl font-bold">{accuracy}%</p>
              </div>
              <div>
                <p className="text-[#646669]">Characters</p>
                <p className="text-3xl font-bold">
                  {correctChars}/{correctChars + incorrectChars + extraChars}
                </p>
              </div>
            </div>
            <Button
              onClick={restartTest}
              className="w-full bg-[#e2b714] hover:bg-[#e2b714]/90 text-[#323437] py-2 rounded"
            >
              Retest
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
