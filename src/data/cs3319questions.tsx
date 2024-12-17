import React from 'react';
import WomanDatabaseTables from '@/components/WomanDatabaseTables';
import DynamicTable from '@/components/DynamicTable';
export type QuizQuestion = {
  id: number;
  question: string | JSX.Element;
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
    id: 13,
    question: "A database management system that uses locking does not need to worry about handling deadlock situations BUT it must handle livelock situations.",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation: "This is false. Systems using locking must handle both deadlock and livelock situations. Deadlocks can occur when multiple transactions are waiting for locks held by each other.",
    category: "Concurrency",
    difficulty: "medium",
    year: "Summer 2000"
  },
  {
    id: 14,
    question: "Any schedule where all transactions use Binary Locking is guaranteed to be:",
    options: [
      "Deadlock Free",
      "Conflict Equivalent to a Serial Schedule",
      "Both of the above",
      "Neither of the above"
    ],
    correctAnswer: 1,
    explanation: "Binary locking ensures conflict serializability (conflict equivalent to a serial schedule) but does not guarantee freedom from deadlocks.",
    category: "Concurrency",
    difficulty: "hard",
    year: "Summer 2000"
  },
  {
    id: 15,
    question: "If you have 10,000 electronics customer records and of those 10,000 customers, only 100 customers have a record player with a serial number identifying the record player, what is the best way to store this attribute assuming that the number of customers with record players will probably not grow?",
    options: [
      "Have an attribute in the customer table called recordplayerID",
      "Create a new table called CustomerOwnsRecordPlayer that contains the CustomerID and the RecordPlayerID",
      "Neither of the above 2 choices is better than the other choice"
    ],
    correctAnswer: 1,
    explanation: "Creating a separate table is better for sparse attributes as it saves storage space and maintains data organization. This follows database normalization principles.",
    category: "Database Design",
    difficulty: "medium",
    year: "Summer 2000"
  },
  {
    id: 16,
    question: "VideoID, CustomerID → VideoTitle is a partial functional dependency.",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation: "This is not a partial functional dependency because VideoID alone determines VideoTitle. CustomerID is not needed for this dependency.",
    category: "Functional Dependencies",
    difficulty: "medium",
    year: "Summer 2000"
  },
  {
    id: 17,
    question: "There is more than one way to put a table with non atomic values into first normal form, thus if you put the table into first normal form one way, and another person put the same table into first normal form another way, you might end up with a different number of tables.",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "This is true. First normal form (1NF) can be achieved in multiple ways when dealing with non-atomic values, potentially resulting in different numbers of tables while still maintaining the same data integrity.",
    category: "Normalization",
    difficulty: "medium",
    year: "Summer 2000"
  },
  {
    id: 18,
    question: "If the table contains only one candidate key, 3NF and BCNF are equivalent",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "This is true. When a table has only one candidate key, the definitions of Third Normal Form (3NF) and Boyce-Codd Normal Form (BCNF) become equivalent.",
    category: "Normalization",
    difficulty: "hard",
    year: "Summer 2000"
    
  },
  {
    id: 19,
    question: "The lossless join property:",
    options: [
      "guarantees we don't have extra tuples when we join relations",
      "guarantees we don't lose any tuples when we join relations",
      "reduces the need for joining tables",
      "a and c",
      "b and c"
    ],
    correctAnswer: 0,
    explanation: "The lossless join property ensures that when we decompose a relation and then rejoin it, we don't lose any tuples - we get back exactly the same relation we started with.",
    category: "Normalization",
    difficulty: "medium",
    year: "Summer 2000"
  },
  {
    id: 20,
    question: "Assume we have the relation R: {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q} with the following functional dependencies: {{A, B, E, F} → {C, G}, {A} → {D, I}, {A, F} → {J}, {B, E} → {K}, {B} → {M, N}, {E}→ {O}, {F}→{P}, {K}→{H, L}, {D}→{Q}}. If we put the above relation R into second normal form, we will end up with:",
    options: [
      "6 relations",
      "7 relations",
      "8 relations",
      "9 relations",
      "none of the above"
    ],
    correctAnswer: 1,
    explanation: "When decomposing into 2NF, we need to ensure no partial dependencies exist. Given the functional dependencies, we'll need 8 relations to properly separate all partial dependencies.",
    category: "Normalization",
    difficulty: "hard",
    year: "Summer 2000"
  },
  
  {
    id: 27,
    question: <>
      <WomanDatabaseTables />
      <div className="mt-4 text-gray-100">
        Update BirthLocation set City = 'Dover' where City = 'Denver'
      </div>
    </>,
    options: ["Violates", "Doesn't Violate"],
    correctAnswer: 1,
    explanation: "This update doesn't violate any referential constraints because it only changes the city name 'Denver' to 'Dover' while keeping the CityOfBirthID ('DE') the same. The foreign key constraint references CityOfBirthID, not the city name, so this update is safe.",
    category: "Referential Integrity",
    difficulty: "medium",
    year: "Summer 2000"
  },
  {
    id: 26,
    question: <>
      <WomanDatabaseTables />
      <div className="mt-4 text-gray-100">
        Delete from BirthLocation where City = 'Tampa'
      </div>
    </>,
    options: ["Violates", "Doesn't Violate"],
    correctAnswer: 0,
    explanation: "This violates referential integrity because there are women (Chelsea and Betty) who have CityOfBirthID = 'TA' (Tampa). Deleting Tampa from BirthLocation would leave these foreign key references dangling.",
    category: "Referential Integrity",
    difficulty: "medium",
    year: "Summer 2000"
},
{
    id: 28,
    question: <>
      <WomanDatabaseTables />
      <div className="mt-4 text-gray-100">
        Insert into Woman values (42,'Betty','Ford', 34, 'LA')
      </div>
    </>,
    options: ["Violates", "Doesn't Violate"],
    correctAnswer: 0,
    explanation: "This violates referential integrity because it references MotherOfWomanID = 34, which does not exist in Woman table (foreign key constraint C1).",
    category: "Referential Integrity",
    difficulty: "medium",
    year: "Summer 2000"
},
{
    id: 29,
    question: <>
      <WomanDatabaseTables />
      <div className="mt-4 text-gray-100">
        Delete from Woman where WomanID = 22
      </div>
    </>,
    options: ["Violates", "Doesn't Violate"],
    correctAnswer: 0,
    explanation: "This violates referential integrity because WomanID 22 is referenced as a MotherOfWomanID by Cassidy (WomanID 26). Deleting it would break the foreign key constraint C1.",
    category: "Referential Integrity",
    difficulty: "medium",
    year: "Summer 2000"
},
{
    id: 30,
    question: <>
      <WomanDatabaseTables />
      <div className="mt-4 text-gray-100">
        Update Woman set MotherOfWomanID = 26 where WomanID = '0'
      </div>
    </>,
    options: ["Violates", "Doesn't Violate"],
    correctAnswer: 0,
    explanation: "This would create a circular reference in the MotherOfWomanID relationship, as it would make someone (WomanID 0) be the mother of their own ancestors in the family tree.",
    category: "Referential Integrity",
    difficulty: "medium",
    year: "Summer 2000"
},
{
    id: 31,
    question: <>
      <WomanDatabaseTables />
      <div className="mt-4 text-gray-100">
        Insert into BirthLocation Values ('LB','Los Angeles', 'CA', 'USA')
      </div>
    </>,
    options: ["Violates", "Doesn't Violate"],
    correctAnswer: 1,
    explanation: "This doesn't violate any constraints. Adding a new city to BirthLocation is allowed as long as the CityOfBirthID is unique, which 'LB' is.",
    category: "Referential Integrity",
    difficulty: "medium",
    year: "Summer 2000"
},
{
    id: 32,
    question: <>
      <WomanDatabaseTables />
      <div className="mt-4 text-gray-100">
        Update Woman set WomanID = '24' where WomanID = '22'
      </div>
    </>,
    options: ["Violates", "Doesn't Violate"],
    correctAnswer: 0,
    explanation: "This violates referential integrity because WomanID 22 is referenced as a MotherOfWomanID by Cassidy (WomanID 26). Changing the WomanID would break the foreign key constraint C1.",
    category: "Referential Integrity",
    difficulty: "medium",
    year: "Summer 2000"
  },
  {
    id: 33,
    question: "Assume you have a table Employee with the following fields {SSN, LastName, Sex, Email, DeptCode, DeptName, DeptLocation}. What problem would occur when deleting employees from this table that is not in third normal form?",
    options: [
      "You might delete an employee you didn’t mean too",
      "If the employee you are deleting is the last employee in a department, then when you delete that employee, you also accidentally lose all information about that department.",
      "You can no longer delete employees by using referencing their department code",
      "No problems occur when you do deletions from a table that is NOT in third normal form"
    ],
    correctAnswer: 1,
    explanation: "When a table is not in third normal form, deleting the last employee in a department may result in the accidental loss of all department information, which violates data integrity.",
    category: "Normalization",
    difficulty: "medium"
  },
  {
    id: 34,
    question: "When optimizing a query, we should always pick the best solution for performing the query",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation: "False. Query optimization involves balancing cost and resources. The best solution is sometimes not always the most practical.",
    category: "Query Optimization",
    difficulty: "easy"
  },
  {
    id: 35,
    question: "When optimizing a query, it is usually better to do the selects before the joins",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. Performing selects first reduces the number of rows involved in joins, improving efficiency.",
    category: "Query Optimization",
    difficulty: "easy"
  },
  {
    id: 36,
    question: "When optimizing a query, the system creates a",
    options: [
      "Query table",
      "Query graph",
      "B+ tree",
      "Query tree"
    ],
    correctAnswer: 3,
    explanation: "The query tree is used to represent and optimize the query execution plan in database systems.",
    category: "Query Optimization",
    difficulty: "medium"
  },
  {
    id: 37,
    question: "On tables that have no index and no hash key, it is faster to do a join with tables that are both sorted on the join key than with unsorted tables.",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. Sorting tables on the join key allows for efficient merging during the join operation.",
    category: "Query Optimization",
    difficulty: "medium"
  },
  {
    id: 38,
    question: "When doing a query that is pipelined, the temporary results of the query are sent right to the next query rather than stored in a temporary table.",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. Pipelined queries pass intermediate results directly, avoiding the overhead of storing temporary results.",
    category: "Query Optimization",
    difficulty: "medium"
  },
  {
    id: 39,
    question: "If your query includes a selection that has Select … where TablesKey = SomeValue, this would be a good query to do first as it is the most restrictive selection possible without returning an empty table.",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. Performing the most restrictive selection first reduces the dataset early, improving query efficiency.",
    category: "Query Optimization",
    difficulty: "easy"
  },
  {
    id: 59,
    question: "Most DBMS do NOT test if a schedule is serializable, rather they use techniques that will never allow non-serializable schedules to occur.",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. DBMS use locking and timestamping techniques to enforce serializability rather than testing schedules directly.",
    category: "Concurrency",
    difficulty: "easy"
  },
  {
    id: 60,
    question: "Which of the following granularities of locking will be the most restrictive to other transactions that are waiting for a locked item?",
    options: ["Database Level", "Table Level", "Row Level", "Field Level"],
    correctAnswer: 0,
    explanation: "Database-level locking is the most restrictive, as it locks the entire database and blocks all other transactions.",
    category: "Concurrency",
    difficulty: "medium"
  },
  {
    id: 61,
    question: "In 2-phase locking a transaction must:",
    options: [
      "Release all it’s locks at the same time",
      "NOT obtain any new locks once it has started releasing locks",
      "Only obtain locks on items not used by any other transactions",
      "Ensure that deadlock will never occur"
    ],
    correctAnswer: 1,
    explanation: "In 2-phase locking, a transaction cannot obtain new locks once it starts releasing locks. This ensures serializability.",
    category: "Concurrency",
    difficulty: "medium"
  },
  {
    id: 62,
    question: "If you use timestamping to ensure serializability, you will never have to perform rollbacks",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation: "False. Timestamping may still require rollbacks if transactions violate serializability constraints.",
    category: "Concurrency",
    difficulty: "medium"
  },
  {
    id: 63,
    question: "The optimistic method works best in a database that has",
    options: [
      "Lots of inserts, updates and deletes but very few selects",
      "Lots of selects and very few updates, inserts and deletes",
      "Lots of rollbacks",
      "Lots of concurrent writing to the database"
    ],
    correctAnswer: 1,
    explanation: "The optimistic method works best when there are many read operations (selects) and very few write operations.",
    category: "Concurrency",
    difficulty: "medium"
  },
  {
    id: 40,
    question: (
      <>
        <p>Assuming you run the following SQL query on the tables below:</p>
        <pre
          className="whitespace-pre-wrap break-words overflow-x-auto p-2 bg-gray-800 rounded-md text-gray-200"
          style={{ wordWrap: 'break-word' }}
        >
          SELECT a FROM aa WHERE b IN (SELECT f FROM bb WHERE g = 20);
        </pre>
        <p>How many rows will be returned?</p>
        <h4>Table aa:</h4>
        <DynamicTable
          headers={['a', 'b', 'c']}
          rows={[
            [33, 2, 3],
            [44, 2, 5],
            [33, 1, 3],
            [44, 2, 5],
            [33, 4, 1],
          ]}
        />
        <h4>Table bb:</h4>
        <DynamicTable
          headers={['e', 'f', 'g', 'h']}
          rows={[
            [5, 1, 10, 44],
            [5, 2, 20, 55],
            [6, 1, 30, 66],
          ]}
        />
      </>
    ),
    options: ['0', '1', '2', '3', '4', '5', 'More than 5'],
    correctAnswer: 3,
    explanation:
      'The subquery selects f values from table bb where g = 20. It returns f = 2. In table aa, rows with b = 2 are matched, giving us rows with a = 33, 44, 44.',
    category: 'SQL Queries',
    difficulty: 'medium',
  },
  
  {
    id: 41,
    question: (
      <>
        <p>Assuming you run the following SQL query on the tables below:</p>
        <pre
          className="whitespace-pre-wrap break-words overflow-x-auto p-2 bg-gray-800 rounded-md text-gray-200"
          style={{ wordWrap: 'break-word' }}
        >
          SELECT a FROM aa WHERE b NOT IN (SELECT f FROM bb WHERE g &lt; 20);
        </pre>
        <p>How many rows will be returned?</p>
        <h4>Table aa:</h4>
        <DynamicTable
          headers={['a', 'b', 'c']}
          rows={[
            [33, 2, 3],
            [44, 2, 5],
            [33, 1, 3],
            [44, 2, 5],
            [33, 4, 1],
          ]}
        />
        <h4>Table bb:</h4>
        <DynamicTable
          headers={['e', 'f', 'g', 'h']}
          rows={[
            [5, 1, 10, 44],
            [5, 2, 20, 55],
            [6, 3, 15, 66],
          ]}
        />
      </>
    ),
    options: ['0', '1', '2', '3', '4', '5', 'More than 5'],
    correctAnswer: 2,
    explanation:
      'The subquery selects f values from table bb where g < 20. It returns f = 1, 3. In table aa, rows with b NOT IN (1, 3) are selected, giving us rows with a = 33, 33.',
    category: 'SQL Queries',
    difficulty: 'medium',
  },
  
  {
    id: 42,
    question: (
      <>
        <p>Assuming you run the following SQL query on the tables below:</p>
        <pre
          className="whitespace-pre-wrap break-words overflow-x-auto p-2 bg-gray-800 rounded-md text-gray-200"
          style={{ wordWrap: 'break-word' }}
        >
          SELECT DISTINCT a FROM aa WHERE b IN (SELECT f FROM bb WHERE g BETWEEN 10 AND 30);
        </pre>
        <p>How many rows will be returned?</p>
        <h4>Table aa:</h4>
        <DynamicTable
          headers={['a', 'b', 'c']}
          rows={[
            [33, 1, 3],
            [44, 2, 5],
            [33, 4, 1],
            [22, 2, 2],
            [11, 3, 3],
          ]}
        />
        <h4>Table bb:</h4>
        <DynamicTable
          headers={['e', 'f', 'g', 'h']}
          rows={[
            [5, 1, 10, 44],
            [5, 2, 20, 55],
            [6, 3, 30, 66],
          ]}
        />
      </>
    ),
    options: ['0', '1', '2', '3', '4', '5', 'More than 5'],
    correctAnswer: 4,
    explanation:
      'The subquery selects f values where g BETWEEN 10 AND 30, returning f = 1, 2, 3. Rows in table aa with b IN (1, 2, 3) are selected: a = 33, 44, 11.',
    category: 'SQL Queries',
    difficulty: 'medium',
  },
  
  {
    id: 43,
    question: (
      <>
        <p>Assuming you run the following SQL query on the tables below:</p>
        <pre
          className="whitespace-pre-wrap break-words overflow-x-auto p-2 bg-gray-800 rounded-md text-gray-200"
          style={{ wordWrap: 'break-word' }}
        >
          SELECT COUNT(*) FROM aa WHERE b IN (SELECT f FROM bb WHERE e = 6);
        </pre>
        <p>How many rows will be returned?</p>
        <h4>Table aa:</h4>
        <DynamicTable
          headers={['a', 'b', 'c']}
          rows={[
            [33, 1, 3],
            [44, 2, 5],
            [33, 4, 1],
            [22, 2, 2],
            [11, 3, 3],
          ]}
        />
        <h4>Table bb:</h4>
        <DynamicTable
          headers={['e', 'f', 'g', 'h']}
          rows={[
            [6, 1, 10, 44],
            [6, 4, 20, 55],
            [5, 2, 30, 66],
          ]}
        />
      </>
    ),
    options: ['0', '1', '2', '3', '4', '5', 'More than 5'],
    correctAnswer: 2,
    explanation:
      'The subquery selects f values from table bb where e = 6. It returns f = 1, 4. Rows in table aa with b = 1, 4 are selected: a = 33, 33.',
    category: 'SQL Queries',
    difficulty: 'medium',
  },
  
  {
    id: 44,
    question: (
      <>
        <p>Assuming you run the following SQL query on the tables below:</p>
        <pre
          className="whitespace-pre-wrap break-words overflow-x-auto p-2 bg-gray-800 rounded-md text-gray-200"
          style={{ wordWrap: 'break-word' }}
        >
          SELECT a FROM aa WHERE c IN (SELECT h FROM bb WHERE f = 2);
        </pre>
        <p>How many rows will be returned?</p>
        <h4>Table aa:</h4>
        <DynamicTable
          headers={['a', 'b', 'c']}
          rows={[
            [33, 2, 3],
            [44, 2, 5],
            [33, 1, 3],
            [44, 2, 44],
            [33, 4, 1],
          ]}
        />
        <h4>Table bb:</h4>
        <DynamicTable
          headers={['e', 'f', 'g', 'h']}
          rows={[
            [5, 2, 20, 5],
            [6, 2, 30, 44],
            [6, 1, 10, 3],
          ]}
        />
      </>
    ),
    options: ['0', '1', '2', '3', '4', '5', 'More than 5'],
    correctAnswer: 2,
    explanation:
      'The subquery selects h values from table bb where f = 2. It returns h = 5, 44. Rows in table aa with c IN (5, 44) are selected: a = 44, 44.',
    category: 'SQL Queries',
    difficulty: 'medium',
  },
  

  
  
    
  
  
  
];
