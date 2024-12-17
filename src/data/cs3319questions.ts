export type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  year?: string;
};

export const cs3319Questions: QuizQuestion[] = [
  {
    id: 1,
    question: "In Mandatory security, a top secret user can write to an unclassified table.",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation: "In mandatory security, users with higher clearance levels cannot write to objects with lower classification levels to prevent information leakage (known as the 'no write down' rule).",
    category: "Security",
    difficulty: "medium"
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
    explanation: "'Secure' is not a standard classification level in mandatory security. The standard levels are typically: Top Secret, Secret, Confidential, and Unclassified.",
    category: "Security",
    difficulty: "easy"
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
    explanation: "All options except C are common methods for preventing statistical database inference. Limiting to only AVERAGE and COUNT would still allow for potential inference attacks.",
    category: "Database Security",
    difficulty: "hard"
  },
  {
    id: 4,
    question: "When doing queries with a distributed database, where the fragments must be moved in order to complete the query, the way the system moves the fragments can greatly influence the speed of the query.",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "The strategy for moving fragments in distributed databases significantly impacts query performance, as data transfer between sites is often the bottleneck.",
    category: "Distributed Databases",
    difficulty: "medium"
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
    explanation: "A semijoin optimizes distributed joins by only moving the joining attributes first, reducing data transfer between sites.",
    category: "Distributed Databases",
    difficulty: "hard"
  },
  {
    id: 6,
    question: "A database that is stored in a centralized location but allows access to its' data from nodes all over the world is a distributed database.",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation: "This describes a centralized database with network access, not a distributed database. A distributed database has its data physically distributed across multiple locations.",
    category: "Distributed Databases",
    difficulty: "easy",
    year: "Summer 2000"
  },
  {
    id: 7,
    question: "If a committed transaction's updated data is not restored after a crash, then the property violated is:",
    options: [
      "Atomicity",
      "Consistency",
      "Isolation",
      "Durability"
    ],
    correctAnswer: 3,
    explanation: "Durability ensures that once a transaction is committed, its changes must persist even in the event of a system crash.",
    category: "ACID Properties",
    difficulty: "medium",
    year: "Summer 2000"
  },
  {
    id: 8,
    question: "If user A owns table X and user A gives BOTH users B and C permission to select from table X with grant option. Then users B and C BOTH give user D permission to select from table X, then user A revokes user B's privilege to select. Which users can still select from table X",
    options: [
      "User A, User B, User C, User D",
      "User A, User C, User D",
      "User A, User C",
      "User A Only"
    ],
    correctAnswer: 1,
    explanation: "When a privilege is revoked, it only affects the direct grant path. Since user D also received permission from user C, they retain access even after user B's privileges are revoked.",
    category: "Security",
    difficulty: "hard",
    year: "Summer 2000"
  },
  {
    id: 9,
    question: "Which of the following is NOT one of the 5 basic relational algebra operations?",
    options: [
      "Projection",
      "Selection",
      "Difference",
      "Cartesian Product",
      "Natural Join"
    ],
    correctAnswer: 4,
    explanation: "Natural Join is not one of the five basic relational algebra operations. The basic operations are: Selection, Projection, Union, Set Difference, and Cartesian Product.",
    category: "Relational Algebra",
    difficulty: "medium",
    year: "Summer 2000"
  },
  {
    id: 10,
    question: "There is a view/table in the system catalog in DB2 that contains the names of all the fields in the entire database",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "DB2's system catalog contains metadata tables including SYSCOLUMNS which stores information about all columns (fields) in the database.",
    category: "DB2",
    difficulty: "easy",
    year: "Summer 2000"
  },
  {
    id: 11,
    question: "There is a view/table in the system catalog in DB2 that contains the names of all the views and tables in the database including it's own name",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "The SYSTABLES view in DB2's system catalog contains information about all tables and views, including itself.",
    category: "DB2",
    difficulty: "easy",
    year: "Summer 2000"
  },
  {
    id: 12,
    question: "A database management system that uses locking does not need to worry about handling deadlock situations BUT it must handle livelock situations.",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation: "This is false. Systems using locking must handle both deadlock and livelock situations. Deadlocks can occur when multiple transactions are waiting for locks held by each other.",
    category: "Concurrency",
    difficulty: "medium",
    year: "Summer 2000"
  }
];
