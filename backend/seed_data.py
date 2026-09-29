import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import (
    User, Subject, AcademicRecord, Resource,
    Conversation, Message, StudyGoal, Quiz,
    QuizAttempt, Notification, Roadmap
)

def run_seed():
    print("🌱 Starting database seeding...")

    # 1. Create Default Subjects
    subjects_data = [
        {
            "code": "BCA-501",
            "name": "Data Structures & Algorithms",
            "department": "Computer Application (BCA)",
            "semester": 5,
            "weak_topics": ["Dynamic Programming", "AVL Tree Rotations", "Graph Traversals"],
            "recommended_topics": ["Binary Search Trees", "Dijkstra's Algorithm", "Time Complexity Analysis"],
            "syllabus_overview": "Covers linear and non-linear data structures, trees, graphs, sorting, searching, and algorithmic analysis.",
            "icon": "Code2"
        },
        {
            "code": "BCA-502",
            "name": "Operating Systems",
            "department": "Computer Application (BCA)",
            "semester": 5,
            "weak_topics": ["Semaphores & Deadlock Prevention", "Virtual Memory Page Replacement"],
            "recommended_topics": ["Process Scheduling Algorithms", "Banker's Algorithm", "Paging and Segmentation"],
            "syllabus_overview": "Detailed study of concurrency, CPU scheduling, deadlocks, memory management, and file systems.",
            "icon": "Cpu"
        },
        {
            "code": "BCA-503",
            "name": "Database Management Systems",
            "department": "Computer Application (BCA)",
            "semester": 5,
            "weak_topics": ["BCNF vs 3NF Decomposition", "ACID Isolation Levels"],
            "recommended_topics": ["SQL Joins and Subqueries", "ER to Relational Mapping", "Indexing with B+ Trees"],
            "syllabus_overview": "Relational algebra, SQL, normalization theory, transaction processing, and recovery techniques.",
            "icon": "Database"
        },
        {
            "code": "BCA-504",
            "name": "Computer Networks",
            "department": "Computer Application (BCA)",
            "semester": 5,
            "weak_topics": ["Subnetting & CIDR", "TCP Congestion Control (Tahoe/Reno)"],
            "recommended_topics": ["OSI vs TCP/IP Models", "Distance Vector Routing", "DNS and HTTP Protocol Flow"],
            "syllabus_overview": "Network layers, physical transmission, IP addressing, routing algorithms, transport layer protocols.",
            "icon": "Globe"
        },
        {
            "code": "BCA-505",
            "name": "Web Technologies & React",
            "department": "Computer Application (BCA)",
            "semester": 5,
            "weak_topics": ["React Hooks Lifecycle", "JWT Authentication Flow"],
            "recommended_topics": ["RESTful API Architecture", "State Management", "Tailwind Responsive Design"],
            "syllabus_overview": "Modern frontend development with React, ES6, CSS frameworks, state management, and backend REST APIs.",
            "icon": "Layout"
        },
        {
            "code": "BCA-506",
            "name": "Discrete Mathematics",
            "department": "Computer Application (BCA)",
            "semester": 5,
            "weak_topics": ["Recurrence Relations", "Graph Coloring & Euler Paths"],
            "recommended_topics": ["Set Theory & Relations", "Propositional Logic", "Combinatorics and Permutations"],
            "syllabus_overview": "Mathematical foundations for computer science including set theory, logic, combinatorics, and graph theory.",
            "icon": "Sigma"
        }
    ]

    subjects_dict = {}
    for data in subjects_data:
        subj, created = Subject.objects.get_or_create(code=data["code"], defaults=data)
        subjects_dict[data["code"]] = subj
    print(f"✅ Loaded {len(subjects_dict)} academic subjects.")

    # 2. Create Student User (student@gmail.com / 123456)
    student, s_created = User.objects.get_or_create(
        email="student@gmail.com",
        defaults={
            "name": "Student Scholar",
            "phone": "+91 98765 43210",
            "role": "student",
            "department": "Computer Application (BCA)",
            "semester": 5,
            "section": "A",
            "roll_number": "2412044050108",
            "streak_count": 8,
            "longest_streak": 14,
            "bio": "BCA Final Year Student. Solving doubts with AI."
        }
    )
    student.name = "Student Scholar"
    student.roll_number = "2412044050108"
    student.bio = "BCA Final Year Student. Solving doubts with AI."
    student.set_password("123456")
    student.save()
    print("✅ Student user initialized: student@gmail.com (Password: 123456)")

    # 3. Create Administrator User (admin@gmail.com / 123456)
    admin_user, a_created = User.objects.get_or_create(
        email="admin@gmail.com",
        defaults={
            "name": "System Administrator",
            "phone": "+91 98765 00000",
            "role": "admin",
            "department": "Department Administration",
            "semester": 0,
            "section": "ADM",
            "roll_number": "ADMIN/001",
            "is_staff": True,
            "is_superuser": True,
            "bio": "Academic Administrator managing courses, students, and local Ollama deployments."
        }
    )
    admin_user.name = "System Administrator"
    admin_user.roll_number = "ADMIN/001"
    admin_user.set_password("123456")
    admin_user.is_staff = True
    admin_user.save()
    print("✅ Admin user initialized: admin@gmail.com (Password: 123456)")

    # 4. Create Faculty User (faculty@gmail.com / 123456)
    faculty_user, f_created = User.objects.get_or_create(
        email="faculty@gmail.com",
        defaults={
            "name": "Faculty Mentor",
            "phone": "+91 98765 00019",
            "role": "faculty",
            "department": "Computer Application (BCA)",
            "semester": 5,
            "section": "A",
            "roll_number": "FAC/019",
            "bio": "Course Faculty & Academic Mentor. Managing curriculum, learning resources, and assessment analytics."
        }
    )
    faculty_user.name = "Faculty Mentor"
    faculty_user.roll_number = "FAC/019"
    faculty_user.bio = "Course Faculty & Academic Mentor. Managing curriculum, learning resources, and assessment analytics."
    faculty_user.set_password("123456")
    faculty_user.save()
    print("✅ Faculty user initialized: faculty@gmail.com (Password: 123456)")

    mentor = faculty_user

    # 4. Create Academic Records for Student
    AcademicRecord.objects.filter(user=student).delete()
    academic_entries = [
        {"code": "BCA-501", "marks": 88, "max": 100, "grade": "A+", "type": "Internal Assessment 1"},
        {"code": "BCA-502", "marks": 76, "max": 100, "grade": "B+", "type": "Internal Assessment 1"},
        {"code": "BCA-503", "marks": 92, "max": 100, "grade": "A+", "type": "Midterm Examination"},
        {"code": "BCA-504", "marks": 68, "max": 100, "grade": "B",  "type": "Internal Assessment 1"},
        {"code": "BCA-505", "marks": 95, "max": 100, "grade": "O",  "type": "Practical Lab Assessment"},
        {"code": "BCA-506", "marks": 72, "max": 100, "grade": "B+", "type": "Midterm Examination"}
    ]
    for ent in academic_entries:
        AcademicRecord.objects.create(
            user=student,
            subject=subjects_dict[ent["code"]],
            semester=5,
            exam_type=ent["type"],
            marks_obtained=ent["marks"],
            max_marks=ent["max"],
            grade=ent["grade"]
        )
    print("✅ Academic records populated.")

    # 5. Create Educational Resources & PYQs
    Resource.objects.all().delete()
    resources_data = [
        {
            "title": "Data Structures: AVL Tree Balancing & B-Tree Algorithms (Unit Notes)",
            "code": "BCA-501",
            "resource_type": "notes",
            "description": "Comprehensive notes with step-by-step tree rotation diagrams and Big-O derivations for balanced search trees.",
            "file_url": "https://academic.repo/resources/bca501-unit3-avl-trees.pdf"
        },
        {
            "title": "Operating Systems: 2024 End Semester Solved Question Paper",
            "code": "BCA-502",
            "resource_type": "paper",
            "description": "Previous year exam paper with complete model solutions for Banker's Algorithm, semaphore synchronizations, and page replacement.",
            "file_url": "https://academic.repo/resources/bca502-pyq-2024-solved.pdf"
        },
        {
            "title": "DBMS: 3NF vs BCNF Normalization Cheatsheet & Answer Key",
            "code": "BCA-503",
            "resource_type": "key",
            "description": "Quick reference guide demonstrating functional dependency closures and lossless join decomposition with solved examples.",
            "file_url": "https://academic.repo/resources/bca503-normalization-cheatsheet.pdf"
        },
        {
            "title": "Computer Networks: Subnet Masking & CIDR Calculation Workbook",
            "code": "BCA-504",
            "resource_type": "reference",
            "description": "Practical calculation exercises for IPv4 Classless Inter-Domain Routing, broadcast addresses, and routing tables.",
            "file_url": "https://academic.repo/resources/bca504-cidr-workbook.pdf"
        },
        {
            "title": "Web Technologies: Modern React 19 & JWT Auth Reference Architecture",
            "code": "BCA-505",
            "resource_type": "notes",
            "description": "Full guide detailing secure token storage, Axios interceptors, Argon2 hashing, and Tailwind CSS design patterns.",
            "file_url": "https://academic.repo/resources/bca505-react-jwt-guide.pdf"
        }
    ]
    for res in resources_data:
        Resource.objects.create(
            title=res["title"],
            subject=subjects_dict[res["code"]],
            resource_type=res["resource_type"],
            semester=5,
            description=res["description"],
            file_url=res["file_url"],
            download_count=42,
            uploaded_by=mentor
        )
    print("✅ Resource library items added.")

    # 6. Create Interactive Quizzes
    Quiz.objects.all().delete()
    quizzes_data = [
        {
            "title": "Data Structures: Trees, Graphs & Dynamic Programming",
            "code": "BCA-501",
            "difficulty": "Medium",
            "topic": "Trees & Graphs",
            "questions": [
                {
                    "question": "What is the worst-case time complexity of searching an element in an AVL Tree with N nodes?",
                    "options": ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
                    "correct_index": 1,
                    "explanation": "Because an AVL tree is strictly height-balanced (balance factor within -1, 0, +1), the maximum height is bounded by 1.44 log2(N). Hence, search is strictly O(log N)."
                },
                {
                    "question": "Which traversal of a Binary Search Tree (BST) yields values in sorted ascending order?",
                    "options": ["Pre-order Traversal", "Post-order Traversal", "In-order Traversal", "Level-order Traversal"],
                    "correct_index": 2,
                    "explanation": "In-order traversal visits Left subtree -> Current Node -> Right subtree. Since in a BST Left < Root < Right, this order naturally outputs values in sorted ascending sequence."
                },
                {
                    "question": "Which data structure is fundamentally utilized to implement Breadth-First Search (BFS) in a graph?",
                    "options": ["Stack", "Queue", "Priority Queue", "Disjoint Set"],
                    "correct_index": 1,
                    "explanation": "BFS explores vertices level by level, following First-In First-Out (FIFO) semantics provided by a Queue data structure."
                }
            ]
        },
        {
            "title": "Operating Systems: Concurrency & Deadlocks",
            "code": "BCA-502",
            "difficulty": "Hard",
            "topic": "Deadlocks & Semaphores",
            "questions": [
                {
                    "question": "Which of the following is NOT one of the Coffman conditions required for a deadlock to occur?",
                    "options": ["Mutual Exclusion", "Hold and Wait", "Preemption Allowed", "Circular Wait"],
                    "correct_index": 2,
                    "explanation": "The correct condition is 'No Preemption'. If preemption is allowed, resources can be forcibly reclaimed, breaking the deadlock state."
                },
                {
                    "question": "What does a negative value of a counting semaphore S indicate in standard Dijkstra implementation?",
                    "options": ["Error state", "The absolute value equals the number of blocked processes waiting on the semaphore", "System crash", "Excess resource units available"],
                    "correct_index": 1,
                    "explanation": "When semaphore wait() decrements S below zero, the magnitude |S| represents the number of processes currently suspended in the semaphore queue."
                }
            ]
        },
        {
            "title": "DBMS: Normalization & Relational Theory",
            "code": "BCA-503",
            "difficulty": "Easy",
            "topic": "Normalization",
            "questions": [
                {
                    "question": "A relation is in First Normal Form (1NF) if and only if:",
                    "options": ["All attributes contain atomic (indivisible) values and no repeating groups exist", "There are no transitive dependencies", "Every non-prime attribute is fully functionally dependent on the primary key", "All determinant attributes are candidate keys"],
                    "correct_index": 0,
                    "explanation": "1NF requires atomicity of column values and disallows nested tables or multivalued attributes in any tuple."
                },
                {
                    "question": "Which normal form strictly eliminates all transitive functional dependencies?",
                    "options": ["1NF", "2NF", "3NF", "BCNF"],
                    "correct_index": 2,
                    "explanation": "Third Normal Form (3NF) requires 2NF plus the condition that no non-prime attribute is transitively dependent on any candidate key."
                }
            ]
        }
    ]

    for qd in quizzes_data:
        Quiz.objects.create(
            title=qd["title"],
            subject=subjects_dict[qd["code"]],
            difficulty=qd["difficulty"],
            topic=qd["topic"],
            questions=qd["questions"]
        )
    print("✅ Pre-built practice quizzes created.")

    # 7. Create Study Goals
    StudyGoal.objects.filter(user=student).delete()
    goals = [
        {"title": "Review AVL Tree double rotations (Left-Right and Right-Left)", "code": "BCA-501", "done": True, "mins": 45},
        {"title": "Solve 5 Banker's Algorithm numerical questions for OS", "code": "BCA-502", "done": True, "mins": 60},
        {"title": "Practice SQL Subqueries and Window Functions", "code": "BCA-503", "done": False, "mins": 40},
        {"title": "Study OSI vs TCP/IP layer encapsulation and headers", "code": "BCA-504", "done": False, "mins": 30}
    ]
    for g in goals:
        StudyGoal.objects.create(
            user=student,
            subject=subjects_dict[g["code"]],
            title=g["title"],
            is_completed=g["done"],
            duration_minutes=g["mins"]
        )
    print("✅ Study goals created.")

    # 8. Create Notifications
    Notification.objects.filter(user=student).delete()
    notifications = [
        {
            "title": "Midterm Exam Timetable Published 📅",
            "message": "The BCA Semester 5 Midterm Examinations will commence from next Monday. Please review the previous year question papers in the Resource Library.",
            "type": "exam"
        },
        {
            "title": "New Study Material: AVL Trees & Graph Traversals 📚",
            "message": "Faculty has uploaded Unit 3 comprehensive lecture notes for Data Structures & Algorithms.",
            "type": "note"
        },
        {
            "title": "🔥 7-Day Study Streak Unlocked!",
            "message": "Awesome work! You have maintained a 7-day active study streak. Solve 1 question today to keep it burning.",
            "type": "streak"
        },
        {
            "title": "AI Study Recommendation 💡",
            "message": "Based on your recent assessment in Computer Networks, practice subnetting numericals using the 'Step-by-Step' doubt solver mode.",
            "type": "ai_tip"
        }
    ]
    for n in notifications:
        Notification.objects.create(
            user=student,
            title=n["title"],
            message=n["message"],
            notification_type=n["type"]
        )
    print("✅ Notifications generated.")

    print("\n🎉 Seeding completed successfully!")

if __name__ == "__main__":
    run_seed()
