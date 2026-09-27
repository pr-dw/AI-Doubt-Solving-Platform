import os
import django
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Subject, Exam, StudentExamScore, User
from api.ai_service import compute_personalized_study_order

print("Seeding Official College Exam Structure (Quiz 1-3 [30 Marks, Sets A-E] & Pre-End Sem [100 Marks])...")

# Clean old non-standard exams
Exam.objects.all().delete()
StudentExamScore.objects.all().delete()

faculty = User.objects.filter(role='faculty').first() or User.objects.filter(role='admin').first()
student = User.objects.filter(role='student').first()

if not student:
    print("No student found! Exiting.")
    exit(1)

cn = Subject.objects.filter(code='NBCA-501').first()
da = Subject.objects.filter(code='NBCA-502').first()

if not cn or not da:
    print("Required subjects not found!")
    exit(1)

# -----------------------------------------------------------------------------
# 1. QUIZ 1 (30 Marks, Set A) - Computer Network
# -----------------------------------------------------------------------------
quiz1_questions = [
    # Part A: 2 x 5 marks = 10 marks
    {
        "q_no": "Part A - Q1",
        "text": "Explain the 7 layers of OSI reference model with functions and PDU encapsulation at each layer.",
        "max_marks": 5.0,
        "unit": "Unit I – Introduction",
        "topic": "OSI Reference Model"
    },
    {
        "q_no": "Part A - Q2",
        "text": "Compare physical layer transmission media: Twisted pair, Coaxial cable, and Optical Fiber with delay analysis.",
        "max_marks": 5.0,
        "unit": "Unit I – Introduction",
        "topic": "Physical Layer Transmission Media"
    },
    # Part B: Q3 (a-f) 1 mark each = 6 marks
    {
        "q_no": "Part B - Q3(a)",
        "text": "Define Bandwidth-Delay Product.",
        "max_marks": 1.0,
        "unit": "Unit I – Introduction",
        "topic": "Delay Analysis"
    },
    {
        "q_no": "Part B - Q3(b)",
        "text": "What is bit stuffing in Data Link Layer framing?",
        "max_marks": 1.0,
        "unit": "Unit II – Medium Access Sub Layer",
        "topic": "Data Link Layer Framing"
    },
    {
        "q_no": "Part B - Q3(c)",
        "text": "State the maximum theoretical efficiency of Pure ALOHA.",
        "max_marks": 1.0,
        "unit": "Unit II – Medium Access Sub Layer",
        "topic": "ALOHA Protocols"
    },
    {
        "q_no": "Part B - Q3(d)",
        "text": "What is piggybacking in sliding window protocols?",
        "max_marks": 1.0,
        "unit": "Unit II – Medium Access Sub Layer",
        "topic": "Sliding Window Protocols"
    },
    {
        "q_no": "Part B - Q3(e)",
        "text": "Define Hamming distance required to detect 'd' single bit errors.",
        "max_marks": 1.0,
        "unit": "Unit II – Medium Access Sub Layer",
        "topic": "Error Handling"
    },
    {
        "q_no": "Part B - Q3(f)",
        "text": "What is the minimum frame size of IEEE 802.3 Standard Ethernet?",
        "max_marks": 1.0,
        "unit": "Unit II – Medium Access Sub Layer",
        "topic": "IEEE Standards"
    },
    # Q4: 7 marks
    {
        "q_no": "Part B - Q4",
        "text": "Explain ALOHA and CSMA/CD collision detection protocols with throughput equation derivation.",
        "max_marks": 7.0,
        "unit": "Unit II – Medium Access Sub Layer",
        "topic": "ALOHA Protocols"
    },
    # Q5: 7 marks
    {
        "q_no": "Part B - Q5",
        "text": "Derive working of Go-Back-N and Selective Repeat sliding window protocols under frame loss with sender/receiver window sizes.",
        "max_marks": 7.0,
        "unit": "Unit II – Medium Access Sub Layer",
        "topic": "Sliding Window Protocols"
    }
]

quiz1 = Exam.objects.create(
    subject=cn,
    title="Quiz 1",
    exam_type="Quiz 1",
    paper_set="Set A",
    semester=5,
    total_marks=30.0,
    exam_date=timezone.now().date(),
    question_paper_pdf="/media/exams/NBCA-501-Quiz1-SetA.pdf",
    answer_key_pdf="/media/exams/NBCA-501-Quiz1-AnswerKey.pdf",
    questions_data=quiz1_questions,
    uploaded_by=faculty
)

# Student scores for Quiz 1:
StudentExamScore.objects.create(
    exam=quiz1,
    student=student,
    total_marks_obtained=14.5,
    question_scores=[
        {"q_no": "Part A - Q1", "marks_obtained": 4.5, "max_marks": 5.0, "topic": "OSI Reference Model", "unit": "Unit I", "faculty_notes": "Well drawn diagram"},
        {"q_no": "Part A - Q2", "marks_obtained": 3.0, "max_marks": 5.0, "topic": "Physical Layer Transmission Media", "unit": "Unit I", "faculty_notes": "Optical fiber dispersion missing"},
        {"q_no": "Part B - Q3(a)", "marks_obtained": 1.0, "max_marks": 1.0, "topic": "Delay Analysis", "unit": "Unit I"},
        {"q_no": "Part B - Q3(b)", "marks_obtained": 1.0, "max_marks": 1.0, "topic": "Data Link Layer Framing", "unit": "Unit II"},
        {"q_no": "Part B - Q3(c)", "marks_obtained": 0.0, "max_marks": 1.0, "topic": "ALOHA Protocols", "unit": "Unit II", "faculty_notes": "Wrote 36.8% instead of 18.4%"},
        {"q_no": "Part B - Q3(d)", "marks_obtained": 1.0, "max_marks": 1.0, "topic": "Sliding Window Protocols", "unit": "Unit II"},
        {"q_no": "Part B - Q3(e)", "marks_obtained": 0.0, "max_marks": 1.0, "topic": "Error Handling", "unit": "Unit II"},
        {"q_no": "Part B - Q3(f)", "marks_obtained": 1.0, "max_marks": 1.0, "topic": "IEEE Standards", "unit": "Unit II"},
        {"q_no": "Part B - Q4", "marks_obtained": 2.5, "max_marks": 7.0, "topic": "ALOHA Protocols", "unit": "Unit II", "faculty_notes": "Throughput derivation incomplete, missed vulnerable time period"},
        {"q_no": "Part B - Q5", "marks_obtained": 1.5, "max_marks": 7.0, "topic": "Sliding Window Protocols", "unit": "Unit II", "faculty_notes": "Severe confusion between Go-Back-N timeout retransmission and Selective Repeat NAK"}
    ]
)

# -----------------------------------------------------------------------------
# 2. PRE-END SEMESTER EXAMINATION (100 Marks, No Sets) - Computer Network
# -----------------------------------------------------------------------------
pre_end_questions = [
    # Q1: 10 parts x 4 marks = 40 marks (Compulsory)
    {
        "q_no": "Q1(a)", "text": "Distinguish between connection-oriented vs connectionless services.", "max_marks": 4.0, "unit": "Unit I", "topic": "OSI Reference Model"
    },
    {
        "q_no": "Q1(b)", "text": "Explain propagation delay vs transmission delay in packet switching.", "max_marks": 4.0, "unit": "Unit I", "topic": "Delay Analysis"
    },
    {
        "q_no": "Q1(c)", "text": "Explain CRC error detection polynomial division steps.", "max_marks": 4.0, "unit": "Unit II", "topic": "Error Handling"
    },
    {
        "q_no": "Q1(d)", "text": "Compare Slotted ALOHA vs Pure ALOHA channel allocation.", "max_marks": 4.0, "unit": "Unit II", "topic": "ALOHA Protocols"
    },
    {
        "q_no": "Q1(e)", "text": "What is Count-to-Infinity problem in Distance Vector routing?", "max_marks": 4.0, "unit": "Unit III", "topic": "Routing"
    },
    {
        "q_no": "Q1(f)", "text": "Explain CIDR subnetting and supernetting with IPv4 example.", "max_marks": 4.0, "unit": "Unit III", "topic": "IPv4 Addressing"
    },
    {
        "q_no": "Q1(g)", "text": "Explain Leaky Bucket vs Token Bucket congestion control.", "max_marks": 4.0, "unit": "Unit III", "topic": "Congestion Control"
    },
    {
        "q_no": "Q1(h)", "text": "Explain TCP 3-way handshake SYN, SYN-ACK, ACK connection establishment.", "max_marks": 4.0, "unit": "Unit IV", "topic": "Connection Management"
    },
    {
        "q_no": "Q1(i)", "text": "Describe RSA public key cryptography mechanism.", "max_marks": 4.0, "unit": "Unit IV", "topic": "Cryptography"
    },
    {
        "q_no": "Q1(j)", "text": "Explain SMTP vs POP3/IMAP email architecture.", "max_marks": 4.0, "unit": "Unit V", "topic": "Electronic Mail"
    },

    # Unit I Choice (12 Marks)
    { "q_no": "Unit I - Q2", "text": "Detailed comparison of OSI Model vs TCP/IP Model and network switching methods.", "max_marks": 12.0, "unit": "Unit I", "topic": "OSI Reference Model", "is_choice": True, "choice_group": "Unit I" },
    { "q_no": "Unit I - Q3", "text": "Explain network topologies, delay analysis, and wireless transmission media.", "max_marks": 12.0, "unit": "Unit I", "topic": "Network Topology", "is_choice": True, "choice_group": "Unit I" },

    # Unit II Choice (12 Marks)
    { "q_no": "Unit II - Q4", "text": "Design and analysis of Sliding Window protocols (Stop-and-Wait, Go-Back-N, Selective Repeat).", "max_marks": 12.0, "unit": "Unit II", "topic": "Sliding Window Protocols", "is_choice": True, "choice_group": "Unit II" },
    { "q_no": "Unit II - Q5", "text": "Explain IEEE 802.3 Ethernet, 802.11 Wi-Fi MAC layer protocols and CSMA/CD.", "max_marks": 12.0, "unit": "Unit II", "topic": "IEEE Standards", "is_choice": True, "choice_group": "Unit II" },

    # Unit III Choice (12 Marks)
    { "q_no": "Unit III - Q6", "text": "Explain Link State Routing (Dijkstra algorithm) vs Distance Vector Routing (Bellman-Ford).", "max_marks": 12.0, "unit": "Unit III", "topic": "Routing", "is_choice": True, "choice_group": "Unit III" },
    { "q_no": "Unit III - Q7", "text": "IPv4 vs IPv6 datagram headers, packet fragmentation, and ICMP control messages.", "max_marks": 12.0, "unit": "Unit III", "topic": "IPv6 Addressing", "is_choice": True, "choice_group": "Unit III" },

    # Unit IV Choice (12 Marks)
    { "q_no": "Unit IV - Q8", "text": "Explain TCP Window Management, Congestion Control (Slow Start, Congestion Avoidance), and connection termination.", "max_marks": 12.0, "unit": "Unit IV", "topic": "TCP Window Management", "is_choice": True, "choice_group": "Unit IV" },
    { "q_no": "Unit IV - Q9", "text": "Symmetric vs Asymmetric Cryptography: DES, AES, RSA, and digital signatures.", "max_marks": 12.0, "unit": "Unit IV", "topic": "Cryptography", "is_choice": True, "choice_group": "Unit IV" },

    # Unit V Choice (12 Marks)
    { "q_no": "Unit V - Q10", "text": "Explain Application Layer protocols: HTTP 1.1 vs HTTP/2, DNS resolution hierarchy, and FTP.", "max_marks": 12.0, "unit": "Unit V", "topic": "File Transfer", "is_choice": True, "choice_group": "Unit V" },
    { "q_no": "Unit V - Q11", "text": "Explain Electronic Mail architecture: User Agent, MTA, SMTP, POP3, IMAP, and MIME.", "max_marks": 12.0, "unit": "Unit V", "topic": "Electronic Mail", "is_choice": True, "choice_group": "Unit V" }
]

pre_end = Exam.objects.create(
    subject=cn,
    title="Pre-End Semester Examination",
    exam_type="Pre-End Semester Examination",
    paper_set="",  # Pre-End has no sets
    semester=5,
    total_marks=100.0,
    exam_date=timezone.now().date(),
    question_paper_pdf="/media/exams/NBCA-501-PreEndSem.pdf",
    answer_key_pdf="/media/exams/NBCA-501-PreEndSem-Solutions.pdf",
    questions_data=pre_end_questions,
    uploaded_by=faculty
)

# Student evaluated on Pre-End Sem:
StudentExamScore.objects.create(
    exam=pre_end,
    student=student,
    total_marks_obtained=56.0,
    question_scores=[
        # Q1 (10 x 4 marks = 40 marks): Obtained 24/40
        {"q_no": "Q1(a)", "marks_obtained": 3.0, "max_marks": 4.0, "topic": "OSI Reference Model", "unit": "Unit I"},
        {"q_no": "Q1(b)", "marks_obtained": 3.0, "max_marks": 4.0, "topic": "Delay Analysis", "unit": "Unit I"},
        {"q_no": "Q1(c)", "marks_obtained": 3.5, "max_marks": 4.0, "topic": "Error Handling", "unit": "Unit II"},
        {"q_no": "Q1(d)", "marks_obtained": 1.5, "max_marks": 4.0, "topic": "ALOHA Protocols", "unit": "Unit II", "faculty_notes": "Vulnerable time equation incorrect"},
        {"q_no": "Q1(e)", "marks_obtained": 2.0, "max_marks": 4.0, "topic": "Routing", "unit": "Unit III"},
        {"q_no": "Q1(f)", "marks_obtained": 2.0, "max_marks": 4.0, "topic": "IPv4 Addressing", "unit": "Unit III"},
        {"q_no": "Q1(g)", "marks_obtained": 2.5, "max_marks": 4.0, "topic": "Congestion Control", "unit": "Unit III"},
        {"q_no": "Q1(h)", "marks_obtained": 3.0, "max_marks": 4.0, "topic": "Connection Management", "unit": "Unit IV"},
        {"q_no": "Q1(i)", "marks_obtained": 1.5, "max_marks": 4.0, "topic": "Cryptography", "unit": "Unit IV", "faculty_notes": "Prime factorization step incomplete"},
        {"q_no": "Q1(j)", "marks_obtained": 2.0, "max_marks": 4.0, "topic": "Electronic Mail", "unit": "Unit V"},

        # Unit I Choice: Student chose Q2 (Obtained 9.0/12.0), Q3 was choice omitted
        {"q_no": "Unit I - Q2", "marks_obtained": 9.0, "max_marks": 12.0, "topic": "OSI Reference Model", "unit": "Unit I", "attempted": True},
        {"q_no": "Unit I - Q3", "marks_obtained": 0.0, "max_marks": 12.0, "topic": "Network Topology", "unit": "Unit I", "is_choice_omitted": True, "attempted": False},

        # Unit II Choice: Student chose Q4 (Obtained 4.0/12.0), Q5 was choice omitted
        {"q_no": "Unit II - Q4", "marks_obtained": 4.0, "max_marks": 12.0, "topic": "Sliding Window Protocols", "unit": "Unit II", "attempted": True, "faculty_notes": "Window sequence derivation had errors"},
        {"q_no": "Unit II - Q5", "marks_obtained": 0.0, "max_marks": 12.0, "topic": "IEEE Standards", "unit": "Unit II", "is_choice_omitted": True, "attempted": False},

        # Unit III Choice: Student chose Q6 (Obtained 8.0/12.0), Q7 was choice omitted
        {"q_no": "Unit III - Q6", "marks_obtained": 8.0, "max_marks": 12.0, "topic": "Routing", "unit": "Unit III", "attempted": True},
        {"q_no": "Unit III - Q7", "marks_obtained": 0.0, "max_marks": 12.0, "topic": "IPv6 Addressing", "unit": "Unit III", "is_choice_omitted": True, "attempted": False},

        # Unit IV Choice: Student chose Q8 (Obtained 5.0/12.0), Q9 was choice omitted
        {"q_no": "Unit IV - Q8", "marks_obtained": 5.0, "max_marks": 12.0, "topic": "TCP Window Management", "unit": "Unit IV", "attempted": True, "faculty_notes": "Slow-start threshold explanation missing"},
        {"q_no": "Unit IV - Q9", "marks_obtained": 0.0, "max_marks": 12.0, "topic": "Cryptography", "unit": "Unit IV", "is_choice_omitted": True, "attempted": False},

        # Unit V Choice: Student chose Q11 (Obtained 6.0/12.0), Q10 was choice omitted
        {"q_no": "Unit V - Q10", "marks_obtained": 0.0, "max_marks": 12.0, "topic": "File Transfer", "unit": "Unit V", "is_choice_omitted": True, "attempted": False},
        {"q_no": "Unit V - Q11", "marks_obtained": 6.0, "max_marks": 12.0, "topic": "Electronic Mail", "unit": "Unit V", "attempted": True}
    ]
)

# Compute study order
order = compute_personalized_study_order(student)
print(f"Computed Study Order with {len(order.get('ranked_topics', []))} topics.")
print("Top 3 Topics needing highest attention:")
for t in order.get('ranked_topics', [])[:3]:
    print(f" - Rank #{t['rank']}: {t['topic']} ({t['priority']}) | Lost: {t['marks_lost']} marks | ROI Deficit: {t['deficit_score']}")

print("Seeding completed successfully!")
