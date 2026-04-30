export const QUIZ_BANK = {
  Beginner: [
    {
      id: "b1",
      question: "How old must you be to vote in the US?",
      options: ["16", "18", "21", "25"],
      answer: "18",
      type: "multiple-choice",
      explanation: "The 26th Amendment lowered the voting age to 18 in 1971."
    },
    {
      id: "b2",
      question: "How often is the US presidential election held?",
      options: ["Every 2 years", "Every 4 years", "Every 6 years", "Every 8 years"],
      answer: "Every 4 years",
      type: "multiple-choice",
      explanation: "Presidential elections are held in years divisible by 4."
    },
    {
      id: "b3",
      question: "The US presidential election is always held on a Tuesday.",
      answer: "True",
      type: "true-false",
      explanation: "It is the Tuesday following the first Monday in November."
    }
  ],
  Intermediate: [
    {
      id: "i1",
      question: "How many Electoral College votes are needed to win the Presidency?",
      options: ["100", "270", "435", "538"],
      answer: "270",
      type: "multiple-choice",
      explanation: "270 is a simple majority of the 538 total electoral votes."
    },
    {
      id: "i2",
      question: "Which amendment gave women the right to vote?",
      options: ["15th", "19th", "22nd", "26th"],
      answer: "19th",
      type: "multiple-choice",
      explanation: "The 19th Amendment was ratified in 1920."
    }
  ],
  Advanced: [
    {
      id: "a1",
      question: "What happens if no candidate wins 270 electoral votes?",
      options: ["The Supreme Court decides", "The House of Representatives decides", "The Senate decides", "A new election is held"],
      answer: "The House of Representatives decides",
      type: "multiple-choice",
      explanation: "In this scenario, known as a 'contingent election', the House elects the President."
    }
  ]
};
