from django.urls import path
from .views import (
    RootView, HealthCheckView, RegisterView, LoginView, UserProfileView,
    ChangePasswordView,
    SubjectListView, AcademicRecordView, AnalyticsReportView,
    AIQueryView, AIModelsView, ConversationListView, ConversationDetailView,
    ToggleBookmarkView, AISummarizeView, AIRoadmapView,
    StudyOrderView, ExamListView, ExamDetailView, ExamScoreUploadView, ExamPDFAnalyzeView,
    StudentListView,
    ResourceListView, PrivateFileUploadView, StudyGoalView, ToggleStudyGoalView,
    PersonalNoteListView, PersonalNoteDetailView,
    QuizListView, QuizDetailView, SubmitQuizAttemptView,
    NotificationListView, MarkNotificationReadView, MarkAllNotificationsReadView,
    GlobalSearchView, AdminStatsView,
    MockExamGenerateView, MockExamListView, MockExamDetailView, MockExamBlueprintsView,
    SubjectDetailView, AdminUserManagementView, AdminUserDetailView,
    AdminPaperFormatView, AdminPaperFormatDetailView,
    AdminDatabaseTablesView, AdminDatabaseRecordsView
)

urlpatterns = [
    # API Root
    path('', RootView.as_view(), name='api-root'),
    # Health check
    path('health/', HealthCheckView.as_view(), name='health-check'),

    # Authentication
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/me/', UserProfileView.as_view(), name='auth-me'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='auth-change-password'),

    # File Uploads (Local storage for avatar photos and course PDFs)
    path('upload/', PrivateFileUploadView.as_view(), name='file-upload'),

    # Subjects & Academics
    path('subjects/', SubjectListView.as_view(), name='subject-list'),
    path('subjects/<int:pk>/', SubjectDetailView.as_view(), name='subject-detail'),
    path('academic/records/', AcademicRecordView.as_view(), name='academic-records'),
    path('analytics/report/', AnalyticsReportView.as_view(), name='analytics-report'),

    # AI Doubt Solver & Assistant
    path('ai/models/', AIModelsView.as_view(), name='ai-models'),
    path('ai/query/', AIQueryView.as_view(), name='ai-query'),
    path('ai/conversations/', ConversationListView.as_view(), name='conversation-list'),
    path('ai/conversations/<int:pk>/', ConversationDetailView.as_view(), name='conversation-detail'),
    path('ai/conversations/<int:pk>/bookmark/', ToggleBookmarkView.as_view(), name='toggle-bookmark'),
    path('ai/summarize/', AISummarizeView.as_view(), name='ai-summarize'),
    path('ai/roadmap/', AIRoadmapView.as_view(), name='ai-roadmap'),

    # Personalised High-ROI Study Order & Exams
    path('study-order/', StudyOrderView.as_view(), name='study-order'),
    path('exams/', ExamListView.as_view(), name='exam-list'),
    path('exams/analyze-pdf/', ExamPDFAnalyzeView.as_view(), name='exam-pdf-analyze'),
    path('exams/<int:pk>/', ExamDetailView.as_view(), name='exam-detail'),
    path('exams/<int:pk>/scores/', ExamScoreUploadView.as_view(), name='exam-score-upload'),
    path('students/', StudentListView.as_view(), name='student-list'),

    # Resources
    path('resources/', ResourceListView.as_view(), name='resource-list'),
    path('personal-notes/', PersonalNoteListView.as_view(), name='personal-note-list'),
    path('personal-notes/<int:pk>/', PersonalNoteDetailView.as_view(), name='personal-note-detail'),

    # Study Planner & Goals
    path('study/goals/', StudyGoalView.as_view(), name='study-goals'),
    path('study/goals/<int:pk>/toggle/', ToggleStudyGoalView.as_view(), name='toggle-study-goal'),

    # Quizzes
    path('quizzes/', QuizListView.as_view(), name='quiz-list'),
    path('quizzes/<int:pk>/', QuizDetailView.as_view(), name='quiz-detail'),
    path('quizzes/<int:pk>/submit/', SubmitQuizAttemptView.as_view(), name='submit-quiz-attempt'),

    # Notifications
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/read-all/', MarkAllNotificationsReadView.as_view(), name='mark-all-notifications-read'),
    path('notifications/<int:pk>/read/', MarkNotificationReadView.as_view(), name='mark-notification-read'),

    # Search & Admin Management
    path('search/', GlobalSearchView.as_view(), name='global-search'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/users/', AdminUserManagementView.as_view(), name='admin-users'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/paper-formats/', AdminPaperFormatView.as_view(), name='admin-paper-formats'),
    path('admin/paper-formats/<int:pk>/', AdminPaperFormatDetailView.as_view(), name='admin-paper-format-detail'),
    path('admin/database/tables/', AdminDatabaseTablesView.as_view(), name='admin-database-tables'),
    path('admin/database/tables/<str:table_name>/records/', AdminDatabaseRecordsView.as_view(), name='admin-database-records'),

    # AI Mock Exams & Question Papers
    path('mock-exams/generate/', MockExamGenerateView.as_view(), name='mock-exam-generate'),
    path('mock-exams/blueprints/', MockExamBlueprintsView.as_view(), name='mock-exam-blueprints'),
    path('mock-exams/', MockExamListView.as_view(), name='mock-exam-list'),
    path('mock-exams/<int:pk>/', MockExamDetailView.as_view(), name='mock-exam-detail'),
]

