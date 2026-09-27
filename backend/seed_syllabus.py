import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Subject, Resource, AcademicRecord, Conversation

# Syllabus definition provided by user
SYLLABUS_DATA = [
    # ==================== SEMESTER V ====================
    {
        "code": "NBCA-501",
        "name": "Computer Network",
        "semester": 5,
        "department": "Computer Application (BCA)",
        "icon": "Network",
        "syllabus_overview": (
            "Unit I – Introduction: Goals and applications of networks, Network structure and architecture, OSI reference model, "
            "Network topology, Delay analysis, Local access design, Physical layer transmission media, Switching methods, Wireless and terminal handling.\n"
            "Unit II – Medium Access Sub Layer: Channel allocations, LAN protocols, ALOHA protocols, IEEE standards, Data Link Layer, "
            "Elementary data-link protocols, Sliding window protocols, Error handling.\n"
            "Unit III – Network Layer: Point-to-point networks, Routing, Congestion control, Internet working, TCP/IP, IP packets, IPv4 addressing, IPv6 addressing.\n"
            "Unit IV – Transport Layer: Transport layer design issues, Connection management, Session layer design issues, Presentation layer design issues, "
            "Data compression techniques, Cryptography, TCP window management.\n"
            "Unit V – Application Layer: File transfer, Access and management, Electronic mail, Virtual terminals, Internet and application networks."
        ),
        "recommended_topics": [
            "OSI reference model & Network Topologies",
            "ALOHA & Sliding Window Protocols",
            "Routing Algorithms & IPv4/IPv6 Subnetting",
            "TCP Window Management & Congestion Control",
            "Application Protocols (DNS, SMTP, FTP)"
        ],
        "weak_topics": ["Sliding Window Protocols", "TCP Window Management", "IPv6 Addressing"],
        "resources": [
            {
                "title": "Computer Networks: Complete Unit I-V Lecture Notes & OSI Model Breakdown",
                "resource_type": "notes",
                "description": "In-depth notes on network layers, packet framing, routing algorithms, and sliding window protocols."
            },
            {
                "title": "Computer Networks: 2024 End Semester Question Paper & Model Solutions",
                "resource_type": "paper",
                "description": "Solved previous year exam questions covering ALOHA throughput, Dijkstra routing, and TCP handshake."
            }
        ]
    },
    {
        "code": "NBCA-502",
        "name": "Data Analytics",
        "semester": 5,
        "department": "Computer Application (BCA)",
        "icon": "BarChart3",
        "syllabus_overview": (
            "Unit I – Introduction: Sources and nature of data, Classification of data, Characteristics of data, Data introduction, "
            "Need, types, analysis and applications of data analytics, Data analytics lifecycle, Types of data analytics, Predictive analytics, "
            "Data preparation, Model planning, Model building, Communicating results, Operationalization.\n"
            "Unit II – Data Exploration: Data profiling, Analyzing raw data, Statistics and probability, Basic probability, Conditional probability, "
            "Bayes' theorem, Continuous vs. discrete distributions, Normal distribution, Sample mean and population mean, Variance, Maximum likelihood estimation.\n"
            "Unit III – Data Analysis: Basic analysis techniques, Hypothesis testing, Types of hypothesis, Null and alternate hypothesis, Types of errors, "
            "p-value, Level of significance, Hypothesis testing, Z-test, t-test, Chi-square, ANOVA, Test analysis of variance, Univariate and bivariate analysis.\n"
            "Unit IV – Mining Data and Data Cleaning: Introduction to stream concepts, Stream data model and architecture, Stream computing, "
            "Sampling data in a stream, Stream statistics, Data cleaning, Missing values, Types of missing values, Imputing missing values, Outliers, Deleting and capping, Various functions of data cleaning.\n"
            "Unit V – Data Visualization: Introduction to data visualization, Benefits of good data visualization, Types of data visualization, "
            "Box plots, Histograms, Heat maps, Charts, Word cloud, Tree maps, Word cloud/diagram."
        ),
        "recommended_topics": [
            "Data Analytics Lifecycle & Predictive Analytics",
            "Probability Distributions & Bayes' Theorem",
            "Hypothesis Testing (Z-test, t-test, Chi-square, ANOVA)",
            "Data Cleaning, Missing Value Imputation & Outlier Capping",
            "Data Visualization (Histograms, Heat maps, Box plots)"
        ],
        "weak_topics": ["Hypothesis Testing & p-value", "ANOVA & Chi-Square Tests", "Stream Computing"],
        "resources": [
            {
                "title": "Data Analytics: Hypothesis Testing Workbook & Solved Numerical Examples",
                "resource_type": "notes",
                "description": "Step-by-step calculations for Null/Alternate hypotheses, Z-tests, t-tests, and one-way ANOVA."
            },
            {
                "title": "Data Analytics: Cheatsheet for Missing Value Imputation & Outlier Detection",
                "resource_type": "key",
                "description": "Techniques for mean/median/mode imputation, capping methods, and stream data sampling formulas."
            }
        ]
    },
    {
        "code": "NBCA-503",
        "name": "Artificial Intelligence",
        "semester": 5,
        "department": "Computer Application (BCA)",
        "icon": "Brain",
        "syllabus_overview": (
            "Unit I – Introduction: Introduction to AI, Scope and applications of AI, Natural Language Processing, Computer vision, Speech recognition, "
            "Robotics, Expert systems, Intelligent agents, Structure and working of intelligent agents.\n"
            "Unit II – Intelligent Searching Methods: Searching for solutions, Solving state-space search, Uninformed search strategies, "
            "Informed search strategies, DFS, BFS, Heuristic search, Hill climbing, Best-first search, Branch and bound.\n"
            "Unit III – Knowledge Representation: Predicate logic, Unification, Modus ponens, Resolution, Dependency-directed backtracking, "
            "Rule-based systems, Forward reasoning, Conflict resolution, Backward reasoning, Uses of no-backtracking.\n"
            "Unit IV – Structured Knowledge Representation: Semantic nets, Slots, Exceptions, Default frames, Conceptual dependency, Scripts, "
            "Expert systems, Need and justification for expert systems, Knowledge acquisition, Components of an expert system.\n"
            "Unit V – Handling Uncertainty: Non-monotonic reasoning, Probabilistic reasoning, Certainty factors, Fuzzy logic, Learning, Concept of learning, "
            "Learning automation, Learning by induction, Neural nets."
        ),
        "recommended_topics": [
            "Structure and working of Intelligent Agents",
            "Heuristic Search: A*, Hill Climbing, Best-First Search",
            "Predicate Logic, Unification & Resolution Refutation",
            "Conceptual Dependency, Semantic Nets & Scripts",
            "Fuzzy Logic, Certainty Factors & Neural Nets"
        ],
        "weak_topics": ["Predicate Logic Resolution", "Fuzzy Logic & Certainty Factors", "Branch and Bound Search"],
        "resources": [
            {
                "title": "Artificial Intelligence: State-Space Search & Heuristics Guide",
                "resource_type": "notes",
                "description": "Comprehensive visual breakdown of BFS, DFS, A*, Hill Climbing, and Branch and Bound algorithms."
            },
            {
                "title": "AI: First-Order Predicate Logic Resolution Proofs & Unification Exercises",
                "resource_type": "paper",
                "description": "Solved university questions converting English sentences to FOPL and proving statements via resolution."
            }
        ]
    },
    {
        "code": "NBCA-504",
        "name": "Cyber Law and Internet Security",
        "semester": 5,
        "department": "Computer Application (BCA)",
        "icon": "ShieldCheck",
        "syllabus_overview": (
            "Unit I – Fundamentals of Cyber Law: Jurisprudence of cyber law, Objective and scope of IT Act 2000, Indian cyber law, Uncitral Model Law, "
            "ISP guidelines, Intellectual Property Issues, Cyber crime, IT Act provisions, Cyber offences, Cybercrime investigation in India, Patent, Copyright, Trademark, Semiconductor layout and design, Law related to semiconductor layout and design.\n"
            "Unit II – E-Commerce and Cyber Crime: E-commerce, EDI, Computer crime, Virtual crime, Web crime, E-governance, Electronic payment systems, E-cash, Credit/debit cards, E-agreement, Legal recognition of electronic and digital records, E-commerce security, Privacy, Wireless computing, Security challenges in mobile devices.\n"
            "Unit III – Security Policies: Development of policies, WWW policies, Email security policies, Policy review process, Security policies, Publishing and modification requirements, Evolution of technology security, Mobile, Cloud, Outsourcing, SCM.\n"
            "Unit IV – Internet Security: Role of security in Internet and web services, Classification of threats and attacks, Security challenges, Security implication for organizations, Security services, Authentication, Confidentiality, Integrity, Availability, Information security, Network security, Perimeter security, Firewalls, Hacking, Cracking, Social engineering, Phishing, Trojan horse, Malicious code, Logic bombs.\n"
            "Unit V – Investigation and Ethics: Cyber crime and evidence, Cyber law, Treatment of different countries of cyber-crime, Ethical issues in data and software privacy, Plagiarism, Pornography, Tampering computer documents, Data privacy, Data protection, Domain name system, Software piracy, Ethical issues in ethical hacking."
        ),
        "recommended_topics": [
            "Information Technology Act 2000 & Cyber Offences",
            "Intellectual Property: Patents, Copyrights, Trademarks",
            "E-Commerce Security & Digital Record Recognition",
            "Threats: Phishing, Trojans, Firewalls & Perimeter Security",
            "Cyber Ethics, Digital Evidence & Data Privacy Laws"
        ],
        "weak_topics": ["IT Act 2000 Specific Sections", "Semiconductor Layout Design Law", "Digital Evidence Forensics"],
        "resources": [
            {
                "title": "Cyber Law: Comprehensive Summary of IT Act 2000 Key Sections & Penalties",
                "resource_type": "notes",
                "description": "Essential legal provisions, penalties for hacking/tampering, and cyber appellate tribunal procedures."
            }
        ]
    },
    {
        "code": "NBCA-5051",
        "name": "Graph Theory",
        "semester": 5,
        "department": "Computer Application (BCA)",
        "icon": "GitBranch",
        "syllabus_overview": (
            "Unit I: Graphs and subgraphs, Basic properties, Types of graphs, Walks and paths, Circuits, Connected/disconnected graphs, "
            "Components, Euler graphs, Hamiltonian paths and circuits, Traveling Salesman Problem.\n"
            "Unit II: Trees, Distance and diameter, Radius, Pendant vertices, Rooted and binary trees, Spanning trees, Fundamental circuits, "
            "Finding spanning trees, Weighted graphs, Prim's and Kruskal's algorithms.\n"
            "Unit III: Sets and cut sets, Cut sets and connectivity, Elementary properties, Connected and disconnected graphs, Geometrical dual, "
            "Kuratowski's theorem, Intersection of planar graphs, Euler's formula, Dual, Criteria for planarity, Thickness and crossings.\n"
            "Unit IV: Space of a graph, Vectors, Basic vector, Cut-set vector, Circuit vector, Cut-set and circuit subspaces, Matrix representation of graphs, "
            "Incidence matrix, Circuit matrix, Cut-set matrix, Adjacency matrix.\n"
            "Unit V: Graph coloring, Covering and partitioning of graphs, Chromatic number, Chromatic partitioning, Chromatic polynomials, Matching, Covering, Four-colour problem."
        ),
        "recommended_topics": [
            "Euler Graphs & Hamiltonian Circuits (TSP)",
            "Spanning Trees & Prim's / Kruskal's Algorithms",
            "Cut-sets, Planar Graphs & Kuratowski's Theorem",
            "Matrix Representation (Incidence & Adjacency)",
            "Graph Coloring & Chromatic Polynomials"
        ],
        "weak_topics": ["Kuratowski's Theorem & Planarity", "Circuit and Cut-Set Vector Spaces", "Chromatic Polynomials"],
        "resources": [
            {
                "title": "Graph Theory: Spanning Tree Algorithms & Planar Graph Duals",
                "resource_type": "notes",
                "description": "Step-by-step proofs for Euler's formula, Prim/Kruskal execution, and matrix representations."
            }
        ]
    },
    {
        "code": "NBCA-5052",
        "name": "Software Testing and Audit",
        "semester": 5,
        "department": "Computer Application (BCA)",
        "icon": "CheckSquare",
        "syllabus_overview": (
            "Unit I: Software development life cycle, Testing process, Testing terminology, Testing objectives, Process, criteria, strategies and methods, "
            "Test planning, Test project, Test cases and data, Test execution, Test management, Verification and validation, Difference between verification and validation, "
            "SRS verification, Source-code review, Documentation verification, Software project audit.\n"
            "Unit II: Functional testing, Boundary value analysis, Equivalence class testing, Decision table-based testing, Cause-effect graphing, "
            "Structural testing, Control-flow testing, Data-flow testing, Decision-path testing, Path testing, Generation of graph from program.\n"
            "Unit III: Regression testing, Regression test case selection, Number of test cases, Prioritization techniques, Reducing number of test cases, "
            "Prioritization based on risk, Test case prioritization.\n"
            "Unit IV: Software testing activities, Levels of testing, Debugging, Testing techniques, Exploratory testing, Automated test data generation, "
            "Genetic algorithm, Test data generation tools, Software test plan.\n"
            "Unit V: Object-oriented testing, Definition, Issues, Class testing, Object-oriented integration, System testing, Web applications, "
            "User interface testing, Usability testing, Performance testing, Database testing, API testing."
        ),
        "recommended_topics": [
            "Verification vs. Validation & Test Planning",
            "Boundary Value Analysis & Equivalence Class Partitioning",
            "Control-Flow & Path Testing Graph Generation",
            "Regression Test Case Prioritization & Risk Analysis",
            "API Testing, Usability & Object-Oriented Testing"
        ],
        "weak_topics": ["Decision Table-Based Testing", "Path Testing Graph Derivation", "Risk-Based Test Prioritization"],
        "resources": [
            {
                "title": "Software Testing: Black-Box vs. White-Box Testing Technique Manual",
                "resource_type": "notes",
                "description": "Practical test case templates using Boundary Value Analysis and Equivalence Partitioning."
            }
        ]
    },
    {
        "code": "NBCA-5053",
        "name": "UNIX Operating System",
        "semester": 5,
        "department": "Computer Application (BCA)",
        "icon": "Terminal",
        "syllabus_overview": (
            "Unit I: History of UNIX and Linux, Strengths and weaknesses of UNIX-like operating systems, Basic concepts, Kernel, Shell, Multitasking, "
            "Remote access, File system, Processes, Environment, Command line, Online manual, vi editor, Modes of operation, Switching between them, "
            "Text navigation, Editing, Saving and quitting buffers, Cut-copy-paste, Pattern searching, Replacement.\n"
            "Unit II: UNIX architecture, UNIX file system, Linux and GNU, UNIX architecture features, POSIX, Single UNIX specification, "
            "Internal and external commands, Command structure, Manual browsing, Manual pages online, File system, Parent-child relationship, "
            "Home variable, pwd, cd, mkdir, Absolute and relative pathname, File permissions.\n"
            "Unit III: File attributes, Directory contents, UNIX file system, ls -d, -d option, File ownership, File permissions, chmod, "
            "Directory permissions, Changing file ownership, Processes, Process basics, Foreground/background processes, ps, Process creation, Running jobs in background.\n"
            "Unit IV: Redirection, grep, cut, paste, sort, uniq, filters, Regular expressions, grep and sed, Basic Regular Expressions, "
            "Extended Regular Expressions, egrep, Stream editor, awk, sed and grep.\n"
            "Unit V: Shell, Shell interpretive cycle, Shell offerings, Pattern matching, Escaping and quoting, Redirection, Pipes, tee, "
            "Shell variables, Essential shell programming."
        ),
        "recommended_topics": [
            "UNIX Architecture, Kernel & Shell concepts",
            "File System Hierarchy, Pathnames & Permissions (chmod)",
            "Process Management: ps, backgrounding jobs, signals",
            "Filters & Regular Expressions: grep, sed, awk",
            "Shell Programming: pipes, redirection, variables, scripts"
        ],
        "weak_topics": ["awk Programming & sed Stream Editing", "Extended Regular Expressions", "Process Signals"],
        "resources": [
            {
                "title": "UNIX: Shell Scripting & Command Line Cheatsheet",
                "resource_type": "notes",
                "description": "Essential shell commands, vi editor keybindings, sed/awk syntax, and permissions matrix."
            }
        ]
    },
    {
        "code": "NBCA-5054",
        "name": "Data Mining and Data Warehousing",
        "semester": 5,
        "department": "Computer Application (BCA)",
        "icon": "Database",
        "syllabus_overview": (
            "Unit I: Overview and definition, Functionalities, Data processing, Forms of preprocessing, Data cleaning, Missing values, "
            "Data binning, Clustering, Regression, Computer and human interaction, Inconsistent data, Data integration and transformation, "
            "Data reduction, Data cube aggregation, Dimensionality reduction, Data compression, Numerosity reduction, Clustering and discretization.\n"
            "Unit II: Concept description, Definition, Data generalization, Analytical characterization, Analysis of attribute relevance, "
            "Mining class comparisons, Statistical measures, Basic database terminology, Data warehousing, Data mining, Single-dimensional Boolean association rules, Transactional databases.\n"
            "Unit III: Classification and prediction, Decision trees, Bayes classification, Classification by back propagation, "
            "Multilayer feed-forward neural network, Back propagation algorithm, K-nearest neighbor classification, Methods of K-nearest neighbor classification.\n"
            "Unit IV: Cluster analysis, Types of cluster analysis, Clustering methods, Partitioning methods, Hierarchical clustering, CURE, "
            "CURE and CHAMELEON, Density-based methods, OPTICS, DBSCAN, CLIQUE, Model-based methods.\n"
            "Unit V: Data warehousing overview, Definition, Delivery process, Difference between database system and data warehouse, "
            "Multidimensional data, Data cubes, Stars, Snowflakes, Fact constellations, Concept hierarchy, Process architecture, 3-tier architecture, Data marting."
        ),
        "recommended_topics": [
            "Data Preprocessing, Cleaning & Reduction Techniques",
            "Association Rule Mining & Apriori Algorithm",
            "Decision Trees, Naive Bayes & Neural Network Backpropagation",
            "Clustering Algorithms (K-Means, DBSCAN, CURE)",
            "Data Warehouse Schemas (Star, Snowflake, Fact Constellation)"
        ],
        "weak_topics": ["Backpropagation Algorithm", "DBSCAN & CURE Clustering", "Fact Constellation Schemas"],
        "resources": [
            {
                "title": "Data Mining & Warehousing: Star vs Snowflake Schemas & Clustering Guide",
                "resource_type": "notes",
                "description": "Detailed architectural comparisons of OLAP cubes, dimension tables, and clustering algorithms."
            }
        ]
    },
    {
        "code": "NBCA-506P",
        "name": "Data Analytics Lab",
        "semester": 5,
        "department": "Computer Application (BCA)",
        "icon": "Cpu",
        "syllabus_overview": (
            "Practical Syllabus:\n"
            "- NumPy arrays and manipulation: Creating 5×2 NumPy arrays with random numbers\n"
            "- Calculating mean, median, standard deviation and variance using NumPy\n"
            "- Generating random arrays and finding mean and standard deviation\n"
            "- Reading data and performing normalization\n"
            "- Creating DataFrames using Pandas, Sorting DataFrames based on the first column\n"
            "- Detecting and removing outliers, Checking missing values using isnull() and not null\n"
            "- Identifying/counting missing values, Removing duplicates\n"
            "- Reading CSV files and selecting specific columns/rows\n"
            "- NumPy chi-square test and ANOVA test\n"
            "- Data visualization using Matplotlib: Box plots, Histograms, Heat maps, Various charts"
        ),
        "recommended_topics": [
            "NumPy Array Operations & Statistical Functions",
            "Pandas DataFrame Manipulation & Filtering",
            "Missing Value Imputation & Outlier Removal in Python",
            "NumPy Chi-Square & ANOVA Implementation",
            "Matplotlib & Seaborn Visualizations (Box Plots, Heat Maps)"
        ],
        "weak_topics": ["Chi-Square & ANOVA Implementation in NumPy", "DataFrame Multi-Column Imputation"],
        "resources": [
            {
                "title": "Data Analytics Lab Manual: Python NumPy & Pandas Code Snippets",
                "resource_type": "notes",
                "description": "Complete executable Python code for all 15 syllabus practical experiments."
            }
        ]
    },

    # ==================== SEMESTER VI ====================
    {
        "code": "NBCA-601",
        "name": "Machine Learning",
        "semester": 6,
        "department": "Computer Application (BCA)",
        "icon": "Cpu",
        "syllabus_overview": (
            "Unit I – Introduction: Artificial Intelligence, Machine Learning, Types of Machine Learning, Machine Learning algorithms, "
            "Statistical Learning, Introduction to supervised and unsupervised learning, Training and testing, Traditional vs. Statistical Learning, "
            "Estimating Risk Statistics, Sampling distribution of an estimator.\n"
            "Unit II – Supervised Learning: Basic methods, Distance-based methods, Nearest Neighbours, Decision Trees, Naive Bayes, Linear Models, "
            "Linear Regression, Logistic Regression, Generalized Linear Models, Support Vector Machines, Binary Classification.\n"
            "Unit III – Ensemble Learning: Introduction, Voting Classifiers, Bagging and Pasting, Random Forests, Boosting, Support Vector Machine, "
            "Linear SVM Classification, Nonlinear SVM Classification, Naive Bayes Classifiers.\n"
            "Unit IV – Unsupervised Learning: Clustering, K-Means, Limit of K-Means, Clustering for Image Segmentation, Clustering for Preprocessing, "
            "Clustering for Semi-Supervised Learning, DBSCAN, Gaussian Mixtures, Dimensionality Reduction, Curse of Dimensionality, PCA, Randomized PCA.\n"
            "Unit V – Neural Networks: Introduction to Artificial Neural Networks, Keras, Implementing MLPs with Keras, TensorFlow, "
            "Loading and preprocessing data with TensorFlow."
        ),
        "recommended_topics": [
            "Supervised vs. Unsupervised vs. Reinforcement Learning",
            "Linear & Logistic Regression, SVM Classification",
            "Ensemble Learning: Bagging, Boosting, Random Forests",
            "K-Means, DBSCAN & PCA Dimensionality Reduction",
            "Artificial Neural Networks & Keras MLP Implementation"
        ],
        "weak_topics": ["SVM Kernel Trick & Nonlinear Classification", "DBSCAN vs Gaussian Mixtures", "PCA Mathematical Derivation"],
        "resources": [
            {
                "title": "Machine Learning: Complete Theory & Mathematical Foundations",
                "resource_type": "notes",
                "description": "Detailed derivations for gradient descent, cost functions, SVM margins, and PCA projection."
            }
        ]
    },
    {
        "code": "NBCA-602",
        "name": "Multimedia System",
        "semester": 6,
        "department": "Computer Application (BCA)",
        "icon": "Film",
        "syllabus_overview": (
            "Unit I – Introduction: Multimedia, Multimedia information, Multimedia objects, Multimedia in business and work, "
            "Convergence of computer, communication and entertainment products, Stages of multimedia projects, Multimedia hardware, "
            "Memory and storage devices, Communication devices, Multimedia software, Presentation tools, Authoring environments, "
            "Video, sound, image capturing, Authoring tools, Card and page-based authoring tools.\n"
            "Unit II – Multimedia Building Blocks: Text, Sound, MIDI, Digital audio, Audio file formats, MIDI under Windows environment, Audio and video capture.\n"
            "Unit III – Data Compression: Human coding, Shannon-Fano algorithm, Huffman algorithms, Adaptive coding, Arithmetic coding, "
            "Higher-order modelling, Finite context modelling, Dictionary-based coding, Sliding-window compression, LZ77, LZV compression, "
            "LZ78 compression, Compression ratio, Lossless & lossy compression.\n"
            "Unit IV – Speech Compression & Synthesis: Digital audio concepts, Sampling variables, Lossless compression, Lossy compression, Speech compression.\n"
            "Unit V – Images: Multiple monitors, Bitmaps, Vector drawing, Lossy graphic compression, Image file format, Animations, "
            "Image standards, JPEG compression, Zig-Zag coding, Multimedia database, Content-based retrieval, Text and image, Video, "
            "Stereo representation, Colours, Video compression, MPEG standards, Streaming video on net."
        ),
        "recommended_topics": [
            "Multimedia Authoring Tools & Building Blocks (MIDI, Audio)",
            "Data Compression: Shannon-Fano, Huffman & Arithmetic Coding",
            "Dictionary-Based Coding (LZ77, LZ78, LZW)",
            "Speech Compression & Digital Audio Sampling",
            "JPEG Compression Pipeline & MPEG Video Standards"
        ],
        "weak_topics": ["Arithmetic Coding Derivation", "LZ77/LZ78 Compression Tables", "JPEG Zig-Zag & DCT Transformations"],
        "resources": [
            {
                "title": "Multimedia Systems: Data Compression Algorithms Solved Workbook",
                "resource_type": "notes",
                "description": "Step-by-step Huffman tree creation, Shannon-Fano code generation, and LZW encoding exercises."
            }
        ]
    },
    {
        "code": "NBCA-603",
        "name": "Software Project Management",
        "semester": 6,
        "department": "Computer Application (BCA)",
        "icon": "Briefcase",
        "syllabus_overview": (
            "Unit I – Introduction: Fundamentals of software project management, Need identification, Vision and scope document, "
            "Project management cycle, SPM objectives, Software and software project planning, Planning objectives, Project plan, "
            "Types of project plan, Structure of software project management plan, Software project estimation, Estimation methods, Estimation models, Decision process.\n"
            "Unit II – Project Organization and Scheduling: Project elements, Work breakdown structure, Types of WBS, Project functions and activities, "
            "Project life cycle, Product life cycle, Ways to organize personnel, Project schedule, Scheduling objectives, Building project schedule, "
            "Scheduling terminology and techniques, Network diagrams, PERT, CPM, Bar charts, Milestone charts, Gantt charts.\n"
            "Unit III – Project Monitoring and Control: Dimensions of project monitoring and control, Earned value analysis, Earned value indicators, "
            "Budgeted cost for work scheduled, Actual cost, Performance indexes, Schedule performance index, Cost performance index, "
            "Software reviews, Types of reviews, Inspection, Walkthrough, Auditing.\n"
            "Unit IV – Software Quality Assurance and Testing: Testing objectives, Testing principles, Test plans, Test cases, Testing strategies, "
            "Test execution, Regression, Regression verification, Validation, Testing automation, Testing tools, Software quality, Software quality attributes, "
            "Software quality practices, SEI capability maturity model, SQA, SQE, Formal SQA approaches.\n"
            "Unit V – Project Management: Software configuration management, Software configuration items and tasks, Baselines, Plan for change, "
            "Change control, Change requests, Management version control, Risk management, Risk types, Breakdown structure, Risk management process, "
            "Risk identification, Risk analysis, Risk monitoring, Risk control, Risk management tools."
        ),
        "recommended_topics": [
            "Project Planning, Vision & Scope and Cost Estimation",
            "Work Breakdown Structure (WBS) & Scheduling (PERT/CPM)",
            "Earned Value Analysis (EVA, SPI, CPI)",
            "Software Quality Assurance & SEI CMM Levels",
            "Configuration Management (SCM) & Risk Management Matrix"
        ],
        "weak_topics": ["Earned Value Analysis Calculations", "PERT/CPM Critical Path Calculations", "SEI CMM Maturity Levels"],
        "resources": [
            {
                "title": "SPM: PERT/CPM Network Diagrams & Earned Value Analysis Manual",
                "resource_type": "notes",
                "description": "Calculations for Early Start, Late Finish, Float, Critical Path, and cost performance index."
            }
        ]
    },
    {
        "code": "NBCA-6041",
        "name": "Open Source Software",
        "semester": 6,
        "department": "Computer Application (BCA)",
        "icon": "Code",
        "syllabus_overview": (
            "Unit I – Introduction: Open source, Need for open source, Advantages of open source, Applications of open source.\n"
            "Unit II – Open Source Operating Systems: Linux, General overview, Process, Advanced concepts, Scheduling, Protection, Process management, Linux OS.\n"
            "Unit III – Open Source Database: MySQL, Setting up account, Starting and terminating, Writing SQL programs, Record selection, Working with strings, Date/time, Sorting/querying.\n"
            "Unit IV – Open Source Programming Languages: PHP, Programming in web environment, Variables, Constants, Datatypes, Operators, Statements, Functions, Arrays, OOP, Regular expressions.\n"
            "Unit V – Perl: Introduction, Background, Perl overview, Perl parsing rules, Variables and data statements, Control structures, Subroutines, Packages, Modules, Working with files, Data manipulation."
        ),
        "recommended_topics": [
            "Open Source Philosophy, Licensing & Ecosystem",
            "Linux Process Scheduling & OS Management",
            "MySQL Database Administration & Complex Queries",
            "PHP Web Programming, Arrays & OOP in PHP",
            "Perl Scripting, Regular Expressions & File Handling"
        ],
        "weak_topics": ["Perl Packages and Modules", "Linux Process Protection Mechanisms"],
        "resources": [
            {
                "title": "Open Source Software: Linux, PHP & MySQL Reference Handbook",
                "resource_type": "notes",
                "description": "Syntax reference and real-world scripting examples for PHP, Perl, and MySQL."
            }
        ]
    },
    {
        "code": "NBCA-6042",
        "name": "Mobile Computing",
        "semester": 6,
        "department": "Computer Application (BCA)",
        "icon": "Smartphone",
        "syllabus_overview": (
            "Unit I – Introduction: Issues in mobile computing, Characteristics of mobile computing, Structure of mobile computing, "
            "Overview of wireless telephony, Cellular concept.\n"
            "Unit II – Evaluation of Mobile System and Wireless Network: GSM, CDMA, FDMA, TDMA, Wireless LAN, Wireless LAN overview, "
            "Bluetooth, Bluetooth profiles, Wireless applications, Broadcasting, Mobile IP, WAP.\n"
            "Unit III – Data Management Issues: Management issues, Hoarding techniques, Data replication for mobile computers, "
            "Adaptive clustering for mobile wireless networks, File system.\n"
            "Unit IV – Mobile Agents: Introduction, Type, Need, Mobile agent, Features of mobile agents, Life cycle, Security and fault tolerance, "
            "Transaction processing in mobile computing environment.\n"
            "Unit V – Mobile Ad Hoc Networks (MANETs): Introduction, Features, Ad hoc networks, Routing protocols, Global State Routing (GSR), "
            "Destination Sequenced Distance Vector Routing (DSDV), Dynamic Source Routing (DSR), Ad Hoc On-Demand Distance Vector (AODV)."
        ),
        "recommended_topics": [
            "Cellular Architecture, Frequency Reuse & Handover",
            "GSM, CDMA, TDMA & Mobile IP Architecture",
            "Data Hoarding & Mobile File Systems",
            "Mobile Agents Architecture & Transaction Processing",
            "MANET Routing Protocols: DSDV, DSR, AODV"
        ],
        "weak_topics": ["AODV vs DSR Routing Comparison", "Mobile Transaction Models", "Data Hoarding Algorithms"],
        "resources": [
            {
                "title": "Mobile Computing: Cellular Systems & MANET Routing Guide",
                "resource_type": "notes",
                "description": "Visual diagrams for GSM architecture, Mobile IP triangle routing, and AODV route discovery."
            }
        ]
    },
    {
        "code": "NBCA-6043",
        "name": "Cryptography",
        "semester": 6,
        "department": "Computer Application (BCA)",
        "icon": "Lock",
        "syllabus_overview": (
            "Unit I – Introduction: Security attacks, Cryptography, Conventional encryption, Model of conventional cryptography, "
            "Substitution techniques, Transposition techniques, Product ciphers, Cryptanalysis, Steganography, Stream ciphers, Block ciphers.\n"
            "Unit II – Modern Block Ciphers: Block cipher principles, Shannon's theory of confusion and diffusion, Feistel structure, "
            "DES, Strength of DES, Differential and linear cryptanalysis of DES, Block cipher modes, Triple DES, IDEA, Blowfish, CAST, RC5, "
            "Conventional encryption security, Confidentiality, Key distribution.\n"
            "Unit III – Finite Fields: Introduction to Galois fields, Rings, Prime and relative prime numbers, Modular arithmetic, "
            "Fermat's and Euler's theorem, Primality testing, Euclid's algorithm, Chinese remainder theorem, Discrete logarithms, "
            "Public key cryptosystems, RSA algorithm, Security of RSA, Key management, Diffie-Hellman key exchange algorithm.\n"
            "Unit IV – Message Authentication and Hash Function: Authentication requirements, Authentication functions, Message authentication code, "
            "Hash functions, Birthday attacks, Security of hash functions, MACs, MD5, SHA, HMAC.\n"
            "Unit V – Digital Signatures: Digital signatures, Authentication protocols, Digital signature standards (DSS), "
            "Proof of digital signature algorithm, Authentication application, Kerberos, Directory authentication service, "
            "Digital signature service, Message security, PGP, S/MIME."
        ),
        "recommended_topics": [
            "Classical Ciphers (Substitution, Transposition, Steganography)",
            "DES & AES Feistel Structure, Confusion & Diffusion",
            "Galois Fields, Modular Arithmetic & RSA Algorithm",
            "Diffie-Hellman Key Exchange & Discrete Logarithms",
            "Hash Functions (MD5, SHA), HMAC & Digital Signatures (DSS, Kerberos)"
        ],
        "weak_topics": ["Galois Field GF(2^n) Arithmetic", "Differential Cryptanalysis", "Chinese Remainder Theorem in RSA"],
        "resources": [
            {
                "title": "Cryptography: Mathematical Algorithms & Solved Exercises",
                "resource_type": "notes",
                "description": "Step-by-step mathematical examples for RSA key generation, Diffie-Hellman exchange, and Euclid algorithm."
            }
        ]
    },
    {
        "code": "NBCA-6044",
        "name": "Cyber Forensic Analytics",
        "semester": 6,
        "department": "Computer Application (BCA)",
        "icon": "FileSearch",
        "syllabus_overview": (
            "Unit I – Cyber Crime: Cyber space, Cyber crime, Criminal behaviour, Jurisdictional concerns, Jurisprudential inconsistency, "
            "Cash security, Prepaid cards, Stored value cards, Mobile payments, Internet fraud, Cyber stalking, Cyber extortion, Cyber terrorism, Cyber warfare, ATM frauds.\n"
            "Unit II – Cyber Forensics: Digital device, Hard disk, Disk characteristics, Disk imaging, Data carving, Techniques, "
            "Forensic piracy, Soft lifting, Steganography, Network components, Port scans, Wireshark, PCAP analysis, Trojans, Passwords, Botnets, DoS/DDoS attacks, Honey Pots, Malware, Viruses, Worms.\n"
            "Unit III – Cyber Investigation: Concepts of investigation, Cyber investigation, Network investigation, Investigating audit logs, "
            "Investigating web attacks, Investigating computer intrusions, Profiling, Cyber criminal profiling, Stylometric techniques, Warranted search, Warrantless searches, Undercover techniques.\n"
            "Unit IV – Evidence Management: Evidence, Digital evidence, Types of physical evidence, Real evidence, Circumstantial evidence, Network evidence, "
            "Evidence collection, Evidence analysis, Evidence preservation, Evidence management, Evidence presentation, Research activities, On scene activities, Report preparation.\n"
            "Unit V – Cyber Laws and Authorities: Information Technology Act 2000, Digital signature, Electronic governance, Secure electronic records, "
            "Regulation of certifying authorities, CERT-In, Electronic signatures, Penalties, Compensation."
        ),
        "recommended_topics": [
            "Cyber Crime Classification & Jurisdictional Challenges",
            "Disk Imaging, Data Carving & Wireshark PCAP Analysis",
            "Network Intrusion Investigation & Log Analysis",
            "Chain of Custody, Digital Evidence Collection & Preservation",
            "CERT-In Guidelines & IT Act 2000 Evidence Admissibility"
        ],
        "weak_topics": ["Data Carving from Raw Disk Images", "Stylometric Profiling Techniques", "Chain of Custody Legal Rules"],
        "resources": [
            {
                "title": "Cyber Forensics: Practical Investigation & Evidence Handling Guide",
                "resource_type": "notes",
                "description": "Protocols for digital evidence seizure, disk hashing (MD5/SHA256), and Wireshark traffic inspection."
            }
        ]
    },
    {
        "code": "NBCA-605P",
        "name": "Machine Learning Lab",
        "semester": 6,
        "department": "Computer Application (BCA)",
        "icon": "Cpu",
        "syllabus_overview": (
            "Practical Syllabus:\n"
            "- FIND-S algorithm and Candidate-Elimination algorithm\n"
            "- Decision tree using ID3 algorithm\n"
            "- Linear Regression and Logistic Regression binary classifier\n"
            "- Bias, Variance, Removal, Cross Validation\n"
            "- Categorical Encoding, One-Hot Encoding\n"
            "- Artificial Neural Network with Backpropagation\n"
            "- K-Nearest Neighbor classification\n"
            "- Non-parametric Locally Weighted Regression\n"
            "- Naive Bayes classifier\n"
            "- Expectation-Maximization (EM) algorithm\n"
            "- K-Means clustering algorithm\n"
            "- Exploratory Data Analysis using Pandas and Matplotlib\n"
            "- Bayesian network construction\n"
            "- Support Vector Machines (SVM)\n"
            "- Principal Component Analysis (PCA)"
        ),
        "recommended_topics": [
            "FIND-S & Candidate Elimination Implementation in Python",
            "ID3 Decision Tree Construction from Scratch",
            "ANN Backpropagation Algorithm in Python",
            "K-Means vs EM Algorithm for Gaussian Mixtures",
            "SVM & PCA Dimension Reduction on Datasets"
        ],
        "weak_topics": ["Candidate-Elimination Algorithm Version Space", "Backpropagation Weight Updates", "Locally Weighted Regression"],
        "resources": [
            {
                "title": "Machine Learning Lab Manual: Complete Python Implementations",
                "resource_type": "notes",
                "description": "Ready-to-run Python code for all 15 experiments from FIND-S to PCA."
            }
        ]
    }
]

print("Starting Syllabus and Resources Migration...")

created_count = 0
updated_count = 0

for item in SYLLABUS_DATA:
    code = item["code"]
    resources_data = item.pop("resources", [])
    
    subject, created = Subject.objects.update_or_create(
        code=code,
        defaults=item
    )
    if created:
        created_count += 1
    else:
        updated_count += 1

    # Populate resources for this subject
    for res_info in resources_data:
        Resource.objects.get_or_create(
            subject=subject,
            title=res_info["title"],
            defaults={
                "resource_type": res_info["resource_type"],
                "description": res_info["description"],
                "semester": subject.semester
            }
        )

print(f"Migration completed successfully: {created_count} created, {updated_count} updated.")
print(f"Total Subjects in DB: {Subject.objects.count()}")
print(f"Total Resources in DB: {Resource.objects.count()}")
