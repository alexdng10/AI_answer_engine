export type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
};

export const cs3319Questions: QuizQuestion[] = [
  {
    id: 1,
    question: "In Mandatory security, a top secret user can write to an unclassified table.",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation: "In mandatory security, users with higher clearance levels cannot write to objects with lower classification levels to prevent information leakage (known as the 'no write down' rule)."
  },
  {
    id: 2,
    question: "In Mandatory security, which of the following is not a type of classification?",
    options: [
      "Top Secret",
      "Secret",
      "Secure",
      "Confidential"
    ],
    correctAnswer: 2,
    explanation: "'Secure' is not a standard classification level in mandatory security. The standard levels are typically: Top Secret, Secret, Confidential, and Unclassified."
  },
  {
    id: 3,
    question: "Which of the following is not a method for handling leaks of information via Statistical Database Queries",
    options: [
      "Limit queries if the result returns a value less than a certain threshold",
      "Limit repeated queries that refer to the same tuples",
      "Limit users to only use the aggregate functions: AVERAGE and COUNT but not any of the other aggregate ones such as MIN, MAX, etc…",
      "Introduce \"noise\" (inaccuracies) into results to make it difficult to deduce individual information"
    ],
    correctAnswer: 2,
    explanation: "All options except C are common methods for preventing statistical database inference. Limiting to only AVERAGE and COUNT would still allow for potential inference attacks."
  },
  {
    id: 4,
    question: "When doing queries with a distributed database, where the fragments must be moved in order to complete the query, the way the system moves the fragments can greatly influence the speed of the query.",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "The strategy for moving fragments in distributed databases significantly impacts query performance, as data transfer between sites is often the bottleneck."
  },
  {
    id: 5,
    question: "When doing a join between table A at Site A and table B at Site B, a Semijoin involves:",
    options: [
      "Only move the joining attribute from one of the tables at one Site to the other Site",
      "Always move the entire table at one Site to the other Site",
      "Move the first half of the table at one Site to the other Site, do the join and then move the rest of the table at the one Site to the other Site and finish the join",
      "Moving both tables to a third Site, doing the join there and then moving the result back to either Site A or Site B"
    ],
    correctAnswer: 0,
    explanation: "A semijoin optimizes distributed joins by only moving the joining attributes first, reducing data transfer between sites."
  }
];
