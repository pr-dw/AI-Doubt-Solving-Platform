import json
import logging
import os
import uuid
from datetime import date, timedelta
from django.utils import timezone
from django.conf import settings

logger = logging.getLogger(__name__)
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.db.models import Avg, Count, Q
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    User, Subject, AcademicRecord, Resource, PersonalNote,
    Conversation, Message, StudyGoal, Quiz,
    QuizAttempt, Notification, Roadmap,
    Exam, StudentExamScore, MockExam, ExamPaperFormat
)
from .serializers import (
    UserSerializer, RegisterSerializer, SubjectSerializer,
    AcademicRecordSerializer, ResourceSerializer, PersonalNoteSerializer,
    ConversationSerializer, MessageSerializer, StudyGoalSerializer,
    QuizSerializer, QuizAttemptSerializer, NotificationSerializer,
    RoadmapSerializer, ExamSerializer, StudentExamScoreSerializer,
    MockExamSerializer, ExamPaperFormatSerializer
)
from .ai_service import (
    call_ai_engine, call_ollama, generate_roadmap_content,
    AVAILABLE_MODELS, compute_personalized_study_order, extract_text_from_pdf_file,
    generate_standard_exam_pdf_filename, analyze_question_paper_with_ai,
    generate_ai_mock_exam, parse_subject_units_and_topics
)


from django.http import HttpResponse

class RootView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if 'text/html' in request.META.get('HTTP_ACCEPT', ''):
            html_content = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>AI Doubt Solving Platform | Backend API</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        background: #030712;
                        color: #f3f4f6;
                        margin: 0;
                        padding: 40px 20px;
                        display: flex;
                        justify-content: center;
                    }
                    .container {
                        max-width: 800px;
                        width: 100%;
                        background: rgba(15, 23, 42, 0.8);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 24px;
                        padding: 36px;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    }
                    .badge {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 9999px;
                        font-size: 12px;
                        font-weight: 700;
                        background: rgba(99, 102, 241, 0.2);
                        color: #a5b4fc;
                        border: 1px solid rgba(99, 102, 241, 0.3);
                        margin-bottom: 16px;
                    }
                    h1 {
                        font-size: 28px;
                        margin: 0 0 8px 0;
                        color: #ffffff;
                    }
                    p {
                        color: #94a3b8;
                        font-size: 14px;
                        line-height: 1.6;
                        margin-top: 0;
                    }
                    .frontend-card {
                        background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15));
                        border: 1px solid rgba(99, 102, 241, 0.4);
                        border-radius: 16px;
                        padding: 20px;
                        margin: 24px 0;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        flex-wrap: wrap;
                        gap: 16px;
                    }
                    .frontend-btn {
                        background: #6366f1;
                        color: white;
                        text-decoration: none;
                        padding: 10px 20px;
                        border-radius: 12px;
                        font-weight: 600;
                        font-size: 14px;
                        transition: background 0.2s;
                    }
                    .frontend-btn:hover {
                        background: #4f46e5;
                    }
                    .grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                        gap: 14px;
                        margin-top: 24px;
                    }
                    .endpoint-card {
                        background: #0f172a;
                        border: 1px solid #1e293b;
                        border-radius: 12px;
                        padding: 16px;
                        transition: border-color 0.2s;
                    }
                    .endpoint-card:hover {
                        border-color: #6366f1;
                    }
                    .endpoint-card a {
                        color: #818cf8;
                        text-decoration: none;
                        font-weight: 600;
                        font-size: 13px;
                        font-family: monospace;
                    }
                    .endpoint-desc {
                        font-size: 12px;
                        color: #64748b;
                        margin-top: 4px;
                    }
                    .footer {
                        margin-top: 32px;
                        padding-top: 20px;
                        border-top: 1px solid #1e293b;
                        font-size: 12px;
                        color: #64748b;
                        display: flex;
                        justify-content: space-between;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <span class="badge">🚀 Django REST Framework Backend</span>
                    <h1>AI Doubt Solving Platform API</h1>
                    <p>
                        The backend API server is operational and connected to Django ORM and local Ollama reasoning services.
                    </p>

                    <div class="frontend-card">
                        <div>
                            <div style="font-weight: 700; color: #fff; font-size: 16px;">Looking for the Web Application?</div>
                            <div style="font-size: 13px; color: #cbd5e1; margin-top: 2px;">
                                The student web platform runs on Vite at <strong>http://127.0.0.1:5173/</strong>
                            </div>
                        </div>
                        <a href="http://127.0.0.1:5173/" class="frontend-btn">Open Web App →</a>
                    </div>

                    <h3 style="font-size: 16px; margin: 20px 0 10px 0; color: #e2e8f0;">Available API Endpoints:</h3>
                    <div class="grid">
                        <div class="endpoint-card">
                            <a href="/api/health/">GET /api/health/</a>
                            <div class="endpoint-desc">System health & telemetry check</div>
                        </div>
                        <div class="endpoint-card">
                            <a href="/api/subjects/">GET /api/subjects/</a>
                            <div class="endpoint-desc">BCA Sem 5 curriculum subjects</div>
                        </div>
                        <div class="endpoint-card">
                            <a href="/api/resources/">GET /api/resources/</a>
                            <div class="endpoint-desc">Notes, PYQs & answer keys</div>
                        </div>
                        <div class="endpoint-card">
                            <a href="/api/quizzes/">GET /api/quizzes/</a>
                            <div class="endpoint-desc">Practice quizzes & questions</div>
                        </div>
                        <div class="endpoint-card">
                            <a href="/api/admin/stats/">GET /api/admin/stats/</a>
                            <div class="endpoint-desc">Platform usage & Ollama status</div>
                        </div>
                        <div class="endpoint-card">
                            <a href="/admin/">GET /admin/</a>
                            <div class="endpoint-desc">Django Administrator Portal</div>
                        </div>
                    </div>

                    <div class="footer">
                        <span>AI Doubt Solving Platform API</span>
                        <span>Django REST Framework • Ollama Engine</span>
                    </div>
                </div>
            </body>
            </html>
            """
            return HttpResponse(html_content, content_type='text/html')

        return Response({
            "service": "AI Doubt Solving Platform API",
            "status": "healthy",
            "version": "1.0.0",
            "frontend_url": "http://127.0.0.1:5173/",
            "endpoints": {
                "health": "/api/health/",
                "auth_login": "/api/auth/login/",
                "auth_register": "/api/auth/register/",
                "subjects": "/api/subjects/",
                "academic_records": "/api/academic/records/",
                "analytics_report": "/api/analytics/report/",
                "ai_query": "/api/ai/query/",
                "resources": "/api/resources/",
                "study_goals": "/api/study/goals/",
                "quizzes": "/api/quizzes/",
                "notifications": "/api/notifications/",
                "search": "/api/search/",
                "admin_stats": "/api/admin/stats/",
                "django_admin": "/admin/"
            }
        })


class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({
            "status": "healthy",
            "service": "AI Doubt Solving Platform API",
            "version": "1.0.0",
            "system_time": timezone.now().isoformat()
        })


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            
            # Create a welcome notification
            Notification.objects.create(
                user=user,
                title="Welcome to AI Doubt Solving Platform! 🎓",
                message="Your account is active. Start asking doubts in Detailed, ELI5, and Assist modes, generate roadmaps, and track study streaks.",
                notification_type="announcement"
            )

            return Response({
                "message": "Registration successful!",
                "user": UserSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        if not email or not password:
            return Response({"detail": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email, password=password)
        if not user:
            # Check if user exists to provide helpful error
            try:
                user_obj = User.objects.get(email=email)
                if not user_obj.check_password(password):
                    return Response({"detail": "Invalid credentials. Please verify your password."}, status=status.HTTP_401_UNAUTHORIZED)
                user = user_obj
            except User.DoesNotExist:
                return Response({"detail": "No account found with this college email."}, status=status.HTTP_404_NOT_FOUND)

        # Update streak if logged in today
        today = date.today()
        if user.last_active_date:
            diff = (today - user.last_active_date).days
            if diff == 1:
                user.streak_count += 1
                if user.streak_count > user.longest_streak:
                    user.longest_streak = user.streak_count
            elif diff > 1:
                user.streak_count = 1
        user.last_active_date = today
        user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "Login successful!",
            "user": UserSerializer(user).data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        })


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        user = request.user
        data = request.data
        
        # Fields that students and faculty are permitted to update (bio, avatar)
        if 'bio' in data:
            user.bio = data['bio']
        if 'avatar' in data:
            user.avatar = data['avatar']

        # Institutional registry fields: strictly managed by Admin based on registered records
        if user.role == 'admin':
            if 'name' in data:
                user.name = data['name']
            if 'phone' in data:
                user.phone = data['phone']
            if 'email' in data:
                user.email = data['email'].lower()
                user.username = data['email'].lower()
            if 'roll_number' in data:
                user.roll_number = data['roll_number']
            if 'department' in data:
                user.department = data['department']
            if 'semester' in data:
                try:
                    user.semester = int(data['semester'])
                except (ValueError, TypeError):
                    pass
            if 'section' in data:
                user.section = data['section']

        user.save()
        return Response(UserSerializer(user).data)


class ChangePasswordView(APIView):
    """
    Enables users to change their password securely:
    Requires entering current password, new password, and confirming new password.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get('current_password', '')
        new_password = request.data.get('new_password', '')
        confirm_password = request.data.get('confirm_password', '')

        if not current_password or not new_password or not confirm_password:
            return Response(
                {"detail": "Please fill in current password, new password, and confirm password."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.check_password(current_password):
            return Response(
                {"detail": "The current password you entered is incorrect."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 6:
            return Response(
                {"detail": "New password must be at least 6 characters long."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_password != confirm_password:
            return Response(
                {"detail": "New password and confirmation password do not match."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if current_password == new_password:
            return Response(
                {"detail": "New password cannot be identical to your current password."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()

        return Response({"message": "Password changed successfully! Please use your new password next time you sign in."})


class SubjectListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user = request.user
        semester = request.GET.get('semester')
        department = request.GET.get('department')
        search = request.GET.get('search')

        queryset = Subject.objects.all().order_by('semester', 'code')

        # If a student requests without specifying any filters, default to student's semester & department
        if not semester and not department and not search and user.is_authenticated and hasattr(user, 'role') and user.role == 'student':
            if hasattr(user, 'department') and user.department:
                queryset = queryset.filter(department=user.department)
            if hasattr(user, 'semester') and user.semester:
                queryset = queryset.filter(semester=user.semester)

        if department and department != 'all':
            queryset = queryset.filter(department__iexact=department.strip())

        if semester and semester != 'all':
            try:
                sem_int = int(semester)
                queryset = queryset.filter(semester=sem_int)
            except (ValueError, TypeError):
                pass

        if search:
            q_clean = search.strip()
            queryset = queryset.filter(
                Q(code__icontains=q_clean) |
                Q(name__icontains=q_clean) |
                Q(syllabus_overview__icontains=q_clean)
            )

        return Response(SubjectSerializer(queryset, many=True).data)

    def post(self, request):
        if not request.user.is_authenticated or request.user.role != 'admin':
            return Response({"detail": "Permission denied. Only administrators can add subjects."}, status=status.HTTP_403_FORBIDDEN)
        serializer = SubjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SubjectDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        if request.user.role != 'admin':
            return Response({"detail": "Permission denied. Only administrators can update subjects."}, status=status.HTTP_403_FORBIDDEN)
        subject = get_object_or_404(Subject, pk=pk)
        serializer = SubjectSerializer(subject, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        if request.user.role != 'admin':
            return Response({"detail": "Permission denied. Only administrators can delete subjects."}, status=status.HTTP_403_FORBIDDEN)
        subject = get_object_or_404(Subject, pk=pk)
        subject.delete()
        return Response({"message": "Subject removed successfully."})


def calculate_grade(percentage):
    if percentage >= 90:
        return 'O'
    elif percentage >= 80:
        return 'A+'
    elif percentage >= 70:
        return 'A'
    elif percentage >= 60:
        return 'B+'
    elif percentage >= 50:
        return 'B'
    elif percentage >= 40:
        return 'C'
    return 'F'


class AcademicRecordView(APIView):
    """
    Returns actual exam records and scores for the student based on genuine faculty assessments (Quiz 1, 2, 3, Pre-End).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        target_student = user
        student_email = request.GET.get('student_email')
        if student_email and user.role in ['faculty', 'admin']:
            target_student = User.objects.filter(email__iexact=student_email.strip()).first() or user
        elif user.role in ['faculty', 'admin']:
            first_scored = StudentExamScore.objects.first()
            if first_scored:
                target_student = first_scored.student

        scores = StudentExamScore.objects.filter(student=target_student).select_related('exam', 'exam__subject').order_by('-exam__exam_date', '-created_at')

        results = []
        for s in scores:
            exam = s.exam
            max_m = float(exam.total_marks) if exam.total_marks > 0 else 30.0
            obtained = float(s.total_marks_obtained)
            pct = round((obtained / max_m) * 100, 1) if max_m > 0 else 0.0
            grade = calculate_grade(pct)
            exam_label = f"{exam.exam_type}{f' ({exam.paper_set})' if exam.paper_set and exam.paper_set not in exam.exam_type else ''}"

            results.append({
                "id": s.id,
                "subject_details": {
                    "id": exam.subject.id,
                    "code": exam.subject.code,
                    "name": exam.subject.name,
                    "semester": exam.subject.semester
                },
                "exam_type": exam_label,
                "marks_obtained": obtained,
                "max_marks": max_m,
                "performance_score": pct,
                "grade": grade,
                "exam_date": exam.exam_date.strftime("%Y-%m-%d") if exam.exam_date else ""
            })

        return Response(results)


class AnalyticsReportView(APIView):
    """
    Computes real performance analytics and AI recommendations from StudentExamScore.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        target_student = user
        student_email = request.GET.get('student_email')
        if student_email and user.role in ['faculty', 'admin']:
            target_student = User.objects.filter(email__iexact=student_email.strip()).first() or user
        elif user.role in ['faculty', 'admin']:
            first_scored = StudentExamScore.objects.first()
            if first_scored:
                target_student = first_scored.student

        scores = StudentExamScore.objects.filter(student=target_student).select_related('exam', 'exam__subject').order_by('-exam__exam_date')

        # Subject-wise aggregation
        subject_map = {}
        for s in scores:
            subj = s.exam.subject
            if subj.id not in subject_map:
                subject_map[subj.id] = {
                    "subject_code": subj.code,
                    "subject_name": subj.name,
                    "total_obtained": 0.0,
                    "total_max": 0.0,
                    "exams": []
                }
            max_m = float(s.exam.total_marks) if s.exam.total_marks > 0 else 30.0
            subject_map[subj.id]["total_obtained"] += float(s.total_marks_obtained)
            subject_map[subj.id]["total_max"] += max_m
            subject_map[subj.id]["exams"].append(f"{s.exam.exam_type}{f' ({s.exam.paper_set})' if s.exam.paper_set else ''}")

        subject_breakdown = []
        for subj_id, data in subject_map.items():
            tot_max = data["total_max"]
            tot_obt = data["total_obtained"]
            score_pct = round((tot_obt / tot_max) * 100, 1) if tot_max > 0 else 0.0
            subject_breakdown.append({
                "subject_code": data["subject_code"],
                "subject_name": data["subject_name"],
                "score": score_pct,
                "marks_obtained": round(tot_obt, 1),
                "max_marks": round(tot_max, 1),
                "grade": calculate_grade(score_pct),
                "exam_type": ", ".join(data["exams"])
            })

        # Sort breakdown by score descending
        subject_breakdown.sort(key=lambda x: x["score"], reverse=True)

        if scores.exists():
            total_obtained_all = sum(s.total_marks_obtained for s in scores)
            total_max_all = sum(s.exam.total_marks for s in scores)
            avg_score = round((total_obtained_all / total_max_all) * 100, 1) if total_max_all > 0 else 0.0
        else:
            avg_score = 0.0

        strong_subjects = [s['subject_name'] for s in subject_breakdown if s['score'] >= 80]
        weak_subjects = [s['subject_name'] for s in subject_breakdown if s['score'] < 70]

        total_queries = Message.objects.filter(conversation__user=target_student, sender='user').count()
        total_quizzes = QuizAttempt.objects.filter(user=target_student).count()
        avg_quiz_score = QuizAttempt.objects.filter(user=target_student).aggregate(Avg('score'))['score__avg'] or 0.0

        ai_recommendations = []
        if weak_subjects:
            ai_recommendations.append(
                f"Focus your revision on {weak_subjects[0]} where your score is currently below 70%. Review priority topics in the Study Planner."
            )
        if scores.exists():
            latest_exam = scores[0].exam
            ai_recommendations.append(
                f"Review question feedback from your recent {latest_exam.title} assessment to strengthen unit weak points."
            )
        else:
            ai_recommendations.append(
                "No graded exam papers recorded yet. Your assessment scores will appear here once faculty scores your papers."
            )

        ai_recommendations.append(
            "Review priority topics and ask AI doubts to maintain steady academic progress and strengthen core subjects."
        )

        return Response({
            "student_name": target_student.name or target_student.email,
            "roll_number": target_student.roll_number,
            "department": target_student.department,
            "semester": target_student.semester,
            "average_score": avg_score,
            "streak_count": target_student.streak_count,
            "longest_streak": target_student.longest_streak,
            "total_queries_asked": total_queries,
            "total_quizzes_attempted": total_quizzes,
            "average_quiz_score": round(avg_quiz_score, 1),
            "subject_breakdown": subject_breakdown,
            "strong_subjects": strong_subjects,
            "weak_subjects": weak_subjects,
            "ai_recommendations": ai_recommendations
        })


class AIQueryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        query_text = request.data.get('query', '').strip()
        mode = request.data.get('mode', 'detailed')
        if mode not in ['detailed', 'eli5', 'assist']:
            mode = 'detailed'
        conversation_id = request.data.get('conversation_id')
        model = request.data.get('model') or request.headers.get('HTTP_X_SELECTED_AI_MODEL') or 'gemini-1.5-flash'

        if not query_text:
            return Response({"detail": "Query text cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

        # Profile Semester & Department context (enrolled curriculum)
        user_semester = getattr(user, 'semester', 5) or 5
        user_dept = getattr(user, 'department', '')

        # Handle conversation thread
        if conversation_id:
            try:
                conversation = Conversation.objects.get(id=conversation_id, user=user)
            except Conversation.DoesNotExist:
                conversation = Conversation.objects.create(
                    user=user,
                    title=query_text[:50] + ("..." if len(query_text) > 50 else ""),
                    mode=mode
                )
        else:
            conversation = Conversation.objects.create(
                user=user,
                title=query_text[:50] + ("..." if len(query_text) > 50 else ""),
                mode=mode
            )

        # Save user message
        Message.objects.create(
            conversation=conversation,
            sender='user',
            message_text=query_text,
            mode_used=mode
        )

        # Generate AI Response grounded in semester syllabus & library resources
        try:
            ai_result = call_ai_engine(
                query_text,
                mode=mode,
                semester=user_semester,
                department=user_dept,
                model=model
            )
            ai_response_text = ai_result['text']
        except Exception as e:
            logger.error(f"AI query failed: {e}")
            return Response(
                {
                    "detail": str(e),
                    "conversation_id": conversation.id,
                    "conversation_title": conversation.title
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # Auto-match identified subject to Subject model
        identified_code = ai_result.get('identified_code')
        matched_subject_obj = None
        if identified_code and identified_code.upper() not in ['GENERAL', 'NONE', 'UNKNOWN']:
            matched_subject_obj = Subject.objects.filter(code__iexact=identified_code).first()

        # If not matched by code, try matching by name
        if not matched_subject_obj and ai_result.get('identified_name') and ai_result.get('identified_name') not in ['General Academic', 'General']:
            matched_subject_obj = Subject.objects.filter(name__icontains=ai_result['identified_name']).first()

        if matched_subject_obj:
            conversation.subject = matched_subject_obj
            # Tag subject into conversation title if not already tagged
            if not conversation.title.startswith(f"[{matched_subject_obj.code}]"):
                conversation.title = f"[{matched_subject_obj.code}] {query_text[:40]}" + ("..." if len(query_text) > 40 else "")
            conversation.save()
        else:
            conversation.subject = None
            # If not matched to any subject, mark as [General] in conversation
            if not conversation.title.startswith("[General]"):
                conversation.title = f"[General] {query_text[:40]}" + ("..." if len(query_text) > 40 else "")
            conversation.save()

        # Save AI message
        ai_message = Message.objects.create(
            conversation=conversation,
            sender='ai',
            message_text=ai_response_text,
            mode_used=mode,
            model_used=ai_result['model']
        )

        # Update conversation timestamp
        conversation.save()

        identified_subject_data = None
        if matched_subject_obj:
            identified_subject_data = {
                "id": matched_subject_obj.id,
                "code": matched_subject_obj.code,
                "name": matched_subject_obj.name,
                "semester": matched_subject_obj.semester
            }
        else:
            identified_subject_data = {
                "id": None,
                "code": "General",
                "name": "General Academic",
                "semester": user_semester
            }

        return Response({
            "conversation_id": conversation.id,
            "conversation_title": conversation.title,
            "user_query": query_text,
            "ai_response": ai_response_text,
            "identified_subject": identified_subject_data,
            "identified_topic": ai_result.get('identified_topic'),
            "mode": mode,
            "model_used": ai_result['model'],
            "source": ai_result.get('source', 'local'),
            "message_id": ai_message.id
        })


class AIModelsView(APIView):
    """
    Returns available AI model providers (Gemini, Ollama Qwen/Gemma, ChatGPT)
    and their configuration status.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        has_gemini = bool(getattr(settings, 'GEMINI_API_KEY', ''))
        has_openai = bool(getattr(settings, 'OPENAI_API_KEY', ''))

        models_data = []
        for m in AVAILABLE_MODELS:
            item = dict(m)
            if 'google' in item['provider'].lower():
                item['is_configured'] = has_gemini
            elif 'openai' in item['provider'].lower():
                item['is_configured'] = has_openai
            else:
                item['is_configured'] = True
            models_data.append(item)

        return Response({
            "models": models_data,
            "default_model": "gemini-1.5-flash" if has_gemini else "ollama:qwen"
        })


class ConversationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        conversations = Conversation.objects.filter(user=request.user).order_by('-last_updated')
        return Response(ConversationSerializer(conversations, many=True).data)


class ConversationDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            conversation = Conversation.objects.get(id=pk, user=request.user)
            return Response(ConversationSerializer(conversation).data)
        except Conversation.DoesNotExist:
            return Response({"detail": "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            conversation = Conversation.objects.get(id=pk, user=request.user)
            conversation.delete()
            return Response({"detail": "Conversation deleted successfully."})
        except Conversation.DoesNotExist:
            return Response({"detail": "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)


class ToggleBookmarkView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            conversation = Conversation.objects.get(id=pk, user=request.user)
            conversation.is_bookmarked = not conversation.is_bookmarked
            conversation.save()
            return Response({"is_bookmarked": conversation.is_bookmarked})
        except Conversation.DoesNotExist:
            return Response({"detail": "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)


class AISummarizeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        topic = request.data.get('topic', '').strip()
        subject_id = request.data.get('subject_id')
        if not topic:
            return Response({"detail": "Topic is required."}, status=status.HTTP_400_BAD_REQUEST)

        subject_name = "Computer Science"
        if subject_id:
            try:
                subject_name = Subject.objects.get(id=subject_id).name
            except Subject.DoesNotExist:
                pass

        summary_prompt = f"Provide a complete, high-yield chapter summary and AI revision notes for '{topic}' in the subject '{subject_name}'. Include key definitions, formulas/diagram explanations, high-frequency exam questions, and memory mnemonics."
        try:
            result = call_ollama(summary_prompt, mode='detailed', subject=subject_name)
        except Exception as e:
            logger.error(f"AI summarize failed: {e}")
            return Response(
                {"detail": str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        return Response({
            "topic": topic,
            "subject": subject_name,
            "summary": result['text'],
            "model_used": result['model']
        })


class StudyOrderView(APIView):
    """
    Returns the student's personalized high-ROI study order ranked from worst-performing
    topics to best-performing topics based on question-wise previous exam scores.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        subject_id = request.GET.get('subject_id')
        exam_id = request.GET.get('exam_id')

        target_user = user
        student_id = request.GET.get('student_id')
        student_email = request.GET.get('student_email')

        if (student_id or student_email) and user.role in ['faculty', 'admin']:
            identifier = str(student_id or student_email).strip()
            target_user = None
            if identifier.isdigit():
                target_user = User.objects.filter(id=int(identifier)).first()
            if not target_user:
                target_user = User.objects.filter(email__iexact=identifier).first()
            if not target_user:
                return Response({"detail": f"Student '{identifier}' not found."}, status=status.HTTP_404_NOT_FOUND)

        study_order = compute_personalized_study_order(target_user, subject_id=subject_id, exam_id=exam_id)

        # Available exams for student
        exams = Exam.objects.filter(student_scores__student=target_user).distinct().order_by('-exam_date')

        return Response({
            "student": {
                "id": target_user.id,
                "name": target_user.name or target_user.email.split('@')[0],
                "email": target_user.email,
                "roll_number": target_user.roll_number,
                "semester": target_user.semester
            },
            "study_order": study_order,
            "available_exams": ExamSerializer(exams, many=True).data
        })


class ExamListView(APIView):
    """
    List exams for a semester or subject, or allow faculty to create a new exam with question breakdown.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        semester = request.GET.get('semester')
        subject_id = request.GET.get('subject_id')

        queryset = Exam.objects.all().select_related('subject', 'uploaded_by').order_by('-exam_date')
        if semester:
            queryset = queryset.filter(semester=semester)
        elif user.role == 'student' and user.semester:
            queryset = queryset.filter(semester=user.semester)

        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)

        # Deduplicate: if old duplicates exist, keep only the latest per subject+exam_type+paper_set
        seen = {}
        deduped = []
        for exam in queryset:
            key = (exam.subject_id, exam.exam_type, exam.paper_set or '')
            if key not in seen:
                seen[key] = True
                deduped.append(exam)

        return Response(ExamSerializer(deduped, many=True).data)

    def post(self, request):
        user = request.user
        if user.role not in ['faculty', 'admin']:
            return Response({"detail": "Permission denied. Only faculty or admin can create exams."}, status=status.HTTP_403_FORBIDDEN)

        subject_id = request.data.get('subject_id')
        title = request.data.get('title', '').strip()
        total_marks = request.data.get('total_marks', 100.0)
        exam_type = request.data.get('exam_type', 'Mid-Term Examination')
        exam_date = request.data.get('exam_date') or timezone.now().date()
        question_paper_pdf = request.data.get('question_paper_pdf', '')
        answer_key_pdf = request.data.get('answer_key_pdf', '')
        questions_data = request.data.get('questions_data', [])
        paper_set = request.data.get('paper_set', '').strip()

        if not subject_id or not title:
            return Response({"detail": "subject_id and title are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            subject = Subject.objects.get(id=subject_id)
        except Subject.DoesNotExist:
            return Response({"detail": "Subject not found."}, status=status.HTTP_404_NOT_FOUND)

        # Handle direct PDF uploads with standardized naming
        if 'question_paper_file' in request.FILES:
            qp_file = request.FILES['question_paper_file']
            std_qp_name = generate_standard_exam_pdf_filename(
                subject_code=subject.code,
                exam_type=exam_type,
                paper_set=paper_set,
                is_answer_key=False
            )
            rel_qp = os.path.join('exams', std_qp_name)
            if default_storage.exists(rel_qp):
                default_storage.delete(rel_qp)
            saved_qp = default_storage.save(rel_qp, ContentFile(qp_file.read()))
            question_paper_pdf = f"{settings.MEDIA_URL}{saved_qp}"

        if 'answer_key_file' in request.FILES:
            ak_file = request.FILES['answer_key_file']
            std_ak_name = generate_standard_exam_pdf_filename(
                subject_code=subject.code,
                exam_type=exam_type,
                paper_set=paper_set,
                is_answer_key=True
            )
            rel_ak = os.path.join('exams', std_ak_name)
            if default_storage.exists(rel_ak):
                default_storage.delete(rel_ak)
            saved_ak = default_storage.save(rel_ak, ContentFile(ak_file.read()))
            answer_key_pdf = f"{settings.MEDIA_URL}{saved_ak}"

        # Handle questions_data if serialized as JSON string in multipart form
        if isinstance(questions_data, str):
            try:
                questions_data = json.loads(questions_data)
            except Exception:
                questions_data = []

        # Prevent duplicates: use update_or_create keyed on subject + exam_type + paper_set
        lookup = {
            'subject': subject,
            'exam_type': exam_type,
            'paper_set': paper_set,
        }
        defaults = {
            'title': title,
            'semester': subject.semester,
            'total_marks': float(total_marks),
            'exam_date': exam_date,
            'question_paper_pdf': question_paper_pdf,
            'answer_key_pdf': answer_key_pdf,
            'questions_data': questions_data,
            'uploaded_by': user,
        }
        exam, created = Exam.objects.update_or_create(**lookup, defaults=defaults)

        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(ExamSerializer(exam).data, status=status_code)


class ExamPDFAnalyzeView(APIView):
    """
    Analyzes an uploaded Question Paper or Answer Key PDF:
    1. Renames the PDF cleanly according to subject code, exam type, and set (e.g. NBCA-501_Quiz_1_Set_A.pdf).
    2. Saves it directly into backend media/exams/ storage.
    3. Uses pypdf & AI engine grounded in the subject's official syllabus to extract question numbers,
       maximum marks, units, and topic tags.
    4. Returns the file_url, standard filename, and auto-populated question breakdown.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        if request.user.role not in ['faculty', 'admin']:
            return Response({"detail": "Permission denied. Only faculty or admin can analyze exam PDFs."}, status=status.HTTP_403_FORBIDDEN)

        uploaded_file = request.FILES.get('file')
        subject_id = request.data.get('subject_id')
        exam_type = request.data.get('exam_type', 'Quiz 1')
        paper_set = request.data.get('paper_set', '')
        is_answer_key = request.data.get('is_answer_key', 'false').lower() in ['true', '1']

        if not uploaded_file:
            return Response({"detail": "PDF file is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            subject = Subject.objects.get(id=subject_id)
        except (Subject.DoesNotExist, ValueError):
            subject = Subject.objects.filter(code='NBCA-501').first()

        # Generate standardized filename based on subject, exam type, set
        standard_name = generate_standard_exam_pdf_filename(
            subject_code=subject.code if subject else 'NBCA-501',
            exam_type=exam_type,
            paper_set=paper_set,
            is_answer_key=is_answer_key
        )

        relative_path = os.path.join('exams', standard_name)
        if default_storage.exists(relative_path):
            default_storage.delete(relative_path)
            
        saved_path = default_storage.save(relative_path, ContentFile(uploaded_file.read()))
        file_url = f"{settings.MEDIA_URL}{saved_path}"
        full_disk_path = default_storage.path(saved_path)

        # If it's an answer key, return the standardized URL
        if is_answer_key:
            return Response({
                "message": f"Answer Key PDF uploaded and saved as {standard_name}.",
                "file_url": file_url,
                "filename": standard_name,
                "is_answer_key": True
            }, status=status.HTTP_200_OK)

        model = request.data.get('model') or request.headers.get('HTTP_X_SELECTED_AI_MODEL') or 'gemini-1.5-flash'

        # For Question Paper: Extract text using pypdf and analyze with AI
        extracted_text = extract_text_from_pdf_file(full_disk_path)

        questions = analyze_question_paper_with_ai(
            pdf_text=extracted_text,
            subject=subject,
            exam_type=exam_type,
            paper_set=paper_set,
            model=model
        )

        return Response({
            "message": f"Question paper analyzed! Found and mapped {len(questions)} syllabus questions.",
            "file_url": file_url,
            "filename": standard_name,
            "exam_type": exam_type,
            "paper_set": paper_set,
            "model_used": model,
            "extracted_text_preview": extracted_text[:300] if extracted_text else "Direct syllabus alignment",
            "questions": questions
        }, status=status.HTTP_200_OK)


class ExamDetailView(APIView):
    """
    Returns full details for an exam, including question breakdown, PDF links,
    and student's personal scores.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            exam = Exam.objects.select_related('subject', 'uploaded_by').get(pk=pk)
        except Exam.DoesNotExist:
            return Response({"detail": "Exam not found."}, status=status.HTTP_404_NOT_FOUND)

        data = ExamSerializer(exam).data

        if request.user.role == 'student':
            student_score = StudentExamScore.objects.filter(exam=exam, student=request.user).first()
            data['my_score'] = StudentExamScoreSerializer(student_score).data if student_score else None
        else:
            all_scores = StudentExamScore.objects.filter(exam=exam).select_related('student')
            data['student_scores'] = StudentExamScoreSerializer(all_scores, many=True).data

        return Response(data)

    def put(self, request, pk):
        if request.user.role not in ['faculty', 'admin']:
            return Response({"detail": "Permission denied. Only faculty or admin can edit exams."}, status=status.HTTP_403_FORBIDDEN)
        try:
            exam = Exam.objects.get(pk=pk)
        except Exam.DoesNotExist:
            return Response({"detail": "Exam not found."}, status=status.HTTP_404_NOT_FOUND)

        title = request.data.get('title')
        total_marks = request.data.get('total_marks')
        exam_date = request.data.get('exam_date')
        paper_set = request.data.get('paper_set')
        questions_data = request.data.get('questions_data')
        question_paper_pdf = request.data.get('question_paper_pdf')
        answer_key_pdf = request.data.get('answer_key_pdf')

        if title is not None:
            exam.title = title
        if total_marks is not None:
            exam.total_marks = float(total_marks)
        if exam_date is not None:
            exam.exam_date = exam_date
        if paper_set is not None:
            exam.paper_set = paper_set
        if question_paper_pdf is not None:
            exam.question_paper_pdf = question_paper_pdf
        if answer_key_pdf is not None:
            exam.answer_key_pdf = answer_key_pdf
        if questions_data is not None:
            if isinstance(questions_data, str):
                try:
                    questions_data = json.loads(questions_data)
                except Exception:
                    pass
            exam.questions_data = questions_data

        exam.save()
        return Response(ExamSerializer(exam).data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        if request.user.role not in ['faculty', 'admin']:
            return Response({"detail": "Permission denied. Only faculty or admin can delete exams."}, status=status.HTTP_403_FORBIDDEN)
        try:
            exam = Exam.objects.get(pk=pk)
            exam.delete()
            return Response({"detail": "Exam deleted successfully."}, status=status.HTTP_200_OK)
        except Exam.DoesNotExist:
            return Response({"detail": "Exam not found."}, status=status.HTTP_404_NOT_FOUND)


class ExamScoreUploadView(APIView):
    """
    Allows faculty to upload/record question-by-question marks for a student.
    Automatically recalculates the student's personalized study order.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role not in ['faculty', 'admin']:
            return Response({"detail": "Permission denied. Only faculty can upload exam scores."}, status=status.HTTP_403_FORBIDDEN)

        try:
            exam = Exam.objects.get(pk=pk)
        except Exam.DoesNotExist:
            return Response({"detail": "Exam not found."}, status=status.HTTP_404_NOT_FOUND)

        student_id = request.data.get('student_id')
        student_email = request.data.get('student_email')
        question_scores = request.data.get('question_scores', [])

        student = None
        if student_id:
            student = User.objects.filter(id=student_id).first()
        elif student_email:
            student = User.objects.filter(email__iexact=student_email).first()

        if not student:
            return Response({"detail": "Valid student_id or student_email is required."}, status=status.HTTP_400_BAD_REQUEST)

        total_obtained = sum(float(q.get('marks_obtained', 0.0)) for q in question_scores)

        score_obj, created = StudentExamScore.objects.update_or_create(
            exam=exam,
            student=student,
            defaults={
                "total_marks_obtained": total_obtained,
                "question_scores": question_scores
            }
        )

        # Compute updated personalized study order
        study_order = compute_personalized_study_order(student)
        score_obj.ranked_study_order = study_order.get('ranked_topics', [])
        score_obj.save()

        Notification.objects.create(
            user=student,
            title=f"Exam Marks Evaluated: {exam.title} 📊",
            message=f"Your question-wise marks for {exam.subject.code} have been uploaded. View your Personalised Study Order to see your highest-yield study priorities!",
            notification_type="exam"
        )

        return Response(StudentExamScoreSerializer(score_obj).data, status=status.HTTP_200_OK)


class AIRoadmapView(APIView):
    """
    Legacy roadmap view maintained for compatibility.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response({"detail": "Roadmaps have been upgraded to Personalised Study Order."}, status=status.HTTP_200_OK)


class StudentListView(APIView):
    """
    Returns list of enrolled students for faculty / admin mark entry.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['faculty', 'admin']:
            return Response({"detail": "Permission denied. Only faculty or admin can list students."}, status=status.HTTP_403_FORBIDDEN)

        semester = request.GET.get('semester')
        queryset = User.objects.filter(role='student').order_by('name', 'roll_number')
        if semester:
            try:
                queryset = queryset.filter(semester=int(semester))
            except ValueError:
                pass
        return Response(UserSerializer(queryset, many=True).data)



class ResourceListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        subject_code = request.GET.get('subject', '').strip()
        res_type = request.GET.get('type', '').strip()
        query = request.GET.get('q', '').strip().lower()

        # 1. Genuine uploaded resources with actual files
        res_qs = Resource.objects.exclude(file_url='').select_related('subject')
        serialized_resources = ResourceSerializer(res_qs, many=True).data

        # 2. Genuine Exam Question Papers and Answer Keys uploaded by faculty
        exam_qs = Exam.objects.all().select_related('subject')
        exam_resources = []
        for e in exam_qs:
            # Question paper PDF
            if e.question_paper_pdf:
                paper_set_str = f" ({e.paper_set})" if e.paper_set and e.paper_set not in e.title else ""
                exam_resources.append({
                    "id": f"exam-qp-{e.id}",
                    "title": f"{e.title}{paper_set_str} — Question Paper",
                    "subject": e.subject.id,
                    "subject_code": e.subject.code,
                    "subject_name": e.subject.name,
                    "resource_type": "paper",
                    "semester": e.semester,
                    "description": f"Official {e.exam_type}{paper_set_str} question paper for {e.subject.name} ({e.subject.code}). Total: {e.total_marks} Marks. Exam Date: {e.exam_date}.",
                    "file_url": e.question_paper_pdf,
                    "download_count": 28,
                    "created_at": e.created_at.isoformat() if e.created_at else timezone.now().isoformat()
                })

            # Answer key PDF
            if e.answer_key_pdf:
                paper_set_str = f" ({e.paper_set})" if e.paper_set and e.paper_set not in e.title else ""
                exam_resources.append({
                    "id": f"exam-ak-{e.id}",
                    "title": f"{e.title}{paper_set_str} — Model Solutions & Answer Key",
                    "subject": e.subject.id,
                    "subject_code": e.subject.code,
                    "subject_name": e.subject.name,
                    "resource_type": "key",
                    "semester": e.semester,
                    "description": f"Official faculty answer key and step-by-step solutions for {e.subject.name} - {e.title}{paper_set_str}.",
                    "file_url": e.answer_key_pdf,
                    "download_count": 19,
                    "created_at": e.created_at.isoformat() if e.created_at else timezone.now().isoformat()
                })

        combined = list(serialized_resources) + exam_resources

        # 3. Apply filters
        if subject_code:
            combined = [r for r in combined if r.get('subject_code') == subject_code]
        if res_type:
            combined = [r for r in combined if r.get('resource_type') == res_type]
        if query:
            combined = [
                r for r in combined 
                if query in r.get('title', '').lower() or query in r.get('description', '').lower() or query in r.get('subject_code', '').lower()
            ]

        # Sort by creation date descending
        combined.sort(key=lambda x: x.get('created_at', ''), reverse=True)

        return Response(combined)

    def post(self, request):
        if not request.user.is_authenticated or request.user.role not in ['admin', 'faculty']:
            return Response({"detail": "Permission denied. Only faculty or admin can upload resources."}, status=status.HTTP_403_FORBIDDEN)

        serializer = ResourceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PersonalNoteListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        notes = PersonalNote.objects.filter(user=request.user)
        subject_code = request.GET.get('subject', '').strip()
        query = request.GET.get('q', '').strip().lower()

        if subject_code:
            notes = notes.filter(Q(subject_code__iexact=subject_code) | Q(subject__code__iexact=subject_code))
        if query:
            notes = notes.filter(
                Q(title__icontains=query) |
                Q(topic__icontains=query) |
                Q(summary__icontains=query) |
                Q(content__icontains=query) |
                Q(subject_code__icontains=query)
            )

        serializer = PersonalNoteSerializer(notes, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        subject_id = data.get('subject')
        subject_code = data.get('subject_code', '').strip()

        subj = None
        if subject_id:
            subj = Subject.objects.filter(id=subject_id).first()
        elif subject_code:
            subj = Subject.objects.filter(code__iexact=subject_code).first() or Subject.objects.filter(code__icontains=subject_code).first()

        if subj:
            data['subject'] = subj.id
            if not data.get('subject_code'):
                data['subject_code'] = subj.code
            if not data.get('subject_name'):
                data['subject_name'] = subj.name

        serializer = PersonalNoteSerializer(data=data)
        if serializer.is_valid():
            note = serializer.save(user=request.user)
            return Response(PersonalNoteSerializer(note).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PersonalNoteDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        note = get_object_or_404(PersonalNote, pk=pk, user=request.user)
        if request.GET.get('download'):
            note.download_count += 1
            note.save(update_fields=['download_count'])
        return Response(PersonalNoteSerializer(note).data)

    def delete(self, request, pk):
        note = get_object_or_404(PersonalNote, pk=pk, user=request.user)
        note.delete()
        return Response({"message": "Personal study note deleted successfully."}, status=status.HTTP_200_OK)


class PrivateFileUploadView(APIView):
    """
    Handles local backend file storage for profile avatar pictures and academic PDFs.
    Files are stored directly on the local server without requiring third-party cloud services.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        uploaded_file = request.FILES.get('file')
        upload_type = request.data.get('type', 'general')  # 'avatar', 'resource', 'document'

        if not uploaded_file:
            return Response({"detail": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file size (max 25MB)
        if uploaded_file.size > 25 * 1024 * 1024:
            return Response({"detail": "File size exceeds the 25MB limit."}, status=status.HTTP_400_BAD_REQUEST)

        # Generate unique safe local filename
        ext = os.path.splitext(uploaded_file.name)[1].lower()
        allowed_extensions = ['.png', '.jpg', '.jpeg', '.webp', '.pdf', '.docx', '.txt']
        if ext not in allowed_extensions:
            return Response({"detail": f"File type '{ext}' is not supported. Supported: {', '.join(allowed_extensions)}"}, status=status.HTTP_400_BAD_REQUEST)

        filename = f"{upload_type}_{uuid.uuid4().hex[:10]}{ext}"
        folder = 'avatars' if upload_type == 'avatar' else 'resources' if upload_type == 'resource' else 'uploads'
        relative_path = os.path.join(folder, filename)

        # Save to local MEDIA_ROOT
        saved_path = default_storage.save(relative_path, ContentFile(uploaded_file.read()))
        file_url = f"{settings.MEDIA_URL}{saved_path}"

        # If it was an avatar upload, update the user profile immediately
        if upload_type == 'avatar':
            request.user.avatar = file_url
            request.user.save()

        return Response({
            "message": "File successfully stored in local backend storage.",
            "file_url": file_url,
            "filename": uploaded_file.name,
            "size": uploaded_file.size,
            "saved_as": saved_path
        }, status=status.HTTP_201_CREATED)


class StudyGoalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        goals = StudyGoal.objects.filter(user=request.user).order_by('-target_date')
        return Response(StudyGoalSerializer(goals, many=True).data)

    def post(self, request):
        data = request.data.copy()
        serializer = StudyGoalSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ToggleStudyGoalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            goal = StudyGoal.objects.get(id=pk, user=request.user)
            goal.is_completed = not goal.is_completed
            if goal.is_completed:
                goal.completed_at = timezone.now()
            else:
                goal.completed_at = None
            goal.save()
            return Response(StudyGoalSerializer(goal).data)
        except StudyGoal.DoesNotExist:
            return Response({"detail": "Study goal not found."}, status=status.HTTP_404_NOT_FOUND)


class QuizListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        subject_id = request.GET.get('subject_id')
        difficulty = request.GET.get('difficulty')
        queryset = Quiz.objects.all().order_by('-created_at')
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        return Response(QuizSerializer(queryset, many=True).data)


class QuizDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            quiz = Quiz.objects.get(id=pk)
            return Response(QuizSerializer(quiz).data)
        except Quiz.DoesNotExist:
            return Response({"detail": "Quiz not found."}, status=status.HTTP_404_NOT_FOUND)


class SubmitQuizAttemptView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            quiz = Quiz.objects.get(id=pk)
        except Quiz.DoesNotExist:
            return Response({"detail": "Quiz not found."}, status=status.HTTP_404_NOT_FOUND)

        user_answers = request.data.get('answers', [])
        time_spent = request.data.get('time_spent_seconds', 0)

        # Calculate score
        correct_count = 0
        feedback = []
        for idx, q in enumerate(quiz.questions):
            user_choice = user_answers[idx] if idx < len(user_answers) else None
            is_correct = (user_choice == q.get('correct_index'))
            if is_correct:
                correct_count += 1
            feedback.append({
                "question_index": idx,
                "question": q.get('question'),
                "user_choice": user_choice,
                "correct_index": q.get('correct_index'),
                "is_correct": is_correct,
                "explanation": q.get('explanation')
            })

        attempt = QuizAttempt.objects.create(
            user=request.user,
            quiz=quiz,
            score=correct_count,
            total_questions=len(quiz.questions),
            time_spent_seconds=time_spent,
            user_answers=user_answers
        )

        return Response({
            "attempt_id": attempt.id,
            "score": correct_count,
            "total_questions": len(quiz.questions),
            "percentage": round((correct_count / max(1, len(quiz.questions))) * 100, 1),
            "feedback": feedback
        })


class NotificationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        notifs = Notification.objects.filter(user=request.user).order_by('-created_at')[:20]
        return Response(NotificationSerializer(notifs, many=True).data)


class MarkNotificationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            notif = Notification.objects.get(id=pk, user=request.user)
            notif.is_read = True
            notif.save()
            return Response({"status": "marked as read"})
        except Notification.DoesNotExist:
            return Response({"detail": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)


class MarkAllNotificationsReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"status": "all notifications marked as read"})


class GlobalSearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.GET.get('q', '').strip()
        if not query:
            return Response({"results": []})

        resources = Resource.objects.filter(Q(title__icontains=query) | Q(description__icontains=query))[:5]
        subjects = Subject.objects.filter(Q(name__icontains=query) | Q(code__icontains=query))[:5]
        quizzes = Quiz.objects.filter(Q(title__icontains=query) | Q(topic__icontains=query))[:5]

        return Response({
            "query": query,
            "subjects": SubjectSerializer(subjects, many=True).data,
            "resources": ResourceSerializer(resources, many=True).data,
            "quizzes": QuizSerializer(quizzes, many=True).data
        })


class AdminStatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        total_students = User.objects.filter(role='student').count()
        total_faculty = User.objects.filter(role='faculty').count()
        total_subjects = Subject.objects.count()
        total_resources = Resource.objects.count()
        total_conversations = Conversation.objects.count()
        total_messages = Message.objects.count()
        total_quizzes = Quiz.objects.count()
        total_records = AcademicRecord.objects.count()

        # Department distribution
        departments = [
            'Computer Application (BCA)',
            'Computer Science & Engineering (B.Tech CSE)',
            'Information Technology (B.Tech IT)',
            'Business Administration (BBA)'
        ]
        dept_data = []
        for d in departments:
            sub_count = Subject.objects.filter(department=d).count()
            stu_count = User.objects.filter(department=d, role='student').count()
            dept_data.append({
                "department": d,
                "subjects": sub_count,
                "students": stu_count,
            })

        # Most asked doubt subjects
        top_subjects = list(
            Conversation.objects.filter(subject__isnull=False)
            .values('subject__code', 'subject__name')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )

        # Mode usage breakdown
        mode_usage = list(
            Message.objects.filter(sender='ai')
            .exclude(mode_used='')
            .values('mode_used')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Recent activities
        recent_activities = []
        recent_users = User.objects.order_by('-date_joined')[:4]
        for u in recent_users:
            recent_activities.append({
                "type": "user_registration",
                "title": f"New {u.role.title()} Account",
                "description": f"{u.name or u.email} enrolled in {u.department or 'College'}",
                "timestamp": u.date_joined.isoformat() if u.date_joined else timezone.now().isoformat()
            })

        recent_convs = Conversation.objects.select_related('subject').order_by('-created_at')[:4]
        for c in recent_convs:
            subj_title = c.subject.code if c.subject else "General Academic"
            recent_activities.append({
                "type": "doubt_resolved",
                "title": f"Doubt in {subj_title}",
                "description": c.title or "Interactive Doubt Session",
                "timestamp": c.created_at.isoformat() if c.created_at else timezone.now().isoformat()
            })

        recent_activities.sort(key=lambda x: x["timestamp"], reverse=True)

        return Response({
            "total_students": total_students,
            "total_faculty": total_faculty,
            "total_subjects": total_subjects,
            "total_resources": total_resources,
            "total_conversations": total_conversations,
            "total_messages": total_messages,
            "total_quizzes": total_quizzes,
            "total_records": total_records,
            "department_distribution": dept_data,
            "top_doubt_subjects": top_subjects,
            "mode_usage": mode_usage,
            "recent_activities": recent_activities[:6],
            "system_health": {
                "database_status": "Healthy (PostgreSQL)",
                "auth_status": "Active (Argon2 / JWT)",
                "ai_engines": ["Google Gemini", "OpenAI GPT-4o", "Local Engine"],
                "active_model": getattr(settings, 'OLLAMA_DEFAULT_MODEL', 'qwen2.5:3b')
            }
        })


class MockExamGenerateView(APIView):
    """
    AI Mock Exam Generator:
    Creates university-grade mock exam papers and quizzes modeled directly after
    the question blueprints, sections, and marking formats of papers stored in the database.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        subject_id = request.data.get('subject_id')
        subject_code = request.data.get('subject_code')
        mock_type = request.data.get('mock_type', 'quiz_30')  # 'quiz_30', 'pre_end_100', 'mcq_quiz'
        focus_unit = request.data.get('focus_unit', '')
        difficulty = request.data.get('difficulty', 'Standard')
        custom_instructions = request.data.get('custom_instructions', '')
        model_name = request.data.get('model', 'gemini-1.5-flash')
        custom_api_key = request.data.get('custom_api_key') or request.headers.get('X-Custom-Gemini-Key')

        # 1. Resolve Subject
        subject = None
        if subject_id:
            subject = Subject.objects.filter(id=subject_id).first()
        elif subject_code:
            subject = Subject.objects.filter(code__iexact=subject_code).first()

        if not subject:
            subject = Subject.objects.first()

        if not subject:
            return Response({"detail": "No valid academic subject found in database."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Invoke AI Generator
        try:
            generated_data = generate_ai_mock_exam(
                subject=subject,
                mock_type=mock_type,
                focus_unit=focus_unit,
                difficulty=difficulty,
                model_name=model_name,
                custom_api_key=custom_api_key,
                custom_instructions=custom_instructions
            )
        except Exception as e:
            logger.error(f"Error generating mock exam: {e}", exc_info=True)
            return Response({"detail": f"Failed to generate mock exam: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 3. Save Mock Exam record for the student
        save_to_db = request.data.get('save_to_db', True)
        mock_instance = None
        if save_to_db and request.user.is_authenticated:
            try:
                mock_instance = MockExam.objects.create(
                    user=request.user,
                    subject=subject,
                    title=generated_data.get('title', f"Mock Exam: {subject.name}"),
                    mock_type=mock_type,
                    source_exam_title=generated_data.get('source_exam_title', ''),
                    total_marks=generated_data.get('total_marks', 30.0),
                    time_allowed_minutes=generated_data.get('time_allowed_minutes', 60),
                    difficulty=difficulty,
                    instructions=generated_data.get('instructions', []),
                    sections=generated_data.get('sections', []),
                    questions_data=generated_data.get('questions_data', []),
                    model_used=model_name
                )

                # If this is an MCQ mock quiz, also create or link a Quiz so it shows up in Quiz Center
                if mock_type == 'mcq_quiz':
                    first_sec = generated_data.get('sections', [{}])[0]
                    mcq_questions = first_sec.get('questions', [])
                    if mcq_questions:
                        formatted_for_quiz = []
                        for q in mcq_questions:
                            formatted_for_quiz.append({
                                "question": q.get('text', ''),
                                "options": q.get('options', []),
                                "correct_index": q.get('correct_index', 0),
                                "explanation": q.get('explanation', q.get('model_answer', ''))
                            })
                        Quiz.objects.create(
                            title=generated_data.get('title', f"AI Mock Quiz: {subject.name}"),
                            subject=subject,
                            topic=focus_unit or "AI Generated Mock Quiz",
                            difficulty=difficulty if difficulty in ['Easy', 'Medium', 'Hard'] else 'Medium',
                            questions=formatted_for_quiz
                        )

                # Automatically save generated mock paper into Student's Personal Library
                try:
                    summary_text = f"Mock Exam Blueprint: {generated_data.get('source_exam_title', 'Database Pattern')} | Total Marks: {generated_data.get('total_marks', 30)} | Time: {generated_data.get('time_allowed_minutes', 60)} Mins"
                    content_markdown = f"# {generated_data.get('title', 'AI Mock Exam')}\n\n"
                    content_markdown += f"**Subject:** [{subject.code}] {subject.name}\n"
                    content_markdown += f"**Total Marks:** {generated_data.get('total_marks', 30)} Marks  |  **Time Allowed:** {generated_data.get('time_allowed_minutes', 60)} Minutes\n\n"
                    content_markdown += "## Instructions\n"
                    for inst in generated_data.get('instructions', []):
                        content_markdown += f"- {inst}\n"
                    content_markdown += "\n---\n\n"

                    for sec in generated_data.get('sections', []):
                        content_markdown += f"## {sec.get('name', 'Section')} ({sec.get('marks', '')} Marks)\n"
                        if sec.get('description'):
                            content_markdown += f"*{sec.get('description')}*\n\n"
                        for q in sec.get('questions', []):
                            content_markdown += f"### {q.get('q_no', 'Q')} [{q.get('max_marks', 1)} Marks]\n"
                            content_markdown += f"**Unit:** {q.get('unit', '')} | **Topic:** {q.get('topic', '')}\n\n"
                            content_markdown += f"{q.get('text', '')}\n\n"
                            if q.get('options'):
                                for opt_i, opt_t in enumerate(q.get('options', [])):
                                    content_markdown += f"- ({chr(65 + opt_i)}) {opt_t}\n"
                                content_markdown += f"\n**Correct Answer:** Option ({chr(65 + q.get('correct_index', 0))})\n\n"
                            if q.get('model_answer'):
                                content_markdown += f"> **Model Solution & Key Points:**\n> {q.get('model_answer')}\n\n"
                            if q.get('marking_scheme'):
                                content_markdown += "**Marking Scheme Allocation:**\n"
                                for mk in q.get('marking_scheme', []):
                                    pt_text = mk.get('point', '') if isinstance(mk, dict) else str(mk)
                                    mk_val = f" [{mk.get('marks', '')} M]" if isinstance(mk, dict) and 'marks' in mk else ""
                                    content_markdown += f"- {pt_text}{mk_val}\n"
                                content_markdown += "\n"
                            content_markdown += "\n"

                    PersonalNote.objects.create(
                        user=request.user,
                        title=generated_data.get('title', f"AI Mock Exam: {subject.name}"),
                        subject=subject,
                        subject_code=subject.code,
                        subject_name=subject.name,
                        topic=f"Mock Exam ({generated_data.get('total_marks', 30)} Marks)",
                        summary=summary_text,
                        content=content_markdown
                    )
                except Exception as p_err:
                    logger.warning(f"Could not auto-save to PersonalNote: {p_err}")
            except Exception as e:
                logger.warning(f"Could not persist MockExam to DB: {e}")

        response_payload = {
            **generated_data,
            "id": mock_instance.id if mock_instance else None,
            "subject_id": subject.id,
            "subject_code": subject.code,
            "subject_name": subject.name,
            "created_at": timezone.now().isoformat()
        }
        return Response(response_payload, status=status.HTTP_201_CREATED)


class MockExamListView(APIView):
    """
    List and retrieve previously generated mock exams.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        subject_id = request.query_params.get('subject_id')
        mock_type = request.query_params.get('mock_type')

        queryset = MockExam.objects.filter(user=request.user)
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        if mock_type:
            queryset = queryset.filter(mock_type=mock_type)

        serializer = MockExamSerializer(queryset, many=True)
        return Response(serializer.data)


class MockExamDetailView(APIView):
    """
    Retrieve or delete a single mock exam.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            mock = MockExam.objects.get(id=pk, user=request.user)
            serializer = MockExamSerializer(mock)
            return Response(serializer.data)
        except MockExam.DoesNotExist:
            return Response({"detail": "Mock exam not found."}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            mock = MockExam.objects.get(id=pk, user=request.user)
            mock.delete()
            return Response({"detail": "Mock exam deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except MockExam.DoesNotExist:
            return Response({"detail": "Mock exam not found."}, status=status.HTTP_404_NOT_FOUND)


class MockExamBlueprintsView(APIView):
    """
    Returns available subjects and their corresponding database exam blueprints.
    Allows the student/faculty to choose which real college exam format to model after.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        subjects = Subject.objects.all().order_by('code')
        results = []

        for sub in subjects:
            exams = Exam.objects.filter(subject=sub).order_by('exam_type')
            exam_formats = []
            for e in exams:
                exam_formats.append({
                    "id": e.id,
                    "title": e.title,
                    "exam_type": e.exam_type,
                    "paper_set": e.paper_set,
                    "total_marks": e.total_marks,
                    "question_count": len(e.questions_data) if e.questions_data else 0
                })

            unit_map = parse_subject_units_and_topics(sub.syllabus_overview or "")
            units = list(unit_map.keys()) if unit_map else ["Unit I", "Unit II", "Unit III", "Unit IV", "Unit V"]

            results.append({
                "subject_id": sub.id,
                "subject_code": sub.code,
                "subject_name": sub.name,
                "semester": sub.semester,
                "department": sub.department,
                "units": units,
                "database_exam_formats": exam_formats,
                "supported_mock_types": [
                    {
                        "type": "quiz_30",
                        "label": "Collegiate Quiz (30 Marks)",
                        "description": "Part A (2x5m) + Part B Q3 (6x1m) + Q4 (7m) + Q5 (7m)",
                        "time_allowed_minutes": 60,
                        "marks": 30
                    },
                    {
                        "type": "pre_end_100",
                        "label": "Pre-End Semester Examination (100 Marks)",
                        "description": "Part A Compulsory (10x4m) + Part B Units I-V Choice (5x12m)",
                        "time_allowed_minutes": 180,
                        "marks": 100
                    },
                    {
                        "type": "mcq_quiz",
                        "label": "Speed Multiple Choice Mock Quiz (20 Marks)",
                        "description": "10 High-Yield MCQs with instant scoring & in-depth explanations",
                        "time_allowed_minutes": 25,
                        "marks": 20
                    }
                ]
            })

        return Response(results)


class AdminUserManagementView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"detail": "Permission denied. Only administrators can view user records."}, status=status.HTTP_403_FORBIDDEN)
        
        role = request.GET.get('role', '').strip()
        q = request.GET.get('q', '').strip().lower()
        semester = request.GET.get('semester')

        queryset = User.objects.all().order_by('-date_joined')
        if role and role != 'all':
            queryset = queryset.filter(role=role)
        if semester:
            try:
                queryset = queryset.filter(semester=int(semester))
            except (ValueError, TypeError):
                pass
        if q:
            queryset = queryset.filter(
                Q(name__icontains=q) | 
                Q(email__icontains=q) | 
                Q(roll_number__icontains=q) | 
                Q(department__icontains=q)
            )

        return Response(UserSerializer(queryset, many=True).data)

    def post(self, request):
        if request.user.role != 'admin':
            return Response({"detail": "Permission denied. Only administrators can create users."}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        email = (data.get('email') or '').strip().lower()
        password = data.get('password')
        name = data.get('name', '').strip()
        role = data.get('role', 'student').strip()
        department = data.get('department', 'Computer Application (BCA)').strip()
        semester = data.get('semester', 5)
        section = data.get('section', 'A').strip()
        roll_number = data.get('roll_number', '').strip()
        phone = data.get('phone', '').strip()

        if not email:
            return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not phone:
            return Response({"detail": "Contact phone number is mandatory."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({"detail": f"A user with email '{email}' already exists."}, status=status.HTTP_400_BAD_REQUEST)
        if not password or len(password) < 6:
            return Response({"detail": "Password must be at least 6 characters."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            sem_int = int(semester)
        except (ValueError, TypeError):
            sem_int = 5

        user = User.objects.create_user(
            email=email,
            password=password,
            name=name,
            role=role,
            department=department,
            semester=sem_int,
            section=section,
            roll_number=roll_number,
            phone=phone
        )
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class AdminUserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        if request.user.role != 'admin':
            return Response({"detail": "Permission denied. Only administrators can update user records."}, status=status.HTTP_403_FORBIDDEN)

        user = get_object_or_404(User, pk=pk)
        data = request.data

        if 'phone' in data:
            phone_val = data['phone'].strip()
            if not phone_val:
                return Response({"detail": "Contact phone number is mandatory."}, status=status.HTTP_400_BAD_REQUEST)
            user.phone = phone_val

        if 'name' in data:
            user.name = data['name'].strip()
        if 'email' in data and data['email'].strip().lower() != user.email:
            new_email = data['email'].strip().lower()
            if User.objects.filter(email=new_email).exclude(pk=user.pk).exists():
                return Response({"detail": f"Email '{new_email}' is already in use by another user."}, status=status.HTTP_400_BAD_REQUEST)
            user.email = new_email
            user.username = new_email
        if 'role' in data:
            user.role = data['role']
        if 'department' in data:
            user.department = data['department'].strip()
        if 'semester' in data:
            try:
                user.semester = int(data['semester'])
            except (ValueError, TypeError):
                pass
        if 'section' in data:
            user.section = data['section'].strip()
        if 'roll_number' in data:
            user.roll_number = data['roll_number'].strip()
        if 'phone' in data:
            user.phone = data['phone'].strip()
        if 'bio' in data:
            user.bio = data['bio'].strip()
        
        # Optional password reset
        if 'password' in data and data['password']:
            pw = data['password'].strip()
            if len(pw) >= 6:
                user.set_password(pw)
            else:
                return Response({"detail": "Password must be at least 6 characters."}, status=status.HTTP_400_BAD_REQUEST)

        user.save()
        return Response(UserSerializer(user).data)

    def delete(self, request, pk):
        if request.user.role != 'admin':
            return Response({"detail": "Permission denied. Only administrators can delete users."}, status=status.HTTP_403_FORBIDDEN)

        user = get_object_or_404(User, pk=pk)
        if user.id == request.user.id:
            return Response({"detail": "Cannot delete your own active administrator account."}, status=status.HTTP_400_BAD_REQUEST)

        user.delete()
        return Response({"message": f"User '{user.email}' removed successfully."})


class AdminPaperFormatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        formats = ExamPaperFormat.objects.all()
        # Seed defaults if database is empty
        if not formats.exists():
            default_templates = [
                {
                    "name": "Collegiate Quiz (30 Marks)",
                    "exam_type": "quiz_30",
                    "total_marks": 30,
                    "time_allowed_minutes": 60,
                    "has_sets": True,
                    "paper_sets": ["Set A", "Set B", "Set C", "Set D", "Set E"],
                    "description": "Departmental collegiate 30-mark quiz format. Administered across multiple sets to ensure academic integrity.",
                    "sections_data": [
                        {"section_name": "Part A (Short Analytical)", "questions_count": 2, "marks_per_q": 5, "is_compulsory": True},
                        {"section_name": "Part B (Technical Descriptive)", "questions_count": 3, "marks_per_q": 7, "is_compulsory": True}
                    ]
                },
                {
                    "name": "Pre-End Semester Examination (100 Marks)",
                    "exam_type": "pre_end_100",
                    "total_marks": 100,
                    "time_allowed_minutes": 180,
                    "has_sets": False,
                    "paper_sets": [],
                    "description": "Full-syllabus pre-end university mock examination managed internally by the college. 5 unit modules with choice questions.",
                    "sections_data": [
                        {"section_name": "Part A - Compulsory Conceptual", "questions_count": 5, "marks_per_q": 6, "is_compulsory": True},
                        {"section_name": "Part B - Unit Choice Questions (Units I to V)", "questions_count": 5, "marks_per_q": 14, "is_compulsory": False}
                    ]
                }
            ]
            for t in default_templates:
                ExamPaperFormat.objects.create(**t)
            formats = ExamPaperFormat.objects.all()

        return Response(ExamPaperFormatSerializer(formats, many=True).data)

    def post(self, request):
        if request.user.role != 'admin':
            return Response({"detail": "Permission denied. Only administrators can configure paper formats."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ExamPaperFormatSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminPaperFormatDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        if request.user.role != 'admin':
            return Response({"detail": "Permission denied. Only administrators can update paper formats."}, status=status.HTTP_403_FORBIDDEN)
        fmt = get_object_or_404(ExamPaperFormat, pk=pk)
        serializer = ExamPaperFormatSerializer(fmt, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        if request.user.role != 'admin':
            return Response({"detail": "Permission denied. Only administrators can delete paper formats."}, status=status.HTTP_403_FORBIDDEN)
        fmt = get_object_or_404(ExamPaperFormat, pk=pk)
        fmt.delete()
        return Response({"message": "Paper format deleted successfully."})


class AdminDatabaseTablesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"detail": "Permission denied. Only administrators can view database schema."}, status=status.HTTP_403_FORBIDDEN)

        from django.apps import apps
        from django.db import connection

        model_by_table = {m._meta.db_table: m for m in apps.get_models()}
        all_table_names = sorted(connection.introspection.table_names())

        tables_data = []
        total_records_sum = 0

        for t_name in all_table_names:
            model = model_by_table.get(t_name)
            if model:
                try:
                    row_count = model.objects.count()
                except Exception:
                    row_count = 0

                fields_info = []
                for f in model._meta.fields:
                    fields_info.append({
                        "name": f.name,
                        "verbose_name": str(f.verbose_name).title(),
                        "type": f.get_internal_type(),
                        "primary_key": f.primary_key,
                        "nullable": f.null,
                    })

                app_label = model._meta.app_label
                if app_label == 'api':
                    category = "Application Core"
                elif app_label in ['auth', 'sessions']:
                    category = "Authentication & Access"
                else:
                    category = "Django Framework"

                tables_data.append({
                    "table_name": t_name,
                    "model_name": model.__name__,
                    "app_label": app_label,
                    "category": category,
                    "verbose_name": str(model._meta.verbose_name).title(),
                    "row_count": row_count,
                    "columns_count": len(fields_info),
                    "columns": fields_info,
                    "is_model": True
                })
                total_records_sum += row_count
            else:
                row_count = 0
                fields_info = []
                try:
                    with connection.cursor() as cursor:
                        cursor.execute(f'SELECT COUNT(*) FROM "{t_name}"')
                        row_count = cursor.fetchone()[0]
                        table_desc = connection.introspection.get_table_description(cursor, t_name)
                        for col in table_desc:
                            fields_info.append({
                                "name": col.name,
                                "verbose_name": col.name.replace('_', ' ').title(),
                                "type": "RawColumn",
                                "primary_key": False,
                                "nullable": True,
                            })
                except Exception as e:
                    logger.warning("Error introspecting raw table %s: %s", t_name, e)

                tables_data.append({
                    "table_name": t_name,
                    "model_name": t_name.replace('api_', '').replace('_', ' ').title(),
                    "app_label": "database",
                    "category": "System / Internal",
                    "verbose_name": t_name,
                    "row_count": row_count,
                    "columns_count": len(fields_info),
                    "columns": fields_info,
                    "is_model": False
                })
                total_records_sum += row_count

        db_settings = settings.DATABASES.get('default', {})
        db_name = db_settings.get('NAME', 'ai_doubt_platform')
        db_engine = db_settings.get('ENGINE', '').split('.')[-1].upper() or 'POSTGRESQL'

        return Response({
            "database": db_name,
            "engine": db_engine,
            "total_tables": len(tables_data),
            "total_records": total_records_sum,
            "tables": tables_data
        })


class AdminDatabaseRecordsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, table_name):
        if request.user.role != 'admin':
            return Response({"detail": "Permission denied. Only administrators can view database records."}, status=status.HTTP_403_FORBIDDEN)

        from django.apps import apps
        from django.db import connection, models
        import datetime, uuid

        model_by_table = {m._meta.db_table: m for m in apps.get_models()}
        all_tables = connection.introspection.table_names()

        if table_name not in all_tables:
            return Response({"detail": f"Table '{table_name}' does not exist in database."}, status=status.HTTP_404_NOT_FOUND)

        search = request.query_params.get('search', '').strip()
        try:
            limit = min(max(int(request.query_params.get('limit', 50)), 1), 200)
        except ValueError:
            limit = 50
        try:
            offset = max(int(request.query_params.get('offset', 0)), 0)
        except ValueError:
            offset = 0

        model = model_by_table.get(table_name)

        def serialize_val(val, field_name=''):
            if field_name == 'password':
                return '••••••••'
            if val is None:
                return None
            if isinstance(val, (datetime.datetime, datetime.date, datetime.time)):
                return val.isoformat()
            if isinstance(val, uuid.UUID):
                return str(val)
            if hasattr(val, 'url'):
                try:
                    return val.url
                except Exception:
                    return str(val)
            if isinstance(val, (dict, list, int, float, bool, str)):
                return val
            return str(val)

        if model:
            columns = []
            text_fields = []
            int_fields = []
            for f in model._meta.fields:
                itype = f.get_internal_type()
                columns.append({
                    "name": f.name,
                    "verbose_name": str(f.verbose_name).title(),
                    "type": itype,
                    "primary_key": f.primary_key,
                    "nullable": f.null,
                })
                if itype in ['CharField', 'TextField', 'EmailField', 'SlugField']:
                    text_fields.append(f.name)
                elif itype in ['IntegerField', 'BigIntegerField', 'AutoField', 'BigAutoField', 'PositiveIntegerField']:
                    int_fields.append(f.name)

            queryset = model.objects.all()
            total_count = queryset.count()

            if search:
                q_obj = Q()
                for tf in text_fields:
                    q_obj |= Q(**{f"{tf}__icontains": search})
                if search.isdigit():
                    for nf in int_fields:
                        q_obj |= Q(**{f"{nf}": int(search)})
                queryset = queryset.filter(q_obj)

            filtered_count = queryset.count()

            try:
                pk_name = model._meta.pk.name
                queryset = queryset.order_by(f"-{pk_name}")
            except Exception:
                pass

            page_objs = queryset[offset:offset + limit]
            rows = []
            for obj in page_objs:
                row_dict = {}
                for col in columns:
                    fname = col['name']
                    raw_val = getattr(obj, fname, None)
                    row_dict[fname] = serialize_val(raw_val, fname)
                rows.append(row_dict)

            return Response({
                "table_name": table_name,
                "model_name": model.__name__,
                "app_label": model._meta.app_label,
                "total_records": total_count,
                "filtered_records": filtered_count,
                "limit": limit,
                "offset": offset,
                "columns": columns,
                "records": rows
            })
        else:
            with connection.cursor() as cursor:
                cursor.execute(f'SELECT COUNT(*) FROM "{table_name}"')
                total_count = cursor.fetchone()[0]

                table_desc = connection.introspection.get_table_description(cursor, table_name)
                cols = [col.name for col in table_desc]
                columns = [{"name": c, "verbose_name": c.replace('_', ' ').title(), "type": "RawColumn", "primary_key": False, "nullable": True} for c in cols]

                where_sql = ""
                params = []
                if search:
                    clauses = [f'"{c}"::text ILIKE %s' for c in cols]
                    where_sql = " WHERE " + " OR ".join(clauses)
                    params = [f"%{search}%"] * len(cols)

                count_sql = f'SELECT COUNT(*) FROM "{table_name}"' + where_sql
                cursor.execute(count_sql, params)
                filtered_count = cursor.fetchone()[0]

                query_sql = f'SELECT * FROM "{table_name}"' + where_sql + " LIMIT %s OFFSET %s"
                cursor.execute(query_sql, params + [limit, offset])
                raw_rows = cursor.fetchall()

                records = []
                for row_tuple in raw_rows:
                    record_dict = {}
                    for idx, val in enumerate(row_tuple):
                        col_name = cols[idx]
                        record_dict[col_name] = serialize_val(val, col_name)
                    records.append(record_dict)

                return Response({
                    "table_name": table_name,
                    "model_name": table_name,
                    "app_label": "database",
                    "total_records": total_count,
                    "filtered_records": filtered_count,
                    "limit": limit,
                    "offset": offset,
                    "columns": columns,
                    "records": records
                })

