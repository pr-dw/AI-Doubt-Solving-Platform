import json
from datetime import date, timedelta
from django.utils import timezone
from django.db.models import Avg, Count, Q
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    User, Subject, AcademicRecord, Resource,
    Conversation, Message, StudyGoal, Quiz,
    QuizAttempt, Notification, Roadmap
)
from .serializers import (
    UserSerializer, RegisterSerializer, SubjectSerializer,
    AcademicRecordSerializer, ResourceSerializer,
    ConversationSerializer, MessageSerializer, StudyGoalSerializer,
    QuizSerializer, QuizAttemptSerializer, NotificationSerializer,
    RoadmapSerializer
)
from .ai_service import call_ollama, generate_roadmap_content


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
        if 'name' in data:
            user.name = data['name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'bio' in data:
            user.bio = data['bio']
        if 'avatar' in data:
            user.avatar = data['avatar']
        if 'password' in data and data['password']:
            user.set_password(data['password'])
        user.save()
        return Response(UserSerializer(user).data)


class SubjectListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
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
        subject_id = request.data.get('subject_id')
        conversation_id = request.data.get('conversation_id')
        model = request.data.get('model', 'qwen2.5:latest')

        if not query_text:
            return Response({"detail": "Query text cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

        # Subject context
        subject_obj = None
        subject_name = None
        if subject_id:
            try:
                subject_obj = Subject.objects.get(id=subject_id)
                subject_name = subject_obj.name
            except Subject.DoesNotExist:
                pass

        # Handle conversation thread
        if conversation_id:
            try:
                conversation = Conversation.objects.get(id=conversation_id, user=user)
            except Conversation.DoesNotExist:
                conversation = Conversation.objects.create(
                    user=user,
                    title=query_text[:50] + "...",
                    mode=mode,
                    subject=subject_obj
                )
        else:
            conversation = Conversation.objects.create(
                user=user,
                title=query_text[:50] + ("..." if len(query_text) > 50 else ""),
                mode=mode,
                subject=subject_obj
            )

        # Save user message
        Message.objects.create(
            conversation=conversation,
            sender='user',
            message_text=query_text,
            mode_used=mode
        )

        # Generate AI Response
        ai_result = call_ollama(query_text, mode=mode, subject=subject_name, model=model)
        ai_response_text = ai_result['text']

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

        return Response({
            "conversation_id": conversation.id,
            "conversation_title": conversation.title,
            "user_query": query_text,
            "ai_response": ai_response_text,
            "mode": mode,
            "model_used": ai_result['model'],
            "source": ai_result.get('source', 'local'),
            "message_id": ai_message.id
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
        result = call_ollama(summary_prompt, mode='detailed', subject=subject_name)
        return Response({
            "topic": topic,
            "subject": subject_name,
            "summary": result['text'],
            "model_used": result['model']
        })


class AIRoadmapView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        subject_id = request.data.get('subject_id')
        if not subject_id:
            return Response({"detail": "subject_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            subject = Subject.objects.get(id=subject_id)
        except Subject.DoesNotExist:
            return Response({"detail": "Subject not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check existing or create
        roadmap = Roadmap.objects.filter(user=request.user, subject=subject).first()
        if not roadmap:
            milestones = generate_roadmap_content(subject.name, subject.semester)
            roadmap = Roadmap.objects.create(
                user=request.user,
                subject=subject,
                title=f"Personalized Mastery Roadmap: {subject.name}",
                overview=f"5-Step academic roadmap designed for Semester {subject.semester} students to master core theoretical concepts and ace practical viva examinations.",
                milestones=milestones
            )

        return Response(RoadmapSerializer(roadmap).data)


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
