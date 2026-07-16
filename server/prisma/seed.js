import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding started...');

  // Clean DB
  await prisma.chatMessage.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.application.deleteMany();
  await prisma.testAnswer.deleteMany();
  await prisma.testAttempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.test.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.job.deleteMany();
  await prisma.recruiter.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleaned existing database records.');

  // Create Passwords
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Recruiter 1
  const recUser1 = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@sagetech.com',
      passwordHash: hashedPassword,
      role: 'RECRUITER',
      recruiter: {
        create: {
          companyName: 'SageTech Systems',
        },
      },
    },
    include: { recruiter: true },
  });

  // Recruiter 2
  const recUser2 = await prisma.user.create({
    data: {
      name: 'Bob Miller',
      email: 'bob@innovate.ai',
      passwordHash: hashedPassword,
      role: 'RECRUITER',
      recruiter: {
        create: {
          companyName: 'Innovate AI',
        },
      },
    },
    include: { recruiter: true },
  });

  // Candidates
  const candUser1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@gmail.com',
      passwordHash: hashedPassword,
      role: 'CANDIDATE',
      candidate: {
        create: {
          phone: '+1 555-0199',
          headline: 'Full Stack Engineer with 3 years of React/Node.js experience',
        },
      },
    },
    include: { candidate: true },
  });

  const candUser2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@gmail.com',
      passwordHash: hashedPassword,
      role: 'CANDIDATE',
      candidate: {
        create: {
          phone: '+1 555-0288',
          headline: 'AI & Data Science Graduate looking for ML roles',
        },
      },
    },
    include: { candidate: true },
  });

  console.log('Created Recruiters and Candidates.');

  // Create Jobs
  const job1 = await prisma.job.create({
    data: {
      recruiterId: recUser1.recruiter.id,
      title: 'Senior Frontend Engineer',
      description: 'Looking for a passionate React developer with solid experience in modern CSS, Tailwind CSS, TypeScript, and state management.',
      requiredSkills: JSON.stringify(['React', 'JavaScript', 'CSS', 'Tailwind CSS', 'TypeScript']),
      roleCategory: 'frontend',
      status: 'OPEN',
    },
  });

  const job2 = await prisma.job.create({
    data: {
      recruiterId: recUser1.recruiter.id,
      title: 'Lead Backend Developer',
      description: 'Design and scale backend APIs. Required proficiency in Node.js, Express, SQLite, Prisma ORM, REST principles, and JWT Authentication.',
      requiredSkills: JSON.stringify(['Node.js', 'Express', 'SQLite', 'Prisma', 'REST', 'JWT']),
      roleCategory: 'backend',
      status: 'OPEN',
    },
  });

  const job3 = await prisma.job.create({
    data: {
      recruiterId: recUser2.recruiter.id,
      title: 'Machine Learning Engineer',
      description: 'Develop and train neural networks. Experience with Python, PyTorch, TensorFlow, Scikit-Learn, and large language models (LLMs) is essential.',
      requiredSkills: JSON.stringify(['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'LLMs', 'NLP']),
      roleCategory: 'ai-ml',
      status: 'OPEN',
    },
  });

  const job4 = await prisma.job.create({
    data: {
      recruiterId: recUser2.recruiter.id,
      title: 'Backend Node.js Architect',
      description: 'Build backend pipelines for real-time applications. Requires advanced Node.js, caching (Redis/Memcached), SQLite optimization, and Express frameworks.',
      requiredSkills: JSON.stringify(['Node.js', 'Express', 'Caching', 'SQLite', 'APIs']),
      roleCategory: 'backend',
      status: 'OPEN',
    },
  });

  console.log('Created Jobs.');

  // 1. GENERAL TEST
  const generalTest = await prisma.test.create({
    data: {
      type: 'GENERAL',
      title: 'General Aptitude & Communication Test',
      passScore: 60,
    },
  });

  const generalQuestions = [
    {
      questionText: 'Find the next number in the series: 3, 5, 9, 17, 33, ...',
      options: JSON.stringify(['49', '65', '57', '68']),
      correctIndex: 1, // 65 (pattern is +2, +4, +8, +16, +32)
      topicTag: 'logical-reasoning',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'If all bloops are razzies and all razzies are lazzies, are all bloops definitely lazzies?',
      options: JSON.stringify(['Yes, definitely', 'No, never', 'Only sometimes', 'Insufficient information']),
      correctIndex: 0,
      topicTag: 'logical-reasoning',
      difficulty: 'EASY',
    },
    {
      questionText: 'A project can be completed by 5 workers in 12 days. How many days will it take 6 workers to complete the same project?',
      options: JSON.stringify(['14 days', '10 days', '8 days', '15 days']),
      correctIndex: 1, // 10 days
      topicTag: 'aptitude',
      difficulty: 'EASY',
    },
    {
      questionText: 'Choose the word that is most opposite in meaning to "CANDID":',
      options: JSON.stringify(['Deceptive', 'Honest', 'Sincere', 'Plain']),
      correctIndex: 0, // Deceptive
      topicTag: 'communication',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'Which of the following sentences is grammatically correct?',
      options: JSON.stringify([
        'Each of the candidates have submitted their resume.',
        'Each of the candidates has submitted their resume.',
        'Each of the candidates has submitted his or her resume.',
        'Both B and C are correct.'
      ]),
      correctIndex: 3,
      topicTag: 'communication',
      difficulty: 'HARD',
    },
    {
      questionText: 'A car travels at 60 km/h for 2 hours, then 80 km/h for 1 hour. What is the average speed of the car?',
      options: JSON.stringify(['70 km/h', '66.67 km/h', '75 km/h', '68.5 km/h']),
      correctIndex: 1, // Total distance = 120 + 80 = 200. Total time = 3. 200/3 = 66.67
      topicTag: 'aptitude',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'In a code, "LIGHT" is written as "MJHIU". How is "SOUND" written in that code?',
      options: JSON.stringify(['TPEOE', 'TPVNE', 'TPVND', 'TQVOE']),
      correctIndex: 0, // S+1=T, O+1=P, U+1=V (Wait: S->T, O->P, U->V, N->O, D->E => TPEOE)
      topicTag: 'logical-reasoning',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'Which word completes the analogy? Ocean : Water :: Glacier : ______',
      options: JSON.stringify(['Cold', 'Ice', 'Mountain', 'River']),
      correctIndex: 1, // Ice
      topicTag: 'logical-reasoning',
      difficulty: 'EASY',
    },
    {
      questionText: 'A shopkeeper sells an item at 20% profit. If the cost price was $150, what was the selling price?',
      options: JSON.stringify(['$170', '$180', '$190', '$200']),
      correctIndex: 1, // $180
      topicTag: 'aptitude',
      difficulty: 'EASY',
    },
    {
      questionText: 'Choose the correct synonym for "OBSTINATE":',
      options: JSON.stringify(['Flexible', 'Stubborn', 'Submissive', 'Cheerful']),
      correctIndex: 1, // Stubborn
      topicTag: 'communication',
      difficulty: 'EASY',
    },
    {
      questionText: 'What is the sum of integers from 1 to 50?',
      options: JSON.stringify(['1275', '1250', '1300', '1225']),
      correctIndex: 0, // 50 * 51 / 2 = 1275
      topicTag: 'aptitude',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'Identify the passive voice version of: "The chef cooked a delicious meal."',
      options: JSON.stringify([
        'A delicious meal was cooked by the chef.',
        'A delicious meal has been cooked by the chef.',
        'The chef was cooking a delicious meal.',
        'A delicious meal is cooked by the chef.'
      ]),
      correctIndex: 0,
      topicTag: 'communication',
      difficulty: 'EASY',
    },
    {
      questionText: 'Complete the sequence: ABC, EFG, IJK, ...',
      options: JSON.stringify(['LMN', 'OPQ', 'MNO', 'NOP']),
      correctIndex: 2, // MNO (skipping one alphabet group: A-D, E-H, I-L, M-P)
      topicTag: 'logical-reasoning',
      difficulty: 'HARD',
    },
    {
      questionText: 'A train 100 meters long passes a pole in 6 seconds. What is its speed in km/h?',
      options: JSON.stringify(['50 km/h', '60 km/h', '70 km/h', '80 km/h']),
      correctIndex: 1, // 100/6 m/s * 3.6 = 60 km/h
      topicTag: 'aptitude',
      difficulty: 'HARD',
    },
    {
      questionText: 'What does the idiom "Spill the beans" mean?',
      options: JSON.stringify(['To drop food', 'To tell a secret', 'To cook dinner', 'To waste resources']),
      correctIndex: 1,
      topicTag: 'communication',
      difficulty: 'EASY',
    },
  ];

  for (const q of generalQuestions) {
    await prisma.question.create({
      data: {
        testId: generalTest.id,
        ...q,
      },
    });
  }

  // 2. ROLE SPECIFIC TESTS
  // A. Frontend Test
  const frontendTest = await prisma.test.create({
    data: {
      type: 'ROLE_SPECIFIC',
      roleCategory: 'frontend',
      title: 'Frontend Engineering Assessment',
      passScore: 60,
    },
  });

  const frontendQuestions = [
    {
      questionText: 'What is the primary difference between useEffect and useLayoutEffect in React?',
      options: JSON.stringify([
        'useLayoutEffect runs asynchronously after render paint.',
        'useLayoutEffect runs synchronously before the browser paints.',
        'useEffect is only for class components.',
        'There is no difference in execution timing.'
      ]),
      correctIndex: 1,
      topicTag: 'react-hooks',
      difficulty: 'HARD',
    },
    {
      questionText: 'Which CSS display type formats items in a one-dimensional layout?',
      options: JSON.stringify(['grid', 'flex', 'block', 'table']),
      correctIndex: 1,
      topicTag: 'css-layout',
      difficulty: 'EASY',
    },
    {
      questionText: 'What is a closure in JavaScript?',
      options: JSON.stringify([
        'A function that terminates the execution environment.',
        'A function that retains access to its lexical scope even when executed outside that scope.',
        'An API endpoint encapsulation.',
        'A method to delete variables from memory.'
      ]),
      correctIndex: 1,
      topicTag: 'javascript-core',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'How can you prevent a parent component from re-rendering in React when children update?',
      options: JSON.stringify([
        'Wrap the parent in React.memo',
        'Wrap the children in React.memo',
        'Lift state down or structure the children as wrapper props',
        'Use useEffect in the parent'
      ]),
      correctIndex: 2,
      topicTag: 'react-performance',
      difficulty: 'HARD',
    },
    {
      questionText: 'Which HTML5 tag is used to draw graphics on the fly via scripting (usually JavaScript)?',
      options: JSON.stringify(['<svg>', '<canvas>', '<graphics>', '<draw>']),
      correctIndex: 1,
      topicTag: 'html-core',
      difficulty: 'EASY',
    },
    {
      questionText: 'What is the purpose of the "key" prop in React lists?',
      options: JSON.stringify([
        'To bind events to list items.',
        'To uniquely identify elements and help React determine which items changed, are added, or removed.',
        'To style individual elements.',
        'To fetch details from an API.'
      ]),
      correctIndex: 1,
      topicTag: 'react-core',
      difficulty: 'EASY',
    },
    {
      questionText: 'In the JS event loop, where are Promise resolutions queued?',
      options: JSON.stringify(['Task queue', 'Microtask queue', 'Call stack', 'Render queue']),
      correctIndex: 1,
      topicTag: 'javascript-core',
      difficulty: 'HARD',
    },
    {
      questionText: 'Which CSS selector selects all <p> elements inside a <div>?',
      options: JSON.stringify(['div p', 'div > p', 'div + p', 'div.p']),
      correctIndex: 0,
      topicTag: 'css-layout',
      difficulty: 'EASY',
    },
    {
      questionText: 'What is the correct way to handle side effects in a functional React component?',
      options: JSON.stringify(['Inside the render method', 'Using useEffect', 'Using useState setter directly', 'Creating a global variable']),
      correctIndex: 1,
      topicTag: 'react-hooks',
      difficulty: 'EASY',
    },
    {
      questionText: 'What is the specificity value of an ID selector in CSS?',
      options: JSON.stringify(['(0, 0, 1, 0)', '(0, 1, 0, 0)', '(0, 0, 0, 1)', '(1, 0, 0, 0)']),
      correctIndex: 1, // (0, 1, 0, 0) represents ID spec
      topicTag: 'css-layout',
      difficulty: 'MEDIUM',
    },
  ];

  for (const q of frontendQuestions) {
    await prisma.question.create({
      data: {
        testId: frontendTest.id,
        ...q,
      },
    });
  }

  // B. Backend Test
  const backendTest = await prisma.test.create({
    data: {
      type: 'ROLE_SPECIFIC',
      roleCategory: 'backend',
      title: 'Backend Architecture & Databases Assessment',
      passScore: 60,
    },
  });

  const backendQuestions = [
    {
      questionText: 'In relational databases, what does the ACID acronym stand for?',
      options: JSON.stringify([
        'Atomicity, Consistency, Isolation, Durability',
        'Access, Concurrency, Indexing, Delivery',
        'Algorithm, Compression, Integrity, Distribution',
        'Atomicity, Concurrency, Isolation, Distribution'
      ]),
      correctIndex: 0,
      topicTag: 'databases',
      difficulty: 'EASY',
    },
    {
      questionText: 'Which HTTP status code represents "401 Unauthorized" vs "403 Forbidden"?',
      options: JSON.stringify([
        '401 is missing/invalid credentials; 403 is valid credentials but lacks permission.',
        '401 is lacks permission; 403 is missing/invalid credentials.',
        'They are interchangeable.',
        '401 is for server errors; 403 is for client errors.'
      ]),
      correctIndex: 0,
      topicTag: 'rest-apis',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'What is the purpose of database indexes?',
      options: JSON.stringify([
        'To encrypt data in columns.',
        'To speed up data retrieval operations at the cost of slower write speeds.',
        'To compress database files.',
        'To enforce foreign key relationships.'
      ]),
      correctIndex: 1,
      topicTag: 'databases',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'What Node.js core module is used for handling file paths?',
      options: JSON.stringify(['fs', 'path', 'url', 'os']),
      correctIndex: 1,
      topicTag: 'node-core',
      difficulty: 'EASY',
    },
    {
      questionText: 'In an Express server, what does calling next() in a middleware do?',
      options: JSON.stringify([
        'Terminates the request.',
        'Sends the response back to the client.',
        'Passes control to the next middleware function in the stack.',
        'Restarts the server.'
      ]),
      correctIndex: 2,
      topicTag: 'express-js',
      difficulty: 'EASY',
    },
    {
      questionText: 'Which caching strategy retrieves data from cache and if not found, queries database and updates cache?',
      options: JSON.stringify(['Write-through', 'Cache-aside (Lazy loading)', 'Write-back', 'Read-through']),
      correctIndex: 1,
      topicTag: 'caching',
      difficulty: 'HARD',
    },
    {
      questionText: 'What is SQL Injection?',
      options: JSON.stringify([
        'Injecting extra database tables to save memory.',
        'Malicious injection of SQL statements into inputs to manipulate database execution.',
        'A query optimizing database indexing.',
        'An API test suite methodology.'
      ]),
      correctIndex: 1,
      topicTag: 'security',
      difficulty: 'EASY',
    },
    {
      questionText: 'Which of the following handles asynchronous execution natively in Node.js without blocking the main event loop?',
      options: JSON.stringify(['Worker Threads', 'libuv Thread Pool', 'Asynchronous Callbacks/Promises', 'All of the above']),
      correctIndex: 3,
      topicTag: 'node-concurrency',
      difficulty: 'HARD',
    },
    {
      questionText: 'In JWT authentication, where is the payload signature validated?',
      options: JSON.stringify([
        'Only on the client-side.',
        'On the server-side using the secret key.',
        'In the database lookup.',
        'In localStorage verification.'
      ]),
      correctIndex: 1,
      topicTag: 'security',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'What does a "Foreign Key" in SQL do?',
      options: JSON.stringify([
        'Guarantees all row keys are strings.',
        'Establishes a link between data in two tables.',
        'Speeds up mathematical sorting.',
        'Identifies rows uniquely across multiple databases.'
      ]),
      correctIndex: 1,
      topicTag: 'databases',
      difficulty: 'EASY',
    },
  ];

  for (const q of backendQuestions) {
    await prisma.question.create({
      data: {
        testId: backendTest.id,
        ...q,
      },
    });
  }

  // C. AI-ML Test
  const aimlTest = await prisma.test.create({
    data: {
      type: 'ROLE_SPECIFIC',
      roleCategory: 'ai-ml',
      title: 'AI & Machine Learning Assessment',
      passScore: 60,
    },
  });

  const aimlQuestions = [
    {
      questionText: 'What is the primary cause of overfitting in a machine learning model?',
      options: JSON.stringify([
        'The model is too simple for the training data.',
        'The model is too complex and fits noise in the training data.',
        'The learning rate is too high.',
        'The data size is too large.'
      ]),
      correctIndex: 1,
      topicTag: 'ml-fundamentals',
      difficulty: 'EASY',
    },
    {
      questionText: 'Which mathematical technique is used to calculate gradients of loss function with respect to weights in deep learning?',
      options: JSON.stringify(['Principal Component Analysis', 'Backpropagation', 'Linear Regression', 'Cosine Similarity']),
      correctIndex: 1,
      topicTag: 'deep-learning',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'What metric is best suited to evaluate classification models when data is highly imbalanced?',
      options: JSON.stringify(['Accuracy', 'F1-Score / Precision-Recall AUC', 'Mean Squared Error', 'R-squared']),
      correctIndex: 1,
      topicTag: 'ml-fundamentals',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'In modern LLMs, what is the role of the self-attention mechanism?',
      options: JSON.stringify([
        'To reduce model size.',
        'To calculate contextual relations between tokens regardless of their distance in the sentence.',
        'To select the correct activation function.',
        'To index training corpus datasets.'
      ]),
      correctIndex: 1,
      topicTag: 'llms',
      difficulty: 'HARD',
    },
    {
      questionText: 'What is the temperature parameter used for in LLM text generation?',
      options: JSON.stringify([
        'Controlling model execution hardware temperature.',
        'Controlling randomness/creativity of response probabilities.',
        'Reducing memory consumption.',
        'Regulating prompt inputs character count.'
      ]),
      correctIndex: 1,
      topicTag: 'llm-engineering',
      difficulty: 'EASY',
    },
    {
      questionText: 'Which optimizer adaptively adjusts learning rates for parameters individually based on first and second moments?',
      options: JSON.stringify(['Stochastic Gradient Descent (SGD)', 'Adam', 'RMSprop', 'Adagrad']),
      correctIndex: 1,
      topicTag: 'deep-learning',
      difficulty: 'HARD',
    },
    {
      questionText: 'What does RAG stand for in the context of LLM applications?',
      options: JSON.stringify([
        'Retrieval-Augmented Generation',
        'Recurrent Activation Gradient',
        'Randomized Attribute Generation',
        'Relative Association Graph'
      ]),
      correctIndex: 0,
      topicTag: 'llm-engineering',
      difficulty: 'EASY',
    },
    {
      questionText: 'What is the difference between Fine-Tuning and Prompt Engineering?',
      options: JSON.stringify([
        'Fine-tuning updates model weights; prompt engineering works entirely with system/user inputs without weight changes.',
        'Prompt engineering updates model weights; fine-tuning does not.',
        'Fine-tuning is faster and requires no data.',
        'They are terms for the exact same process.'
      ]),
      correctIndex: 0,
      topicTag: 'llm-engineering',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'Which function maps any real-valued number into a value between 0 and 1, commonly used in binary classification?',
      options: JSON.stringify(['ReLU', 'Sigmoid', 'Tanh', 'Leaky ReLU']),
      correctIndex: 1,
      topicTag: 'deep-learning',
      difficulty: 'EASY',
    },
    {
      questionText: 'What does "Cosine Similarity" measure?',
      options: JSON.stringify([
        'The distance between values in a list.',
        'The angular similarity between two vector representations, regardless of size.',
        'The gradient descent step path.',
        'The loss accuracy calculation.'
      ]),
      correctIndex: 1,
      topicTag: 'embeddings',
      difficulty: 'MEDIUM',
    },
  ];

  for (const q of aimlQuestions) {
    await prisma.question.create({
      data: {
        testId: aimlTest.id,
        ...q,
      },
    });
  }

  console.log('Seeded Tests and Question banks successfully.');
  console.log('Database seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
