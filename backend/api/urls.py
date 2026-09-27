from django.urls import path
from .views import (
    RootView, HealthCheckView, RegisterView, LoginView, UserProfileView,
    ChangePasswordView,
    SubjectListView, AcademicRecordView, AnalyticsReportView,
    AIQueryView, AIModelsView, ConversationListView, ConversationDetailView,
    ToggleBookmarkView, AISummarizeView, AIRoadmapView,
    ResourceListView, PrivateFileUploadView, StudyGoalView, ToggleStudyGoalView,
    QuizListView, QuizDetailView, SubmitQuizAttemptView,
    NotificationListView, MarkNotificationReadView,
    GlobalSearchView, AdminStatsView
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

    # Resources
    path('resources/', ResourceListView.as_view(), name='resource-list'),

    # Study Planner & Goals
    path('study/goals/', StudyGoalView.as_view(), name='study-goals'),
    path('study/goals/<int:pk>/toggle/', ToggleStudyGoalView.as_view(), name='toggle-study-goal'),

    # Quizzes
    path('quizzes/', QuizListView.as_view(), name='quiz-list'),
    path('quizzes/<int:pk>/', QuizDetailView.as_view(), name='quiz-detail'),
    path('quizzes/<int:pk>/submit/', SubmitQuizAttemptView.as_view(), name='submit-quiz-attempt'),

    # Notifications
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/read/', MarkNotificationReadView.as_view(), name='mark-notification-read'),

    # Search & Admin Stats
    path('search/', GlobalSearchView.as_view(), name='global-search'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
]
