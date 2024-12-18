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
    correctAnswer: 0,
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
    correctAnswer: 4,
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
  {
    id: 64,
    question: "PHP server scripts must be surrounded by which delimiters?",
    options: [
      "<script>...</script>",
      "<&>...</&>",
      "<?php...?>",
      "<?php>...</?>",
    ],
    correctAnswer: 2,
    explanation: "PHP scripts must be enclosed within <?php...?> delimiters that mark where PHP code begins and ends.",
    category: "Web Development",
    difficulty: "easy"
  },
  {
    id: 65,
    question: "When optimizing a database query, which of the following statements is true?",
    options: [
      "Always choose the fastest possible solution",
      "Balance between speed, resource usage, and practical considerations",
      "Always prioritize memory usage over speed",
      "Only optimize queries that take longer than 1 second"
    ],
    correctAnswer: 1,
    explanation: "Query optimization involves balancing multiple factors. The fastest solution may not always be the most practical due to resource constraints and other considerations.",
    category: "Query Optimization",
    difficulty: "medium"
  },
  {
    id: 66,
    question: "Role-based security in databases refers to:",
    options: [
      "Statistical analysis of database queries",
      "Managing access control based on user roles",
      "Encryption of sensitive data",
      "Masking private information in query results"
    ],
    correctAnswer: 1,
    explanation: "Role-based security is about managing database access control based on user roles, not about statistical analysis or data masking.",
    category: "Security",
    difficulty: "medium"
  },
  {
    id: 67,
    question: "In Time Stamping concurrency control, which timestamps must be saved when Transaction T tries to access data item Quantity?",
    options: [
      "Only Start Time of Transaction T",
      "Start Time of T and Read Time of Quantity",
      "Start Time of T, Read Time of Quantity, and Write Time of Quantity",
      "Start Time of T, Read Time of Quantity, Write Time of Quantity, and End Time of T"
    ],
    correctAnswer: 2,
    explanation: "Time stamping requires saving the Start Time of Transaction T, Read Time of Quantity, and Write Time of Quantity to maintain concurrency control.",
    category: "Concurrency",
    difficulty: "hard"
  },
  {
    id: 68,
    question: "With two transactions T1 and T2, how many possible serial schedules exist?",
    options: [
      "1",
      "2",
      "3",
      "4"
    ],
    correctAnswer: 1,
    explanation: "With two transactions, there are exactly 2 possible serial schedules: either T1 followed by T2, or T2 followed by T1.",
    category: "Concurrency",
    difficulty: "medium"
  },
  {
    id: 69,
    question: "Why is a database normally stored on a Hard Disk rather than in Main Memory? (Select all that apply)",
    options: [
      "Hard disk is less volatile, cheaper, and can store more data",
      "Hard disk is faster access than main memory",
      "Hard disk takes up less physical space than main memory",
      "Hard disk has better data compression"
    ],
    correctAnswer: 0,
    explanation: "Databases are stored on hard disks because they are less volatile (data persists after power off), cheaper per unit of storage, and can store more data compared to main memory.",
    category: "Database Storage",
    difficulty: "medium"
  },
  {
    id: 70,
    question: "Which of the following is most restrictive in terms of database locking?",
    options: [
      "Database Level",
      "Table Level",
      "Row Level",
      "Field Level"
    ],
    correctAnswer: 0,
    explanation: "Database-level locking is the most restrictive as it locks the entire database, preventing other transactions from accessing any part of it.",
    category: "Concurrency",
    difficulty: "medium"
  },
  {
    id: 71,
    question: "In 2-phase locking, which rule must a transaction follow?",
    options: [
      "Release all locks at the same time",
      "Cannot obtain new locks once it has started releasing locks",
      "Only obtain locks on items not used by other transactions",
      "Must ensure deadlock never occurs"
    ],
    correctAnswer: 1,
    explanation: "In 2-phase locking, once a transaction starts releasing locks (shrinking phase), it cannot obtain any new locks. This is a fundamental rule that ensures serializability.",
    category: "Concurrency",
    difficulty: "hard"
  },
  {
    id: 72,
    question: "The optimistic concurrency control method works best in a database that has:",
    options: [
      "Lots of inserts, updates and deletes but very few selects",
      "Lots of selects and very few updates, inserts and deletes",
      "Lots of rollbacks",
      "Lots of concurrent writing to the database"
    ],
    correctAnswer: 1,
    explanation: "Optimistic concurrency control performs best when there are many read operations (selects) and few write operations, as conflicts are less likely to occur.",
    category: "Concurrency",
    difficulty: "medium"
  },
  {
    id: 73,
    question: "True or False: Using the System tables in MySQL, it is possible to see which tables in ALL the databases (not just from one database) on your system have more than 1000 rows.",
    options: [
      "True",
      "False"
    ],
    correctAnswer: 0,
    explanation: "This is true - MySQL system tables contain metadata about all databases in the system, including information about table sizes and row counts.",
    category: "MySQL",
    difficulty: "medium"
  },
  {
    id: 74,
    question: "True or False: One of the goals of good database design is to create spurious tuples in your tables.",
    options: [
      "True",
      "False"
    ],
    correctAnswer: 1,
    explanation: "False - creating spurious tuples is not a goal of good database design. Spurious tuples are unwanted results that should be avoided.",
    category: "Database Design",
    difficulty: "medium"
  },
  {
    id: 75,
    question: "A relational database can be viewed itself as an ER diagram (the meta data). When modelling the 1 to many relationship between TABLE and COLUMN, a COLUMN would be a(n):",
    options: [
      "RELATIONSHIP",
      "WEAK ENTITY",
      "ATTRIBUTE",
      "ENTITY"
    ],
    correctAnswer: 1,
    explanation: "A COLUMN is a WEAK ENTITY because it depends on a TABLE, much like a weak entity depends on a strong entity in an ER diagram.",
    category: "Database Design",
    difficulty: "hard"
  },
  {
    id: 76,
    question: "Which of the following are used to manage user access to a database?",
    options: [
      "GRANT statement only",
      "REVOKE statement only",
      "VIEWS only",
      "All of the above",
      "GRANT and REVOKE statements only"
    ],
    correctAnswer: 3,
    explanation: "All of the above (GRANT statement, REVOKE statement, and VIEWS) are used to manage user access to a database.",
    category: "Security",
    difficulty: "medium"
  },
  {
    id: 77,
    question: "True or False: When creating a webpage that you want to run some .php code, both .html and .php extensions will work, as long as you remember to put your php code between the <?php and ?> tags.",
    options: [
      "True",
      "False"
    ],
    correctAnswer: 1,
    explanation: "False - to run PHP code, the file must have the .php extension. The .html extension will not process PHP code even if it's properly tagged.",
    category: "Web Development",
    difficulty: "easy"
  },
  {
    id: 78,
    question: "True or False: If pcharles owns the table PRINCES and performed this command: GRANT SELECT ON PRINCES TO pwilliam WITH GRANT OPTION; pwilliam is now allowed to give any users he wants the ability to select from the PRINCES table.",
    options: [
      "True",
      "False"
    ],
    correctAnswer: 0,
    explanation: "True - WITH GRANT OPTION allows the grantee (pwilliam) to grant the same privileges to other users.",
    category: "Security",
    difficulty: "medium"
  },
  {
    id: 79,
    question: "True or False: Assume we have two transactions T1 and T2. We could have a schedule S1 which performs all of T1 then all of T2. Or we could have another schedule S2, which performs all of T2 then all of T1. If S1 results in different values in the database than S2 would have given, S1 and/or S2 definitely did not represent serializable schedules.",
    options: [
      "True",
      "False"
    ],
    correctAnswer: 1,
    explanation: "False - Different final values between serial schedules don't necessarily mean they aren't serializable. Serial schedules can produce different but valid results.",
    category: "Concurrency",
    difficulty: "hard"
  },
  {
    id: 80,
    question: "Which of the following is most commonly used to manage disk accessing activities?",
    options: [
      "Moving the data from the block to main memory (the block transfer time)",
      "Rotating the disk to the correct sector (the latency/rotational delay)",
      "Finding the track (the seek time)",
      "All activities take the same time"
    ],
    correctAnswer: 0,
    explanation: "Moving data from the block to main memory (block transfer time) is the fastest of these disk accessing activities.",
    category: "Database Storage",
    difficulty: "medium"
  },
  {
    id: 81,
    question: "True or False: Hashing is NOT useful if you want to retrieve records within a range of keys (e.g. all the records between Key 8 to 18) even in the situation where the keys in the range were used in the hashing function as the hashing key",
    options: [
      "True",
      "False"
    ],
    correctAnswer: 0,
    explanation: "True - Hashing is designed for exact match lookups, not range-based queries, even if the keys in the range were used in the hashing function.",
    category: "Database Storage",
    difficulty: "medium"
  },
  {
    id: 82,
    question: "Which of these are good reasons for using a heap file organization? (select the BEST answer)",
    options: [
      "The data will have to be sorted often",
      "The data will often be bulk loaded into the relation/table and the file is very small",
      "Lots of searches will be required on the file",
      "We need fast retrieval of specific records"
    ],
    correctAnswer: 1,
    explanation: "Heap file organization is best when data will be bulk loaded and the file is small. It's not optimal for frequent sorting or searching.",
    category: "Database Storage",
    difficulty: "medium"
  },
  {
    id: 83,
    question: "Which tables are NOT in the mysql information_schema database?",
    options: [
      "VIEWS",
      "COLUMNS",
      "GRANTS",
      "TABLES"
    ],
    correctAnswer: 2,
    explanation: "GRANTS is not a table in the mysql information_schema database. VIEWS, COLUMNS, and TABLES are valid tables in the schema.",
    category: "MySQL",
    difficulty: "medium"
  },
  {
    id: 84,
    question: "Which of the following are NOT tables in the mysql information_schema database?",
    options: [
      "VIEWS",
      "COLUMNS",
      "GRANTS",
      "TABLES",
      "None of the above are tables in the schema"
    ],
    correctAnswer: 2,
    explanation: "GRANTS is not a table in the MySQL information_schema database. The other options (VIEWS, COLUMNS, TABLES) are valid tables.",
    category: "MySQL",
    difficulty: "medium"
  },
  {
    id: 85,
    question: "Which of the following relationships has total participation on the RIGHT side of the relationship (reading from left to right)?",
    options: [
      "PAINTER paints PAINTING",
      "COUNTRY has capital (makes its capital city) CITY",
      "PET belongs to HUMAN",
      "SINGER records SONG"
    ],
    correctAnswer: 0,
    explanation: "PAINTER paints PAINTING has total participation on the right side because every PAINTING must have been painted by a PAINTER - a painting cannot exist without a painter.",
    category: "Entity Relationships",
    difficulty: "medium"
  },
  {
    id: 86,
    question: "Which of the following entities on the RIGHT side of the relationship is NOT a weak entity?",
    options: [
      "Employee assigned to DEPARTMENT",
      "EMPLOYEE has DEPENDENT (ie. CHILD)",
      "COURSE offers SECTION",
      "BUILDING has ROOM"
    ],
    correctAnswer: 0,
    explanation: "DEPARTMENT is not a weak entity because it exists independently and does not depend on EMPLOYEE, whereas the other options are weak entities dependent on their corresponding strong entities.",
    category: "Entity Relationships",
    difficulty: "medium"
  },
  {
    id: 87,
    question: "Match which type of attribute is hsimpson23 (userid of a student)?",
    options: [
      "Multivalued Attribute",
      "Derived Attribute",
      "Composite Attribute",
      "Key Attribute",
      "Relationship Attribute"
    ],
    correctAnswer: 3,
    explanation: "A userid like hsimpson23 is a Key Attribute as it uniquely identifies the student entity.",
    category: "Database Design",
    difficulty: "medium"
  },
  {
    id: 88,
    question: "True or False: When doing a query that is pipelined, the temporary results of the query are stored in a temporary table rather than sent right to the next query.",
    options: [
      "True",
      "False"
    ],
    correctAnswer: 1,
    explanation: "False - in a pipelined query, temporary results are sent directly to the next query rather than being stored in a temporary table. This improves efficiency by avoiding storage overhead.",
    category: "Query Optimization",
    difficulty: "medium"
  },
  {
    id: 89,
    question: "Match which type of attribute is '89%' (the grade given to a student for a given course)?",
    options: [
      "Multivalued Attribute",
      "Derived Attribute",
      "Composite Attribute",
      "Key Attribute",
      "Relationship Attribute"
    ],
    correctAnswer: 4,
    explanation: "A grade (89%) given to a student for a course is a Relationship Attribute as it describes an attribute of the relationship between student and course entities.",
    category: "Database Design",
    difficulty: "medium"
  },
  {
    id: 90,
    question: "Match which type of attribute is '12' (age of a student based on birthdate)?",
    options: [
      "Multivalued Attribute",
      "Derived Attribute",
      "Composite Attribute",
      "Key Attribute",
      "Relationship Attribute"
    ],
    correctAnswer: 1,
    explanation: "Age is a Derived Attribute because it's calculated from another attribute (birthdate) rather than being stored directly.",
    category: "Database Design",
    difficulty: "medium"
  },
  {
    id: 91,
    question: "Match which type of attribute is 'Mandarin' (languages spoken by a student)?",
    options: [
      "Multivalued Attribute",
      "Derived Attribute",
      "Composite Attribute",
      "Key Attribute",
      "Relationship Attribute"
    ],
    correctAnswer: 0,
    explanation: "Languages spoken is a Multivalued Attribute because a student can speak multiple languages.",
    category: "Database Design",
    difficulty: "medium"
  },
  {
    id: 92,
    question: "Match which type of attribute is 'Homer Jay Simpson' (first, middle, and last name of a student)?",
    options: [
      "Multivalued Attribute",
      "Derived Attribute",
      "Composite Attribute",
      "Key Attribute",
      "Relationship Attribute"
    ],
    correctAnswer: 2,
    explanation: "A full name composed of first, middle, and last names is a Composite Attribute as it can be broken down into smaller constituent parts.",
    category: "Database Design",
    difficulty: "medium"
  },
  {
    id: 93,
    question: "Which of the following relationships has more than one possible interpretation:",
    options: [
      "PAINTER paints PAINTING",
      "SINGER records SONG",
      "AUNT has NIECE",
      "PHOTOGRAPHER takes PHOTOGRAPH"
    ],
    correctAnswer: 2,
    explanation: "AUNT has NIECE can have multiple interpretations as the relationship could be many-to-many (an aunt can have many nieces and a person can have many aunts) or one-to-many depending on how it's modeled.",
    category: "Entity Relationships",
    difficulty: "hard"
  },
  {
    id: 94,
    question: "Assume you have a table R where R has columns [A, B, C, D, E, F, G, H, I] and the functional dependencies are: [A,B] → [C], [A] → [D], [B] → [E,F], [F] → [G,H,I]. When you put R into Second Normal Form, you will end up with how many tables?",
    options: [
      "2",
      "3",
      "4",
      "5"
    ],
    correctAnswer: 1,
    explanation: "When decomposing into 2NF following these functional dependencies, you end up with 3 tables after removing all partial dependencies.",
    category: "Normalization",
    difficulty: "hard"
  },
  {
    id: 95,
    question: "Which of the following is NOT one to one relationship?",
    options: [
      "COUNTRY has capital CITY",
      "HUSBAND married to WIFE",
      "Photographer takes Photograph",
      "PERSON has PASSPORT"
    ],
    correctAnswer: 2,
    explanation: "Photographer takes Photograph is not one-to-one because a photographer can take many photographs, making it a one-to-many relationship.",
    category: "Entity Relationships",
    difficulty: "medium"
  },
  {
    id: 96,
    question: "Which of the following are good reasons for using a heap file organization?",
    options: [
      "The data needs to be frequently accessed in a specific order",
      "The data needs frequent updates and deletions",
      "The file (table/relation) is very small and used infrequently",
      "The data needs to be searched often by multiple keys"
    ],
    correctAnswer: 2,
    explanation: "Heap file organization is best suited for small tables that are used infrequently, as it doesn't provide any specific ordering or indexing benefits.",
    category: "File Organization",
    difficulty: "medium"
  },
  {
    id: 97,
    question: "True or False: A database that stores customer information, but has the server program that processes that data stored at different locations around the world is considered a distributed database.",
    options: [
      "True",
      "False"
    ],
    correctAnswer: 1,
    explanation: "False - a distributed database requires the actual data to be distributed across multiple locations, not just the processing programs.",
    category: "Distributed Databases",
    difficulty: "medium"
  },
  {
    id: 98,
    question: "Which of the following is NOT an advantage of a distributed database?",
    options: [
      "Improved reliability and availability",
      "Better performance due to parallel processing",
      "Simpler system management and maintenance",
      "Local autonomy of data"
    ],
    correctAnswer: 2,
    explanation: "System management and maintenance is actually more complex in distributed databases due to the need to coordinate between multiple sites and maintain data consistency across locations.",
    category: "Distributed Databases",
    difficulty: "medium"
  },
  {
    id: 99,
    question: "Match which is NOT a many to many relationship",
    options: [
      "Photographer takes Photograph",
      "Aunt has Niece",
      "Singer sings Song",
      "Actor performs in Movie"
    ],
    correctAnswer: 0,
    explanation: "Photographer takes Photograph is not many-to-many because while a photographer can take many photographs, a photograph is usually taken by only one photographer, making it a one-to-many relationship.",
    category: "Entity Relationships",
    difficulty: "medium"
  },
  {
    id: 100,
    question: "True or False: Using the PHP file extension .html will work fine as long as you remember to put your php code between the <?php and ?> tags",
    options: [
      "True",
      "False"
    ],
    correctAnswer: 1,
    explanation: "False - PHP code must use the .php file extension to be processed by the PHP interpreter. The .html extension will not trigger PHP processing even if the code is properly tagged.",
    category: "Web Development",
    difficulty: "easy"
  },
  {
    id: 101,
    question: `Assume you ran this MySQL code:
CREATE TABLE AA(a1 int);
CREATE TABLE BB(b1 int);
CREATE TABLE CC(c1 int, c2 int);
INSERT INTO CC VALUES (3,0), (5,0), (2,0);

Then created a trigger that before INSERT on BB:
- Inserts into AA with a1 = NEW.b1 + NEW.b1
- Deletes from CC where c1 = NEW.b1 + NEW.b1

After inserting INTO BB VALUES (4),(3),(1), how many rows will be in table CC?`,
    options: [
      "0",
      "1", 
      "2",
      "3"
    ],
    correctAnswer: 2,
    explanation: "After the trigger processes the inserts (4,3,1), some rows will be deleted from CC based on the condition, leaving 2 rows in table CC.",
    category: "Triggers",
    difficulty: "hard"
  },
  {
    id: 102,
    question: "Which of the following are used to manage user access to a database?",
    options: [
      "GRANT statement only",
      "REVOKE statement only",
      "VIEWS only",
      "All of the above"
    ],
    correctAnswer: 3,
    explanation: "All three mechanisms (GRANT statements, REVOKE statements, and VIEWS) are used to manage database access control.",
    category: "Security",
    difficulty: "medium"
  },
  {
    id: 103,
    question: "If user A owns table X and gives both users B and C permission to select from table X with grant option, and then B and C both give user D permission, and finally A revokes B's privilege to select. Who retains select access?",
    options: [
      "Only user A",
      "Users A and C",
      "Users A, C, and D",
      "Users A, B, C, and D"
    ],
    correctAnswer: 2,
    explanation: "Users A (owner), C (direct grant), and D (got permission from both B and C, so C's grant maintains D's access even after B's is revoked) retain access.",
    category: "Security",
    difficulty: "hard"
  },
  {
    id: 104,
    question: "True or False: Role based security refers to the type of database security where users are allowed to run queries that give back statistical information about a database without revealing private information.",
    options: [
      "True",
      "False"
    ],
    correctAnswer: 1,
    explanation: "False - Role-based security is about managing access control based on user roles. What's described here is statistical database security, which is a different concept.",
    category: "Security",
    difficulty: "medium"
  },
  {
    id: 105,
    question: "Composite attributes in an ER diagram will map to their own table in a relational database.",
    options: [
      "True",
      "False"
    ],
    correctAnswer: 1,
    explanation: "False - Composite attributes are attributes that can be divided into smaller sub-parts (like Name into First Name and Last Name), but they don't get their own separate table in the relational mapping.",
    category: "Database Design",
    difficulty: "medium"
  },
  {
    id: 106,
    question: "True or False: Only one relationship can exist between two different entities",
    options: [
      "True",
      "False"
    ],
    correctAnswer: 1,
    explanation: "False - Multiple relationships can exist between the same two entities. For example, a PROFESSOR can advise a STUDENT and also teach a COURSE that the STUDENT is enrolled in.",
    category: "Entity Relationships",
    difficulty: "medium"
  },
  {
    id: 107,
    question: "End Users will see which part of the 3-Schema Architecture?",
    options: [
      "Conceptual Level",
      "External Level",
      "Internal Level",
      "Physical Level"
    ],
    correctAnswer: 1,
    explanation: "End users interact with the External Level, which provides user-specific views of the database presented in a format relevant to their needs.",
    category: "Database Architecture",
    difficulty: "medium"
  },
  {
    id: 108,
    question: "True or False: There is more than one way to put a table with non atomic values into first normal form, thus if you put the table into first normal form one way, and another person put the same table into first normal form another way, you might end up with a different number of tables.",
    options: [
      "True",
      "False"
    ],
    correctAnswer: 0,
    explanation: "True - Converting a table to 1NF can be done in multiple ways when dealing with non-atomic values, which can result in different numbers of tables while still maintaining data integrity.",
    category: "Normalization",
    difficulty: "medium"
  },
  {
    id: 109,
    question: "True or False: End users can see what part of the database schema of the original tables their views contain.",
    options: [
      "True",
      "False"
    ],
    correctAnswer: 0,
    explanation: "True - Users can see the schema information of their views through system catalogs, allowing them to understand what columns and tables their views are based on.",
    category: "Views",
    difficulty: "medium"
  },
  {
    id: 110,
    question: "Which of the following is NOT one of the reasons for using views?",
    options: [
      "Security",
      "Data independence",
      "Improved performance",
      "Reduced storage space"
    ],
    correctAnswer: 3,
    explanation: "Views don't actually reduce storage space as they are virtual tables that don't store data themselves. They are used for security, data independence, and customizing data presentation.",
    category: "Views",
    difficulty: "medium"
  },
  {
    id: 111,
    question: "Assume the company owner has given a grant select on their table to Harry with the GRANT OPTION and Harry uses this to give Draco a select on this table with the GRANT OPTION. Then Harry's SELECT privilege is revoked by the owner. What happens to Draco's ability to select?",
    options: [
      "Draco can still select because Harry gave the privilege before his was revoked",
      "Draco cannot select because Harry had his privilege revoked",
      "Draco can only select once more and then loses the privilege",
      "Only the owner can decide if Draco keeps the privilege"
    ],
    correctAnswer: 1,
    explanation: "When Harry's privileges are revoked, all privileges that Harry granted to others (including Draco) are also revoked in a cascading manner.",
    category: "Security",
    difficulty: "hard"
  },
  {
    id: 112,
    question: "When creating a database in the real world, which of the following is most important?",
    options: [
      "Having all tables in BCNF",
      "Having all tables in 3NF",
      "Understanding the business rules",
      "Having good hardware"
    ],
    correctAnswer: 2,
    explanation: "Understanding the business rules is most important when creating a real-world database, as this determines how to properly model and structure the data to meet actual business needs.",
    category: "Database Design",
    difficulty: "medium"
  },
  {
    id: 113,
    question: "Which of the following statements about views is FALSE?",
    options: [
      "Views can help implement security",
      "Views can hide complexity from users",
      "Views always improve query performance",
      "Views can provide data independence"
    ],
    correctAnswer: 2,
    explanation: "The statement 'Views always improve query performance' is false. Views are virtual tables that may actually add overhead to query processing, especially for complex views involving multiple joins.",
    category: "Views",
    difficulty: "medium"
  },
  {
    id: 114,
    question: "If your query includes a BETWEEN operation in a WHERE clause, what type of selection would this be considered?",
    options: [
      "Range query",
      "Point query",
      "Aggregate query",
      "Join query"
    ],
    correctAnswer: 0,
    explanation: "A BETWEEN operation in a WHERE clause is considered a range query as it selects values within a specified range of values.",
    category: "Query Types",
    difficulty: "medium"
  },
  {
    id: 115,
    question: "When using a B+ tree for indexing, what determines the maximum number of keys in a non-leaf node?",
    options: [
      "The order of the tree",
      "The height of the tree",
      "The number of leaf nodes",
      "The size of the database"
    ],
    correctAnswer: 0,
    explanation: "The order of the B+ tree determines the maximum number of keys that can be stored in non-leaf nodes.",
    category: "Indexing",
    difficulty: "medium"
  },
  {
    id: 116,
    question: "What situation would be a good use of secondary indexes in a database?",
    options: [
      "When the file is very small",
      "When you frequently search on non-key attributes",
      "When you only need to search by primary key",
      "When storage space is very limited"
    ],
    correctAnswer: 1,
    explanation: "Secondary indexes are most useful when you frequently need to search on attributes that aren't the primary key, as they provide additional access paths to the data.",
    category: "Indexing",
    difficulty: "medium"
  },
  {
    id: 117,
    question: "In magnetic disk storage, which operation typically takes the longest time?",
    options: [
      "Moving the read/write head to the correct track (seek time)",
      "Rotating to the correct sector (rotational delay)",
      "Reading the data from the disk",
      "Transferring data to memory"
    ],
    correctAnswer: 0,
    explanation: "Seek time, which involves physical movement of the read/write head to the correct track, typically takes the longest time in disk operations.",
    category: "Storage",
    difficulty: "medium"
  },
  {
    id: 118,
    question: "Which of the following is NOT a common method for handling recovery in the case of deadlock?",
    options: [
      "Rolling back the youngest transaction",
      "Rolling back the transaction that holds the most locks",
      "Rolling back all deadlocked transactions",
      "Preventing deadlocks entirely through locking protocols"
    ],
    correctAnswer: 1,
    explanation: "The number of locks held is not typically used as a criterion for selecting which transaction to roll back in deadlock recovery. Common methods include rolling back the youngest transaction or all deadlocked transactions.",
    category: "Recovery",
    difficulty: "hard"
  },
  {
    id: 119,
    question: "In a B+ tree index, what best describes the difference between a leaf node and a non-leaf node?",
    options: [
      "Leaf nodes have more entries than non-leaf nodes",
      "Leaf nodes contain pointers to data records while non-leaf nodes only contain keys",
      "Leaf nodes cannot contain duplicate values",
      "Non-leaf nodes must be at least half full"
    ],
    correctAnswer: 1,
    explanation: "In a B+ tree, leaf nodes contain both keys and pointers to actual data records, while non-leaf nodes only contain keys used for navigation through the tree.",
    category: "Indexing",
    difficulty: "hard"
  },
  {
    id: 120,
    question: "When would you choose to create a clustered index in a database?",
    options: [
      "When the data needs to be physically ordered based on the index key",
      "When you need multiple indexes on the same table",
      "When you need to index non-key attributes",
      "When you want to speed up DELETE operations"
    ],
    correctAnswer: 0,
    explanation: "A clustered index is chosen when you want the actual data records to be physically ordered according to the index key, which is beneficial for range queries and sequential access.",
    category: "Indexing",
    difficulty: "medium"
  },
  {
    id: 121,
    question: "True or False: A base table can have more than one clustered index.",
    options: [
      "True",
      "False"
    ],
    correctAnswer: 1,
    explanation: "False - A base table can only have one clustered index because the data can only be physically ordered in one way.",
    category: "Indexing",
    difficulty: "medium"
  },
  {
    id: 122,
    question: "An index that allows duplicate values is called a:",
    options: [
      "Primary index",
      "Secondary index",
      "Non-unique index",
      "Dense index"
    ],
    correctAnswer: 2,
    explanation: "An index that allows duplicate values is called a non-unique index. This is in contrast to unique indexes which enforce value uniqueness.",
    category: "Indexing",
    difficulty: "medium"
  },
  {
    id: 123,
    question: "When joining two relations, what is the main advantage of having both relations sorted on the join attribute?",
    options: [
      "It reduces the number of disk seeks required",
      "It allows for parallel processing",
      "It eliminates the need for indexes",
      "It guarantees no duplicate results"
    ],
    correctAnswer: 0,
    explanation: "Having both relations sorted on the join attribute allows for a merge join, which reduces the number of disk seeks needed as the relations can be processed sequentially.",
    category: "Query Optimization",
    difficulty: "medium"
  }
  
  



  

  
  
  
  
];
