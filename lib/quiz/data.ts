import { QuizModule } from './types';

export const MODULES: QuizModule[] = [
  {
    id: 'module-1',
    title: 'What is Blockchain?',
    description: 'Learn about distributed ledgers, immutability, and how blockchain technology works.',
    icon: '\u{1F517}',
    passingScore: 4,
    questions: [
      {
        id: 'm1q1',
        moduleId: 'module-1',
        type: 'mcq',
        question: 'What is a blockchain?',
        options: [
          'A centralized database managed by one company',
          'A distributed ledger that records transactions across many computers',
          'A programming language for building websites',
          'A type of cryptocurrency wallet',
        ],
        correctAnswer: 1,
        explanation:
          'A blockchain is a distributed ledger — a shared database that is maintained across a network of computers (nodes). No single entity controls it, making it decentralized and transparent.',
      },
      {
        id: 'm1q2',
        moduleId: 'module-1',
        type: 'truefalse',
        question: 'Once data is recorded on a blockchain, it can be easily edited or deleted.',
        options: ['True', 'False'],
        correctAnswer: 1,
        explanation:
          'False. Blockchain data is immutable — once a transaction is confirmed and added to a block, it cannot be altered or deleted. This is one of the key security features of blockchain technology.',
      },
      {
        id: 'm1q3',
        moduleId: 'module-1',
        type: 'mcq',
        question: 'What is the main advantage of decentralization in blockchain?',
        options: [
          'It makes transactions slower',
          'It removes the need for a single trusted authority',
          'It requires more electricity than normal databases',
          'It limits the number of users who can participate',
        ],
        correctAnswer: 1,
        explanation:
          'Decentralization means no single entity controls the network. This removes single points of failure, reduces censorship risks, and eliminates the need to trust a central authority.',
      },
      {
        id: 'm1q4',
        moduleId: 'module-1',
        type: 'mcq',
        question: 'What is a "block" in a blockchain?',
        options: [
          'A single cryptocurrency coin',
          'A group of transactions bundled together and added to the chain',
          'A firewall that protects the network',
          'A user account on the network',
        ],
        correctAnswer: 1,
        explanation:
          'A block is a bundle of verified transactions. Each new block is cryptographically linked to the previous block, forming a chain — hence "blockchain."',
      },
      {
        id: 'm1q5',
        moduleId: 'module-1',
        type: 'mcq',
        question: 'How does a blockchain network agree on which transactions are valid?',
        options: [
          'A CEO approves each transaction',
          'Through a consensus mechanism where nodes verify transactions',
          'By sending transactions to a government agency',
          'Only the person sending money decides',
        ],
        correctAnswer: 1,
        explanation:
          'Blockchain networks use consensus mechanisms (like Proof of Work or Proof of Stake) where multiple nodes independently verify and agree on which transactions are valid before adding them to the chain.',
      },
    ],
  },
  {
    id: 'module-2',
    title: 'Wallets & Keys',
    description: 'Understand wallet types, public and private keys, and how to keep your crypto safe.',
    icon: '\u{1F511}',
    passingScore: 4,
    questions: [
      {
        id: 'm2q1',
        moduleId: 'module-2',
        type: 'mcq',
        question: 'What is a crypto wallet?',
        options: [
          'A physical wallet that stores coins',
          'Software or hardware that stores your private keys and lets you interact with blockchains',
          'A bank account for cryptocurrency',
          'A website where you buy Bitcoin',
        ],
        correctAnswer: 1,
        explanation:
          'A crypto wallet stores your private keys — the secret codes that prove ownership of your crypto assets. It lets you sign transactions and interact with blockchain networks.',
      },
      {
        id: 'm2q2',
        moduleId: 'module-2',
        type: 'mcq',
        question: 'What is a public key used for?',
        options: [
          'To sign and authorize transactions',
          'To recover your wallet if you lose it',
          'As your wallet address so others can send you crypto',
          'To mine new cryptocurrency',
        ],
        correctAnswer: 2,
        explanation:
          'Your public key (or a derived address) is like your email address — you share it so others can send you crypto. It is safe to share publicly, unlike your private key.',
      },
      {
        id: 'm2q3',
        moduleId: 'module-2',
        type: 'truefalse',
        question: 'It is safe to share your private key with customer support to help recover your wallet.',
        options: ['True', 'False'],
        correctAnswer: 1,
        explanation:
          'False. You should NEVER share your private key with anyone. No legitimate service will ever ask for it. Anyone with your private key can steal all your funds.',
      },
      {
        id: 'm2q4',
        moduleId: 'module-2',
        type: 'mcq',
        question: 'What is a seed phrase (recovery phrase)?',
        options: [
          'A password you create for your wallet app',
          'A set of 12 or 24 words that can restore your wallet on any device',
          'A secret code the blockchain generates for each transaction',
          'Your wallet\'s public address in word form',
        ],
        correctAnswer: 1,
        explanation:
          'A seed phrase is a series of 12 or 24 words generated when you create a wallet. It can regenerate all your private keys, so it must be stored securely offline — never digitally.',
      },
      {
        id: 'm2q5',
        moduleId: 'module-2',
        type: 'mcq',
        question: 'Which is the safest way to store your seed phrase?',
        options: [
          'In a note on your phone',
          'In a screenshot saved to cloud storage',
          'Written on paper and stored in a secure physical location',
          'In a text message to yourself',
        ],
        correctAnswer: 2,
        explanation:
          'Writing your seed phrase on paper and storing it in a secure physical location (like a safe) is the safest option. Digital storage (phone, cloud, messages) is vulnerable to hacking.',
      },
    ],
  },
  {
    id: 'module-3',
    title: 'Solana Basics',
    description: 'Discover what makes Solana fast, cheap, and developer-friendly.',
    icon: '\u{26A1}',
    passingScore: 4,
    questions: [
      {
        id: 'm3q1',
        moduleId: 'module-3',
        type: 'mcq',
        question: 'What is SOL?',
        options: [
          'A stablecoin pegged to the US dollar',
          'The native cryptocurrency of the Solana blockchain',
          'A type of NFT on Ethereum',
          'A decentralized exchange',
        ],
        correctAnswer: 1,
        explanation:
          'SOL is the native token of the Solana blockchain. It is used to pay transaction fees, participate in staking, and interact with dApps built on Solana.',
      },
      {
        id: 'm3q2',
        moduleId: 'module-3',
        type: 'truefalse',
        question: 'Solana can process thousands of transactions per second, making it one of the fastest blockchains.',
        options: ['True', 'False'],
        correctAnswer: 0,
        explanation:
          'True. Solana is designed for high throughput and can theoretically process up to 65,000 transactions per second (TPS), compared to Ethereum\'s ~15 TPS on its base layer.',
      },
      {
        id: 'm3q3',
        moduleId: 'module-3',
        type: 'mcq',
        question: 'What is "Proof of History" in Solana?',
        options: [
          'A method of recording the history of all Bitcoin transactions',
          'A cryptographic clock that timestamps transactions to speed up consensus',
          'A feature that lets you view the transaction history of any wallet',
          'A way to prove you owned crypto in the past',
        ],
        correctAnswer: 1,
        explanation:
          'Proof of History (PoH) is Solana\'s innovation — a cryptographic clock that creates a verifiable order of events. This allows nodes to agree on time without communicating, dramatically speeding up consensus.',
      },
      {
        id: 'm3q4',
        moduleId: 'module-3',
        type: 'mcq',
        question: 'What is "Devnet" in Solana?',
        options: [
          'The main network where real SOL has value',
          'A test network where developers can experiment with free, fake SOL',
          'A private blockchain only for Solana employees',
          'A mobile app for trading SOL',
        ],
        correctAnswer: 1,
        explanation:
          'Devnet is Solana\'s test network. It works just like the real network (Mainnet) but uses worthless test SOL. It\'s perfect for learning and development without financial risk — which is what SolanaEdu uses!',
      },
      {
        id: 'm3q5',
        moduleId: 'module-3',
        type: 'truefalse',
        question: 'Transaction fees on Solana typically cost several dollars per transaction.',
        options: ['True', 'False'],
        correctAnswer: 1,
        explanation:
          'False. Solana is known for extremely low fees — typically a fraction of a cent per transaction (around $0.00025). This makes it accessible for everyone, especially those learning.',
      },
    ],
  },
  {
    id: 'module-4',
    title: 'DeFi Introduction',
    description: 'Explore decentralized finance — DEXes, staking, smart contracts, and open access.',
    icon: '\u{1F3E6}',
    passingScore: 4,
    questions: [
      {
        id: 'm4q1',
        moduleId: 'module-4',
        type: 'mcq',
        question: 'What does "DeFi" stand for?',
        options: [
          'Digital Finance',
          'Decentralized Finance',
          'Defined Financial Instruments',
          'Deflationary Finance',
        ],
        correctAnswer: 1,
        explanation:
          'DeFi stands for Decentralized Finance. It refers to financial services (lending, borrowing, trading) built on blockchain technology that operate without traditional intermediaries like banks.',
      },
      {
        id: 'm4q2',
        moduleId: 'module-4',
        type: 'mcq',
        question: 'What is a DEX (Decentralized Exchange)?',
        options: [
          'A government-regulated crypto exchange',
          'A peer-to-peer trading platform that operates without a central authority',
          'A crypto wallet that supports multiple blockchains',
          'A tool for creating new cryptocurrencies',
        ],
        correctAnswer: 1,
        explanation:
          'A DEX lets you trade crypto directly with others using smart contracts — no company holds your funds. Examples on Solana include Jupiter and Raydium.',
      },
      {
        id: 'm4q3',
        moduleId: 'module-4',
        type: 'truefalse',
        question: 'In DeFi, you need to provide your ID and go through bank verification to use most services.',
        options: ['True', 'False'],
        correctAnswer: 1,
        explanation:
          'False. Most DeFi protocols are permissionless — anyone with a crypto wallet can participate without identity verification. This is a key difference from traditional finance.',
      },
      {
        id: 'm4q4',
        moduleId: 'module-4',
        type: 'mcq',
        question: 'What is "staking" in crypto?',
        options: [
          'Selling your crypto at a loss',
          'Locking up your crypto to help secure the network and earn rewards',
          'Converting crypto to fiat currency',
          'Creating a new blockchain',
        ],
        correctAnswer: 1,
        explanation:
          'Staking involves locking up your tokens to help validate transactions on a Proof of Stake blockchain. In return, you earn staking rewards — similar to earning interest.',
      },
      {
        id: 'm4q5',
        moduleId: 'module-4',
        type: 'mcq',
        question: 'What is a smart contract?',
        options: [
          'A legal document signed digitally',
          'Self-executing code on the blockchain that runs automatically when conditions are met',
          'A contract between a crypto exchange and its users',
          'An AI that trades crypto for you',
        ],
        correctAnswer: 1,
        explanation:
          'Smart contracts are programs stored on the blockchain that automatically execute when predetermined conditions are met. They power DeFi by replacing intermediaries with code.',
      },
    ],
  },
  {
    id: 'module-5',
    title: 'Safety & Scams',
    description: 'Learn to identify common crypto scams and protect your digital assets.',
    icon: '\u{1F6E1}\uFE0F',
    passingScore: 4,
    questions: [
      {
        id: 'm5q1',
        moduleId: 'module-5',
        type: 'mcq',
        question: 'Someone on social media promises to "double your SOL" if you send them some first. What should you do?',
        options: [
          'Send a small amount to test if it works',
          'Ignore it — this is a classic doubling scam',
          'Share it with friends so they can benefit too',
          'Report it but also send some just in case',
        ],
        correctAnswer: 1,
        explanation:
          'This is a classic "doubling scam." No one can magically double your crypto. Any such offer is 100% a scam. Never send crypto to strangers promising returns.',
      },
      {
        id: 'm5q2',
        moduleId: 'module-5',
        type: 'mcq',
        question: 'You receive an email that looks like it\'s from Phantom wallet asking you to "verify your seed phrase." What is this?',
        options: [
          'A legitimate security check from Phantom',
          'A phishing attack trying to steal your seed phrase',
          'A routine wallet maintenance request',
          'An automatic update notification',
        ],
        correctAnswer: 1,
        explanation:
          'This is phishing. Legitimate wallet providers will NEVER ask for your seed phrase via email, DM, or any other channel. Anyone asking for your seed phrase is trying to steal your funds.',
      },
      {
        id: 'm5q3',
        moduleId: 'module-5',
        type: 'mcq',
        question: 'What is a "rug pull" in crypto?',
        options: [
          'When a blockchain network crashes temporarily',
          'When developers abandon a project and run away with investors\' money',
          'When the price of crypto drops due to market conditions',
          'When a wallet gets hacked',
        ],
        correctAnswer: 1,
        explanation:
          'A rug pull is when the creators of a crypto project suddenly withdraw all funds and disappear. Warning signs include anonymous teams, unrealistic promises, and locked liquidity periods that suddenly end.',
      },
      {
        id: 'm5q4',
        moduleId: 'module-5',
        type: 'truefalse',
        question: 'Storing your seed phrase in a screenshot or cloud note is a safe backup method.',
        options: ['True', 'False'],
        correctAnswer: 1,
        explanation:
          'False. Digital storage (screenshots, cloud notes, emails) can be hacked. The safest backup is writing your seed phrase on paper and storing it in a secure physical location like a safe or safety deposit box.',
      },
      {
        id: 'm5q5',
        moduleId: 'module-5',
        type: 'mcq',
        question: 'Before connecting your wallet to a new dApp, what should you check?',
        options: [
          'Nothing — all dApps on Solana are safe',
          'Only if the website looks professional',
          'The URL, team reputation, smart contract audits, and community reviews',
          'Just ask in a Telegram group if it\'s legit',
        ],
        correctAnswer: 2,
        explanation:
          'Always verify a dApp before connecting your wallet. Check: (1) the URL is correct (not a lookalike), (2) the team is known and reputable, (3) smart contracts are audited, and (4) the community has positive reviews.',
      },
    ],
  },
];

export function getModuleById(id: string): QuizModule | undefined {
  return MODULES.find((m) => m.id === id);
}
