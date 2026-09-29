import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Subject

CURRICULUM_DATA = [
    # ================================================================
    # 1. Computer Application (BCA)
    # ================================================================
    # --- Semester 1 ---
    {
        "code": "BCA-101",
        "name": "Programming in C",
        "department": "Computer Application (BCA)",
        "semester": 1,
        "icon": "Code",
        "syllabus_overview": "Unit I: C Fundamentals & Data Types. Unit II: Control Structures (if/else, loops). Unit III: Arrays & Strings. Unit IV: Functions & Pointers. Unit V: Structures, Unions & File Handling.",
        "recommended_topics": [
            {"unit": "Unit I", "title": "C Fundamentals", "topics": ["Data Types & Operators", "Variable Declarations", "Input/Output with printf/scanf"]},
            {"unit": "Unit II", "title": "Control Flow", "topics": ["Conditional Statements", "While & For Loops", "Switch-Case Constructs"]},
            {"unit": "Unit III", "title": "Arrays & Strings", "topics": ["Single & Multi-dimensional Arrays", "String Manipulation Functions", "Character Arrays"]},
            {"unit": "Unit IV", "title": "Functions & Memory", "topics": ["Pass by Value vs Reference", "Pointer Arithmetic", "Dynamic Memory Allocation (malloc/calloc)"]},
            {"unit": "Unit V", "title": "File I/O & Structs", "topics": ["Structures & Unions", "File Operations (fopen/fclose)", "Sequential vs Random Access"]}
        ]
    },
    {
        "code": "BCA-102",
        "name": "Digital Electronics",
        "department": "Computer Application (BCA)",
        "semester": 1,
        "icon": "Cpu",
        "syllabus_overview": "Unit I: Number Systems & Boolean Algebra. Unit II: Logic Gates & Minimization (K-Maps). Unit III: Combinational Circuits. Unit IV: Sequential Circuits & Flip-Flops. Unit V: Registers & Counters.",
        "recommended_topics": [
            {"unit": "Unit I", "title": "Number Systems", "topics": ["Binary, Octal, Hex Conversions", "1's and 2's Complements", "Boolean Laws & DeMorgan Theorems"]},
            {"unit": "Unit II", "title": "Logic Simplification", "topics": ["AND, OR, NOT, NAND, NOR, XOR", "K-Map 2, 3, 4 Variables", "Don't Care Conditions"]},
            {"unit": "Unit III", "title": "Combinational Logic", "topics": ["Half & Full Adders", "Multiplexers & Demultiplexers", "Encoders & Decoders"]},
            {"unit": "Unit IV", "title": "Sequential Logic", "topics": ["SR, JK, D, T Flip-Flops", "Race-around Condition", "Master-Slave JK Flip-Flop"]},
            {"unit": "Unit V", "title": "Registers & Counters", "topics": ["Shift Registers (SISO/SIPO/PIPO)", "Synchronous Counters", "Asynchronous Ripple Counters"]}
        ]
    },
    {
        "code": "BCA-103",
        "name": "Mathematical Foundation for Computing",
        "department": "Computer Application (BCA)",
        "semester": 1,
        "icon": "Sigma",
        "syllabus_overview": "Unit I: Matrices & Determinants. Unit II: Differential Calculus. Unit III: Integral Calculus. Unit IV: Sets & Relations. Unit V: Logic & Propositional Calculus.",
        "recommended_topics": [
            {"unit": "Unit I", "title": "Matrices", "topics": ["Matrix Operations & Inverse", "Eigenvalues & Eigenvectors", "Rank of Matrix"]},
            {"unit": "Unit II", "title": "Calculus", "topics": ["Limits & Continuity", "Differentiation Rules", "Maxima and Minima"]},
            {"unit": "Unit III", "title": "Integration", "topics": ["Indefinite & Definite Integrals", "Integration by Parts", "Area under Curves"]},
            {"unit": "Unit IV", "title": "Set Theory", "topics": ["Sets & Venn Diagrams", "Equivalence Relations", "Functions & Mappings"]},
            {"unit": "Unit V", "title": "Mathematical Logic", "topics": ["Propositions & Truth Tables", "Tautologies & Contradictions", "Logical Equivalences"]}
        ]
    },

    # --- Semester 2 ---
    {
        "code": "BCA-201",
        "name": "Data Structures using C",
        "department": "Computer Application (BCA)",
        "semester": 2,
        "icon": "Layers",
        "syllabus_overview": "Unit I: Linear Data Structures (Stacks & Queues). Unit II: Linked Lists (Singly, Doubly, Circular). Unit III: Trees & Binary Search Trees. Unit IV: Graphs & Graph Traversals. Unit V: Sorting & Searching.",
        "recommended_topics": [
            {"unit": "Unit I", "title": "Stacks & Queues", "topics": ["Stack Operations & Postfix Evaluation", "Linear & Circular Queue", "Priority Queue"]},
            {"unit": "Unit II", "title": "Linked Lists", "topics": ["Singly Linked List Implementation", "Doubly Linked List", "Polynomial Addition using Linked List"]},
            {"unit": "Unit III", "title": "Trees & BST", "topics": ["Binary Tree Traversals (In/Pre/Post)", "Binary Search Tree Operations", "AVL Tree Rotations"]},
            {"unit": "Unit IV", "title": "Graphs", "topics": ["Adjacency Matrix & Lists", "Breadth First Search (BFS)", "Depth First Search (DFS)"]},
            {"unit": "Unit V", "title": "Algorithms", "topics": ["QuickSort & MergeSort", "Binary Search", "Hash Tables & Collision Resolution"]}
        ]
    },
    {
        "code": "BCA-202",
        "name": "Object Oriented Programming with C++",
        "department": "Computer Application (BCA)",
        "semester": 2,
        "icon": "Box",
        "syllabus_overview": "Unit I: Principles of OOP & Basics. Unit II: Classes & Objects, Constructors. Unit III: Inheritance & Polymorphism. Unit IV: Operator Overloading & Virtual Functions. Unit V: Templates & Exception Handling.",
        "recommended_topics": [
            {"unit": "Unit I", "title": "OOP Basics", "topics": ["Encapsulation & Abstraction", "Tokens, Expressions, Control Structures", "Function Overloading"]},
            {"unit": "Unit II", "title": "Classes & Objects", "topics": ["Constructors & Destructors", "Friend Functions & Classes", "Static Members"]},
            {"unit": "Unit III", "title": "Inheritance", "topics": ["Single, Multiple, Multilevel Inheritance", "Hierarchical & Hybrid Inheritance", "Virtual Base Classes"]},
            {"unit": "Unit IV", "title": "Polymorphism", "topics": ["Compile-time vs Runtime Polymorphism", "Virtual Functions & Pure Virtual Functions", "Abstract Classes"]},
            {"unit": "Unit V", "title": "Templates & STL", "topics": ["Function & Class Templates", "Try/Catch Exception Handling", "Standard Template Library (Vectors, Maps)"]}
        ]
    },
    {
        "code": "BCA-203",
        "name": "Discrete Mathematics",
        "department": "Computer Application (BCA)",
        "semester": 2,
        "icon": "GitFork",
        "syllabus_overview": "Unit I: Mathematical Reasoning & Induction. Unit II: Relations, Functions & Orderings. Unit III: Recurrence Relations & Generating Functions. Unit IV: Algebraic Structures & Groups. Unit V: Graph Theory & Trees.",
        "recommended_topics": [
            {"unit": "Unit I", "title": "Induction & Proofs", "topics": ["Principle of Mathematical Induction", "Predicate Logic & Quantifiers", "Proof Techniques"]},
            {"unit": "Unit II", "title": "Relations & Posets", "topics": ["Partial Order Relations & Hasse Diagrams", "Lattices & Properties", "Functions & Inverses"]},
            {"unit": "Unit III", "title": "Recurrence", "topics": ["Linear Recurrence with Constant Coeffs", "Generating Functions", "Pigeonhole Principle"]},
            {"unit": "Unit IV", "title": "Algebraic Structures", "topics": ["Semigroups & Monoids", "Groups, Subgroups & Cosets", "Lagrange Theorem"]},
            {"unit": "Unit V", "title": "Graphs & Planarity", "topics": ["Euler & Hamiltonian Paths", "Planar Graphs & Coloring", "Spanning Trees (Kruskal/Prim)"]}
        ]
    },

    # --- Semester 3 ---
    {
        "code": "BCA-301",
        "name": "Database Management Systems (DBMS)",
        "department": "Computer Application (BCA)",
        "semester": 3,
        "icon": "Database",
        "syllabus_overview": "Unit I: DBMS Architecture & ER Modeling. Unit II: Relational Model & Relational Algebra. Unit III: SQL & Normalization (1NF to BCNF). Unit IV: Transaction Processing & Concurrency. Unit V: Storage, Indexing & Recovery.",
        "recommended_topics": [
            {"unit": "Unit I", "title": "ER Modeling", "topics": ["3-Tier Architecture & Data Independence", "Entity Sets, Attributes, Relationships", "Extended ER Features"]},
            {"unit": "Unit II", "title": "Relational Model", "topics": ["Relational Integrity Constraints", "Relational Algebra Operations", "Tuple Relational Calculus"]},
            {"unit": "Unit III", "title": "SQL & Normalization", "topics": ["DDL, DML, Subqueries & Joins", "Functional Dependencies", "1NF, 2NF, 3NF, BCNF Decomposition"]},
            {"unit": "Unit IV", "title": "Transactions", "topics": ["ACID Properties", "Serializability & Schedules", "Two-Phase Locking (2PL) & Deadlocks"]},
            {"unit": "Unit V", "title": "Storage & Recovery", "topics": ["B-Trees and B+ Tree Indexing", "Log-based Recovery", "Checkpointing"]}
        ]
    },
    {
        "code": "BCA-302",
        "name": "Computer Organization & Architecture",
        "department": "Computer Application (BCA)",
        "semester": 3,
        "icon": "Cpu",
        "syllabus_overview": "Unit I: Basic Computer Architecture & Register Transfer. Unit II: Microprogrammed Control. Unit III: Central Processing Unit & Addressing Modes. Unit IV: Computer Arithmetic (Booth Algorithm). Unit V: Memory Hierarchy & I/O Organization.",
        "recommended_topics": [
            {"unit": "Unit I", "title": "Register Transfer", "topics": ["Bus and Memory Transfers", "Instruction Codes & Registers", "Instruction Cycle"]},
            {"unit": "Unit II", "title": "Control Unit", "topics": ["Hardwired vs Microprogrammed Control", "Control Memory & Address Sequencing", "Microinstruction Format"]},
            {"unit": "Unit III", "title": "CPU Design", "topics": ["General Register Organization", "Stack Organization & Addressing Modes", "RISC vs CISC Architecture"]},
            {"unit": "Unit IV", "title": "Arithmetic Algorithms", "topics": ["Booth's Multiplication Algorithm", "Restoring & Non-restoring Division", "Floating Point Representation (IEEE 754)"]},
            {"unit": "Unit V", "title": "Memory Organization", "topics": ["Cache Memory & Mapping Techniques", "Virtual Memory & Page Replacement", "DMA Controller & Interrupts"]}
        ]
    },
    {
        "code": "BCA-303",
        "name": "Python Programming",
        "department": "Computer Application (BCA)",
        "semester": 3,
        "icon": "Terminal",
        "syllabus_overview": "Unit I: Python Basics, Data Types & Control Flow. Unit II: Data Structures (Lists, Tuples, Sets, Dicts). Unit III: Functions, Modules & Packages. Unit IV: OOP in Python. Unit V: File Handling & Scientific Libraries (NumPy, Pandas).",
        "recommended_topics": [
            {"unit": "Unit I", "title": "Python Syntax", "topics": ["Variables, Types & Operators", "Conditionals & Looping", "Comprehensions"]},
            {"unit": "Unit II", "title": "Collections", "topics": ["List Slicing & Methods", "Tuple Packing/Unpacking", "Dictionary Operations & Sets"]},
            {"unit": "Unit III", "title": "Modular Programming", "topics": ["Lambda, Map, Filter, Reduce", "User-defined Modules", "pip & Virtual Environments"]},
            {"unit": "Unit IV", "title": "Python Classes", "topics": ["Magic Methods (__init__, __str__)", "Inheritance & Encapsulation", "Custom Exceptions"]},
            {"unit": "Unit V", "title": "Libraries & Files", "topics": ["Reading/Writing JSON & CSV", "NumPy Arrays & Vectorization", "Pandas DataFrames Basics"]}
        ]
    },

    # --- Semester 4 ---
    {
        "code": "BCA-401",
        "name": "Operating Systems",
        "department": "Computer Application (BCA)",
        "semester": 4,
        "icon": "Server",
        "syllabus_overview": "Unit I: OS Concepts & System Calls. Unit II: Process Management & CPU Scheduling. Unit III: Process Synchronization & Deadlocks. Unit IV: Memory Management & Virtual Memory. Unit V: Storage, File Systems & Disk Scheduling.",
        "recommended_topics": [
            {"unit": "Unit I", "title": "OS Foundations", "topics": ["Kernel Architecture & System Calls", "Process States & PCB", "Inter-Process Communication (IPC)"]},
            {"unit": "Unit II", "title": "CPU Scheduling", "topics": ["FCFS, SJF, Priority Scheduling", "Round Robin Scheduling", "Multilevel Feedback Queues"]},
            {"unit": "Unit III", "title": "Synchronization", "topics": ["Critical Section Problem", "Semaphores & Mutexes", "Banker's Algorithm for Deadlocks"]},
            {"unit": "Unit IV", "title": "Memory Systems", "topics": ["Paging & Segmentation", "Page Faults & Demand Paging", "Page Replacement (FIFO, LRU, Optimal)"]},
            {"unit": "Unit V", "title": "Disk & Storage", "topics": ["Disk Scheduling (SSTF, SCAN, C-SCAN)", "File Allocation Methods", "Directory Structures"]}
        ]
    },
    {
        "code": "BCA-402",
        "name": "Java Programming",
        "department": "Computer Application (BCA)",
        "semester": 4,
        "icon": "Coffee",
        "syllabus_overview": "Unit I: Java Language Fundamentals & JVM. Unit II: Classes, Inheritance & Packages. Unit III: Exception Handling & Multithreading. Unit IV: Java Collections Framework. Unit V: JDBC & GUI Basics.",
        "recommended_topics": [
            {"unit": "Unit I", "title": "Java Architecture", "topics": ["JVM, JRE, JDK Execution Model", "Bytecode & Garbage Collection", "Access Specifiers"]},
            {"unit": "Unit II", "title": "OOP & Interfaces", "topics": ["Method Overriding vs Overloading", "Abstract Classes & Interfaces", "Package Creation & Imports"]},
            {"unit": "Unit III", "title": "Threads & Errors", "topics": ["Checked vs Unchecked Exceptions", "Thread Lifecycle & Synchronization", "Runnable vs Thread Class"]},
            {"unit": "Unit IV", "title": "Collections", "topics": ["ArrayList, LinkedList & Vector", "HashSet & TreeSet", "HashMap & Iterators"]},
            {"unit": "Unit V", "title": "Database Access", "topics": ["JDBC Architecture", "Statement & PreparedStatement", "Executing CRUD Operations"]}
        ]
    },
    {
        "code": "BCA-403",
        "name": "Software Engineering",
        "department": "Computer Application (BCA)",
        "semester": 4,
        "icon": "FileCheck",
        "syllabus_overview": "Unit I: SDLC Models (Waterfall, Agile, Spiral). Unit II: Requirements Engineering & SRS. Unit III: Software Design (UML, Architectural Styles). Unit IV: Testing Strategies (Black-box, White-box). Unit V: Maintenance & Project Metrics.",
        "recommended_topics": [
            {"unit": "Unit I", "title": "Process Models", "topics": ["Waterfall vs Agile Scrum", "Spiral & Prototype Models", "Software Quality Metrics"]},
            {"unit": "Unit II", "title": "Requirements", "topics": ["Functional & Non-Functional Requirements", "IEEE SRS Document Standard", "Use Case Diagrams"]},
            {"unit": "Unit III", "title": "System Design", "topics": ["Cohesion and Coupling Principles", "Class & Sequence Diagrams", "Data Flow Diagrams (DFDs)"]},
            {"unit": "Unit IV", "title": "Verification & Testing", "topics": ["Unit, Integration, System Testing", "Cyclomatic Complexity", "Equivalence Partitioning & BVA"]},
            {"unit": "Unit V", "title": "Maintenance", "topics": ["COCOMO Estimation Model", "Version Control & Git Workflows", "Software Risk Management"]}
        ]
    },

    # ================================================================
    # 2. Computer Science & Engineering (B.Tech CSE)
    # ================================================================
    {
        "code": "CSE-101",
        "name": "Engineering Physics",
        "department": "Computer Science & Engineering (B.Tech CSE)",
        "semester": 1,
        "icon": "Atom",
        "syllabus_overview": "Unit I: Quantum Mechanics. Unit II: Wave Optics & Interference. Unit III: Lasers & Fiber Optics. Unit IV: Electromagnetism & Maxwell Equations. Unit V: Semiconductor Physics.",
        "recommended_topics": [
            {"unit": "Unit I", "title": "Quantum Physics", "topics": ["Wave-Particle Duality", "Schrödinger Wave Equation", "Particle in a 1D Box"]},
            {"unit": "Unit II", "title": "Wave Optics", "topics": ["Interference in Thin Films", "Fraunhofer Diffraction", "Polarization of Light"]},
            {"unit": "Unit III", "title": "Lasers & Fibers", "topics": ["Spontaneous & Stimulated Emission", "Ruby & He-Ne Lasers", "Numerical Aperture in Fiber Optics"]},
            {"unit": "Unit IV", "title": "Electromagnetism", "topics": ["Maxwell's Equations", "Poynting Vector", "Electromagnetic Wave Propagation"]},
            {"unit": "Unit V", "title": "Solid State", "topics": ["Band Theory of Solids", "Intrinsic & Extrinsic Semiconductors", "Hall Effect"]}
        ]
    },
    {
        "code": "CSE-102",
        "name": "Calculus & Linear Algebra",
        "department": "Computer Science & Engineering (B.Tech CSE)",
        "semester": 1,
        "icon": "Sigma",
        "syllabus_overview": "Unit I: Vector Spaces & Linear Systems. Unit II: Eigenvalues & Cayley-Hamilton. Unit III: Multivariable Calculus. Unit IV: Multiple Integrals. Unit V: Vector Calculus & Theorems.",
        "recommended_topics": [
            {"unit": "Unit I", "title": "Linear Systems", "topics": ["Vector Spaces & Subspaces", "Basis and Dimension", "Gauss Elimination & Matrix Rank"]},
            {"unit": "Unit II", "title": "Eigenvalues", "topics": ["Characteristic Equations", "Diagonalization of Matrices", "Cayley-Hamilton Theorem Application"]},
            {"unit": "Unit III", "title": "Multivariable Calc", "topics": ["Partial Derivatives & Chain Rule", "Gradient, Directional Derivatives", "Taylor's Series for 2 Variables"]},
            {"unit": "Unit IV", "title": "Integrals", "topics": ["Double & Triple Integrals", "Change of Variables & Jacobians", "Volume and Surface Area"]},
            {"unit": "Unit V", "title": "Vector Fields", "topics": ["Divergence and Curl", "Green's Theorem in Plane", "Stokes and Gauss Divergence Theorems"]}
        ]
    },
    {
        "code": "CSE-201",
        "name": "Digital Logic & Computer Design",
        "department": "Computer Science & Engineering (B.Tech CSE)",
        "semester": 2,
        "icon": "Cpu",
        "syllabus_overview": "Unit I: Boolean Functions & Logic Simplification. Unit II: Combinational Logic Design. Unit III: Synchronous Sequential Logic. Unit IV: Memory & Programmable Logic (PLAs, FPGAs). Unit V: Register Transfer & Basic Computer Operations.",
        "recommended_topics": [
            {"unit": "Unit I", "title": "Logic Foundations", "topics": ["Quine-McCluskey Method", "NAND/NOR Universal Gates", "Propagation Delay & Fan-Out"]},
            {"unit": "Unit II", "title": "Combinational Blocks", "topics": ["Carry Lookahead Adders", "ALU Architecture", "Priority Encoders"]},
            {"unit": "Unit III", "title": "Sequential Design", "topics": ["State Machines (Mealy & Moore)", "State Reduction & Assignment", "Sequence Detectors"]},
            {"unit": "Unit IV", "title": "Programmable Logic", "topics": ["ROM, PLA, PAL Architectures", "FPGA Architecture Overview", "Static vs Dynamic RAM"]},
            {"unit": "Unit V", "title": "RTL Design", "topics": ["Algorithmic State Machines (ASM)", "Data Path vs Control Path", "Hardware Description Languages (Verilog Basics)"]}
        ]
    },
    {
        "code": "CSE-301",
        "name": "Design & Analysis of Algorithms",
        "department": "Computer Science & Engineering (B.Tech CSE)",
        "semester": 3,
        "icon": "Network",
        "syllabus_overview": "Unit I: Asymptotic Analysis & Recurrences. Unit II: Divide and Conquer. Unit III: Greedy Method & Dynamic Programming. Unit IV: Backtracking & Branch and Bound. Unit V: NP-Completeness & Approximation.",
        "recommended_topics": [
            {"unit": "Unit I", "title": "Complexity Analysis", "topics": ["Big O, Big Omega, Theta Notations", "Master Theorem for Recurrences", "Amortized Analysis"]},
            {"unit": "Unit II", "title": "Divide & Conquer", "topics": ["Strassen's Matrix Multiplication", "Quickselect & Medians", "Convex Hull Algorithms"]},
            {"unit": "Unit III", "title": "Optimization", "topics": ["Fractional vs 0/1 Knapsack", "Longest Common Subsequence (LCS)", "Floyd-Warshall All-Pairs Shortest Path"]},
            {"unit": "Unit IV", "title": "State Space Search", "topics": ["N-Queens Problem Backtracking", "Subset Sum & Hamiltonian Cycle", "Travelling Salesperson Branch & Bound"]},
            {"unit": "Unit V", "title": "Complexity Classes", "topics": ["P, NP, NP-Complete & NP-Hard", "Cook's Theorem & SAT Problem", "Vertex Cover Approximation"]}
        ]
    },
    {
        "code": "CSE-401",
        "name": "Theory of Computation & Automata",
        "department": "Computer Science & Engineering (B.Tech CSE)",
        "semester": 4,
        "icon": "GitBranch",
        "syllabus_overview": "Unit I: Finite Automata (DFA, NFA). Unit II: Regular Expressions & Pumping Lemma. Unit III: Context-Free Grammars & Pushdown Automata. Unit IV: Turing Machines. Unit V: Undecidability & Halting Problem.",
        "recommended_topics": [
            {"unit": "Unit I", "title": "Finite Automata", "topics": ["Deterministic vs Non-deterministic Automata", "NFA to DFA Conversion (Subset Construction)", "Minimization of DFA (Myhill-Nerode)"]},
            {"unit": "Unit II", "title": "Regular Languages", "topics": ["Regular Expressions & Arden's Theorem", "Pumping Lemma for Regular Languages", "Closure Properties of Regular Sets"]},
            {"unit": "Unit III", "title": "Grammars & PDA", "topics": ["Chomsky Normal Form (CNF) & GNF", "Pushdown Automata (DPDA vs NPDA)", "Pumping Lemma for CFLs"]},
            {"unit": "Unit IV", "title": "Turing Machines", "topics": ["Standard Turing Machine Definition", "Multitape & Non-deterministic TMs", "Church-Turing Thesis"]},
            {"unit": "Unit V", "title": "Decidability", "topics": ["Universal Turing Machine", "Halting Problem Undecidability", "Post Correspondence Problem (PCP)"]}
        ]
    },
    {
        "code": "CSE-501",
        "name": "Compiler Design",
        "department": "Computer Science & Engineering (B.Tech CSE)",
        "semester": 5,
        "icon": "Terminal",
        "syllabus_overview": "Unit I: Lexical Analysis (Lex). Unit II: Syntax Analysis (LL, LR, LALR Parsers). Unit III: Syntax Directed Translation & Semantic Analysis. Unit IV: Intermediate Code Generation (Three-Address Code). Unit V: Code Optimization & Generation.",
        "recommended_topics": [
            {"unit": "Unit I", "title": "Lexical Analysis", "topics": ["Token Specification & Recognition", "Regular Expressions to DFA", "Lex/Flex Scanner Generator"]},
            {"unit": "Unit II", "title": "Parsing Techniques", "topics": ["Top-down Recursive Descent & LL(1)", "Bottom-up Shift-Reduce & LR(0), SLR(1)", "LALR & Canonical LR Parsers (Yacc/Bison)"]},
            {"unit": "Unit III", "title": "Semantic Analysis", "topics": ["Syntax Directed Definitions (SDD)", "S-attributed & L-attributed Definitions", "Symbol Table Organization & Type Checking"]},
            {"unit": "Unit IV", "title": "Intermediate Representation", "topics": ["Syntax Trees & DAGs", "Three-Address Code Formats (Quadruples/Triples)", "Backpatching for Boolean Expressions"]},
            {"unit": "Unit V", "title": "Optimization & Codegen", "topics": ["Basic Blocks & Flow Graphs", "Loop Optimization & Dead Code Elimination", "Register Allocation & DAG Code Generation"]}
        ]
    },

    # ================================================================
    # 3. Information Technology (B.Tech IT)
    # ================================================================
    {
        "code": "IT-101",
        "name": "Fundamentals of Information Technology",
        "department": "Information Technology (B.Tech IT)",
        "semester": 1,
        "icon": "Monitor",
        "syllabus_overview": "Unit I: IT Systems Architecture. Unit II: Operating Environments. Unit III: Networking Basics. Unit IV: Web & Internet Standards. Unit V: IT Security & Ethics.",
        "recommended_topics": [
            {"unit": "Unit I", "title": "IT Systems", "topics": ["Hardware Components & Peripherals", "System Software vs Application Software", "Data Storage Hierarchy"]},
            {"unit": "Unit II", "title": "OS Foundations", "topics": ["Windows vs Linux Architectures", "Process & File Command Line Tools", "Virtualization Concepts"]},
            {"unit": "Unit III", "title": "Networking", "topics": ["LAN, WAN, MAN Infrastructures", "IP Addressing & DNS Resolution", "Client-Server Paradigms"]},
            {"unit": "Unit IV", "title": "Internet Standards", "topics": ["HTTP/HTTPS Protocols", "HTML5 & CSS3 Fundamentals", "Domain Registrars & Web Hosting"]},
            {"unit": "Unit V", "title": "Security Ethics", "topics": ["Malware Types & Defense", "Password Security & 2FA", "Intellectual Property & Licensing"]}
        ]
    },
    {
        "code": "IT-301",
        "name": "Database Engineering & Warehousing",
        "department": "Information Technology (B.Tech IT)",
        "semester": 3,
        "icon": "Database",
        "syllabus_overview": "Unit I: Advanced SQL & PL/SQL. Unit II: Data Warehousing Architectures. Unit III: ETL Pipelines & Star Schemas. Unit IV: NoSQL Databases (MongoDB). Unit V: Distributed Databases.",
        "recommended_topics": [
            {"unit": "Unit I", "title": "Advanced SQL", "topics": ["Stored Procedures & Triggers", "Window Functions & CTEs", "Query Execution Plans"]},
            {"unit": "Unit II", "title": "Data Warehousing", "topics": ["OLTP vs OLAP Systems", "Data Marts & Enterprise Warehouses", "Multidimensional Data Models"]},
            {"unit": "Unit III", "title": "ETL & Modeling", "topics": ["Star vs Snowflake Schema", "Fact & Dimension Tables", "ETL Data Extraction & Cleaning"]},
            {"unit": "Unit IV", "title": "NoSQL Systems", "topics": ["CAP Theorem & BASE Properties", "Document Stores (MongoDB Collections)", "Key-Value & Columnar Stores"]},
            {"unit": "Unit V", "title": "Distributed DBs", "topics": ["Data Fragmentation & Replication", "Distributed Two-Phase Commit", "Sharding Strategies"]}
        ]
    },
    {
        "code": "IT-501",
        "name": "Cloud Computing & DevOps",
        "department": "Information Technology (B.Tech IT)",
        "semester": 5,
        "icon": "Cloud",
        "syllabus_overview": "Unit I: Cloud Service Models (IaaS, PaaS, SaaS). Unit II: Virtualization & Hypervisors. Unit III: Containerization with Docker. Unit IV: Kubernetes Orchestration. Unit V: CI/CD Pipelines & Infrastructure as Code.",
        "recommended_topics": [
            {"unit": "Unit I", "title": "Cloud Architecture", "topics": ["Public, Private & Hybrid Clouds", "AWS/Azure Core Architecture", "Serverless Computing (FaaS)"]},
            {"unit": "Unit II", "title": "Virtualization", "topics": ["Type 1 vs Type 2 Hypervisors", "KVM and VMware Architectures", "Cloud Storage (Block, Object, File)"]},
            {"unit": "Unit III", "title": "Docker Containers", "topics": ["Dockerfiles & Image Building", "Container Networking & Volumes", "Docker Compose Multi-Container Apps"]},
            {"unit": "Unit IV", "title": "Kubernetes", "topics": ["Pods, Deployments, Services", "ConfigMaps & Secrets", "Ingress Controllers & Auto-scaling"]},
            {"unit": "Unit V", "title": "CI/CD & IaC", "topics": ["GitHub Actions & Jenkins Pipelines", "Terraform Infrastructure Provisioning", "Prometheus & Grafana Monitoring"]}
        ]
    },

    # ================================================================
    # 4. Business Administration (BBA)
    # ================================================================
    {
        "code": "BBA-101",
        "name": "Principles of Management",
        "department": "Business Administration (BBA)",
        "semester": 1,
        "icon": "Briefcase",
        "syllabus_overview": "Unit I: Management Concepts & Evolution. Unit II: Planning & Strategic Decision Making. Unit III: Organizing & Organizational Structures. Unit IV: Directing, Leadership & Motivation. Unit V: Controlling & Corporate Performance.",
        "recommended_topics": [
            {"unit": "Unit I", "title": "Management Evolution", "topics": ["Taylor's Scientific Management", "Fayol's 14 Principles", "Contemporary Management Challenges"]},
            {"unit": "Unit II", "title": "Planning & Strategy", "topics": ["MBO (Management by Objectives)", "SWOT & PESTLE Frameworks", "Decision-Making Models"]},
            {"unit": "Unit III", "title": "Organizational Design", "topics": ["Line, Staff & Matrix Organizations", "Delegation & Decentralization", "Span of Management"]},
            {"unit": "Unit IV", "title": "Leadership & Teams", "topics": ["Maslow, Herzberg Motivation Theories", "Transformational vs Transactional Leadership", "Group Dynamics & Communication"]},
            {"unit": "Unit V", "title": "Managerial Control", "topics": ["Control Process & Standards", "Budgetary vs Non-Budgetary Controls", "Balanced Scorecard Framework"]}
        ]
    },
    {
        "code": "BBA-201",
        "name": "Marketing Management",
        "department": "Business Administration (BBA)",
        "semester": 2,
        "icon": "TrendingUp",
        "syllabus_overview": "Unit I: Marketing Environment & STP (Segmentation, Targeting, Positioning). Unit II: Product Lifecycle & Branding. Unit III: Pricing Strategies. Unit IV: Distribution & Supply Chain Channels. Unit V: Integrated Marketing Communications & Digital Marketing.",
        "recommended_topics": [
            {"unit": "Unit I", "title": "Market Segmentation", "topics": ["Demographic & Psychographic Segmentation", "Targeting Strategies & Value Proposition", "Brand Positioning Maps"]},
            {"unit": "Unit II", "title": "Product Strategy", "topics": ["Product Life Cycle (PLC) Stages", "New Product Development Pipeline", "Brand Equity & Packaging"]},
            {"unit": "Unit III", "title": "Pricing Tactics", "topics": ["Cost-plus, Value-based, Penetration Pricing", "Price Elasticity of Demand", "Competitive Pricing Models"]},
            {"unit": "Unit IV", "title": "Distribution Channels", "topics": ["Direct vs Indirect Channels", "Retail Management & Omni-channel", "Logistics & Supply Chain Management"]},
            {"unit": "Unit V", "title": "Digital Promotions", "topics": ["Advertising & Public Relations", "Social Media & SEO Marketing", "Customer Lifetime Value (CLV)"]}
        ]
    },
    {
        "code": "BBA-301",
        "name": "Financial Management",
        "department": "Business Administration (BBA)",
        "semester": 3,
        "icon": "DollarSign",
        "syllabus_overview": "Unit I: Financial Goals & Time Value of Money. Unit II: Capital Budgeting Decisions (NPV, IRR). Unit III: Cost of Capital & WACC. Unit IV: Capital Structure & Leverage. Unit V: Working Capital Management.",
        "recommended_topics": [
            {"unit": "Unit I", "title": "Time Value of Money", "topics": ["Present Value & Future Value Annuities", "Risk-Return Tradeoff", "Role of Financial Manager"]},
            {"unit": "Unit II", "title": "Capital Budgeting", "topics": ["Net Present Value (NPV)", "Internal Rate of Return (IRR)", "Payback Period vs Profitability Index"]},
            {"unit": "Unit III", "title": "Cost of Capital", "topics": ["Cost of Debt, Equity, Preference Shares", "Weighted Average Cost of Capital (WACC)", "CAPM Model Basics"]},
            {"unit": "Unit IV", "title": "Capital Structure", "topics": ["Operating & Financial Leverage", "Modigliani-Miller Theorem", "EBIT-EPS Analysis"]},
            {"unit": "Unit V", "title": "Working Capital", "topics": ["Cash, Inventory & Receivables Management", "Operating Cycle Calculation", "Working Capital Financing Strategies"]}
        ]
    }
]

created_count = 0
updated_count = 0

for item in CURRICULUM_DATA:
    obj, created = Subject.objects.update_or_create(
        code=item["code"],
        defaults={
            "name": item["name"],
            "department": item["department"],
            "semester": item["semester"],
            "icon": item.get("icon", "BookOpen"),
            "syllabus_overview": item["syllabus_overview"],
            "recommended_topics": item["recommended_topics"]
        }
    )
    if created:
        created_count += 1
    else:
        updated_count += 1

print(f"Curriculum Seeding Finished! Created: {created_count}, Updated: {updated_count}. Total in DB: {Subject.objects.count()}")
