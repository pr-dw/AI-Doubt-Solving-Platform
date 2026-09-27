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
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    User, Subject, AcademicRecord, Resource,
    Conversation, Message, StudyGoal, Quiz,
    QuizAttempt, Notification, Roadmap,
    Exam, StudentExamScore
)
from .serializers import (
    UserSerializer, RegisterSerializer, SubjectSerializer,
    AcademicRecordSerializer, ResourceSerializer,
    ConversationSerializer, MessageSerializer, StudyGoalSerializer,
    QuizSerializer, QuizAttemptSerializer, NotificationSerializer,
    RoadmapSerializer, ExamSerializer, StudentExamScoreSerializer
)
from .ai_service import (
    call_ai_engine, call_ollama, generate_roadmap_content,
    AVAILABLE_MODELS, compute_personalized_study_order, extract_text_from_pdf_file,
    generate_standard_exam_pdf_filename, analyze_question_paper_with_ai
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
                message="Your account is active. Start asking doubts in 6 explanation modes, generate roadmaps, and track study streaks.",
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
        if not semester and user.is_authenticated and hasattr(user, 'semester') and user.semester:
            semester = user.semester

        if semester:
            try:
                sem_int = int(semester)
                subjects = Subject.objects.filter(semester=sem_int).order_by('code')
                if not subjects.exists():
                    subjects = Subject.objects.all().order_by('code')
            except (ValueError, TypeError):
                subjects = Subject.objects.all().order_by('code')
        else:
            subjects = Subject.objects.all().order_by('code')

        return Response(SubjectSerializer(subjects, many=True).data)


class AcademicRecordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        records = AcademicRecord.objects.filter(user=request.user).order_by('-exam_date')
        return Response(AcademicRecordSerializer(records, many=True).data)


class AnalyticsReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        records = AcademicRecord.objects.filter(user=user)
        avg_score = records.aggregate(Avg('performance_score'))['performance_score__avg'] or 0.0
        
        # Subject wise breakdown
        subject_breakdown = []
        for r in records:
            subject_breakdown.append({
                "subject_code": r.subject.code,
                "subject_name": r.subject.name,
                "score": r.performance_score,
                "marks_obtained": r.marks_obtained,
                "max_marks": r.max_marks,
                "grade": r.grade,
                "exam_type": r.exam_type
            })

        # Strong & Weak subjects
        strong_subjects = [s['subject_name'] for s in subject_breakdown if s['score'] >= 80]
        weak_subjects = [s['subject_name'] for s in subject_breakdown if s['score'] < 70]

        total_queries = Message.objects.filter(conversation__user=user, sender='user').count()
        total_quizzes = QuizAttempt.objects.filter(user=user).count()
        avg_quiz_score = QuizAttempt.objects.filter(user=user).aggregate(Avg('score'))['score__avg'] or 0.0

        ai_recommendations = [
            f"Focus on revision for {weak_subjects[0] if weak_subjects else 'advanced concepts'} using the 'Step-by-Step' doubt mode.",
            f"Your current study streak is {user.streak_count} days! Keep completing 1 quiz or doubt daily to unlock streak milestones.",
            "Review Unit 3 and Unit 4 practice question papers in the Resource Library before midterm assessments."
        ]

        return Response({
            "student_name": user.name or user.email,
            "roll_number": user.roll_number,
            "department": user.department,
            "semester": user.semester,
            "average_score": round(avg_score, 1),
            "streak_count": user.streak_count,
            "longest_streak": user.longest_streak,
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
        if identified_code:
            matched_subject_obj = Subject.objects.filter(code__iexact=identified_code).first()

        # If not matched by code, try matching by name
        if not matched_subject_obj and ai_result.get('identified_name'):
            matched_subject_obj = Subject.objects.filter(name__icontains=ai_result['identified_name']).first()

        if matched_subject_obj:
            conversation.subject = matched_subject_obj
            # Tag subject into conversation title if not already tagged
            if not conversation.title.startswith(f"[{matched_subject_obj.code}]"):
                conversation.title = f"[{matched_subject_obj.code}] {query_text[:40]}" + ("..." if len(query_text) > 40 else "")
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

        return Response(ExamSerializer(queryset, many=True).data)

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

        exam = Exam.objects.create(
            subject=subject,
            title=title,
            semester=subject.semester,
            exam_type=exam_type,
            total_marks=float(total_marks),
            paper_set=paper_set,
            exam_date=exam_date,
            question_paper_pdf=question_paper_pdf,
            answer_key_pdf=answer_key_pdf,
            questions_data=questions_data,
            uploaded_by=user
        )

        return Response(ExamSerializer(exam).data, status=status.HTTP_201_CREATED)


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
        queryset = Resource.objects.all().order_by('-created_at')
        subject_code = request.GET.get('subject')
        res_type = request.GET.get('type')
        query = request.GET.get('q')

        if subject_code:
            queryset = queryset.filter(subject__code=subject_code)
        if res_type:
            queryset = queryset.filter(resource_type=res_type)
        if query:
            queryset = queryset.filter(Q(title__icontains=query) | Q(description__icontains=query))

        return Response(ResourceSerializer(queryset, many=True).data)

    def post(self, request):
        if not request.user.is_authenticated or request.user.role not in ['admin', 'faculty']:
            return Response({"detail": "Permission denied. Only faculty or admin can upload resources."}, status=status.HTTP_403_FORBIDDEN)

        serializer = ResourceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        total_subjects = Subject.objects.count()
        total_resources = Resource.objects.count()
        total_conversations = Conversation.objects.count()
        total_messages = Message.objects.count()
        total_quizzes = Quiz.objects.count()

        return Response({
            "total_students": total_students,
            "total_subjects": total_subjects,
            "total_resources": total_resources,
            "total_conversations": total_conversations,
            "total_messages": total_messages,
            "total_quizzes": total_quizzes,
            "ollama_model": getattr(settings, 'OLLAMA_DEFAULT_MODEL', 'qwen2.5:latest'),
            "ollama_endpoint": getattr(settings, 'OLLAMA_BASE_URL', 'http://127.0.0.1:11434')
        })
