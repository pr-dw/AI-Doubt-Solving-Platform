import os
import django
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Subject, Exam, StudentExamScore, User, Resource
from api.ai_service import compute_personalized_study_order

print("Seeding Exams and Student Scores...")

faculty = User.objects.filter(role='faculty').first() or User.objects.filter(role='admin').first()
student = User.objects.filter(role='student').first()

if not student:
    print("No student found! Exiting.")
    exit(1)

# Subjects
cn = Subject.objects.filter(code='NBCA-501').first()
da = Subject.objects.filter(code='NBCA-502').first()

if not cn or not da:
    print("Required subjects (NBCA-501, NBCA-502) not found!")
    exit(1)

# Exam 1: Computer Network Mid-Term
exam1, _ = Exam.objects.update_or_create(
    subject=cn,
    title="Mid-Term Examination 2024",
    defaults={
        "semester": 5,
        "exam_type": "Mid-Term Examination",
        "total_marks": 50.0,
        "exam_date": timezone.now().date(),
        "question_paper_pdf": "/media/exams/NBCA-501-MidTerm-2024.pdf",
        "answer_key_pdf": "/media/exams/NBCA-501-AnswerKey-2024.pdf",
        "uploaded_by": faculty,
        "questions_data": [
            {
                "q_no": "Q1",
                "text": "Explain ALOHA and CSMA/CD protocols with channel throughput derivations.",
                "max_marks": 10.0,
                "unit": "Unit II – Medium Access Sub Layer",
                "topic": "ALOHA Protocols"
            },
            {
                "q_no": "Q2",
                "text": "Detailed derivation of Go-Back-N vs Selective Repeat sliding window protocols under frame loss.",
                "max_marks": 10.0,
                "unit": "Unit II – Medium Access Sub Layer",
                "topic": "Sliding Window Protocols"
            },
            {
                "q_no": "Q3",
                "text": "Compare IPv4 vs IPv6 header structures, classless CIDR addressing, and subnetting.",
                "max_marks": 10.0,
                "unit": "Unit III – Network Layer",
                "topic": "IPv4 & IPv6 Addressing"
            },
            {
                "q_no": "Q4",
                "text": "Explain TCP window management, 3-way handshake and slow-start congestion control mechanisms.",
                "max_marks": 10.0,
                "unit": "Unit IV – Transport Layer",
                "topic": "TCP Window Management"
            },
            {
                "q_no": "Q5",
                "text": "Explain the 7 layers of OSI reference model with functions and PDU encapsulation at each layer.",
                "max_marks": 10.0,
                "unit": "Unit I – Introduction",
                "topic": "OSI Reference Model"
            }
        ]
    }
)

# Exam 1 Student Scores:
score1, _ = StudentExamScore.objects.update_or_create(
    exam=exam1,
    student=student,
    defaults={
        "total_marks_obtained": 24.0,
        "question_scores": [
            {
                "q_no": "Q1",
                "marks_obtained": 4.0,
                "max_marks": 10.0,
                "topic": "ALOHA Protocols",
                "unit": "Unit II",
                "faculty_comment": "Throughput equation derived partially; slotted ALOHA derivation missing."
            },
            {
                "q_no": "Q2",
                "marks_obtained": 2.0,
                "max_marks": 10.0,
                "topic": "Sliding Window Protocols",
                "unit": "Unit II",
                "faculty_comment": "Major confusion between sender window timeout and NAK retransmission."
            },
            {
                "q_no": "Q3",
                "marks_obtained": 5.5,
                "max_marks": 10.0,
                "topic": "IPv4 & IPv6 Addressing",
                "unit": "Unit III",
                "faculty_comment": "CIDR mask calculation correct; IPv6 extension headers omitted."
            },
            {
                "q_no": "Q4",
                "marks_obtained": 3.0,
                "max_marks": 10.0,
                "topic": "TCP Window Management",
                "unit": "Unit IV",
                "faculty_comment": "Congestion avoidance vs fast recovery threshold graph inaccurate."
            },
            {
                "q_no": "Q5",
                "marks_obtained": 9.5,
                "max_marks": 10.0,
                "topic": "OSI Reference Model",
                "unit": "Unit I",
                "faculty_comment": "Excellent answer with accurate architectural layer diagram."
            }
        ]
    }
)

# Exam 2: Data Analytics Assessment
exam2, _ = Exam.objects.update_or_create(
    subject=da,
    title="Internal Assessment 1",
    defaults={
        "semester": 5,
        "exam_type": "Internal Assessment",
        "total_marks": 30.0,
        "exam_date": timezone.now().date(),
        "question_paper_pdf": "/media/exams/NBCA-502-Internal-2024.pdf",
        "uploaded_by": faculty,
        "questions_data": [
            {
                "q_no": "Q1",
                "text": "Explain Null and Alternate hypothesis, Type I and Type II errors with p-value calculation.",
                "max_marks": 10.0,
                "unit": "Unit III – Data Analysis",
                "topic": "Hypothesis Testing"
            },
            {
                "q_no": "Q2",
                "text": "Explain methods for handling missing values and outlier capping in streaming datasets.",
                "max_marks": 10.0,
                "unit": "Unit IV – Mining Data and Data Cleaning",
                "topic": "Data Cleaning & Outliers"
            },
            {
                "q_no": "Q3",
                "text": "Compare Z-test, t-test, and one-way ANOVA with decision rules and degree of freedom.",
                "max_marks": 10.0,
                "unit": "Unit III – Data Analysis",
                "topic": "ANOVA & Statistical Tests"
            }
        ]
    }
)

score2, _ = StudentExamScore.objects.update_or_create(
    exam=exam2,
    student=student,
    defaults={
        "total_marks_obtained": 13.5,
        "question_scores": [
            {
                "q_no": "Q1",
                "marks_obtained": 2.5,
                "max_marks": 10.0,
                "topic": "Hypothesis Testing",
                "unit": "Unit III",
                "faculty_comment": "Confusion between alpha significance level and p-value rejection region."
            },
            {
                "q_no": "Q2",
                "marks_obtained": 8.0,
                "max_marks": 10.0,
                "topic": "Data Cleaning & Outliers",
                "unit": "Unit IV",
                "faculty_comment": "Good IQR and Z-score outlier capping explanation."
            },
            {
                "q_no": "Q3",
                "marks_obtained": 3.0,
                "max_marks": 10.0,
                "topic": "ANOVA & Statistical Tests",
                "unit": "Unit III",
                "faculty_comment": "Between-group vs within-group variance formula incorrectly stated."
            }
        ]
    }
)

# Compute study order
order_result = compute_personalized_study_order(student)
score1.ranked_study_order = order_result.get("ranked_topics", [])
score1.save()
score2.ranked_study_order = order_result.get("ranked_topics", [])
score2.save()

print("Seeded Exams & Scores successfully!")
print(f"Total Ranked Topics Computed: {len(order_result.get('ranked_topics', []))}")
for t in order_result.get('ranked_topics', [])[:5]:
    print(f"Rank #{t['rank']}: [{t['priority']}] {t['topic']} ({t['subject_code']}) - Lost {t['marks_lost']} marks ({t['percentage']}%)")
