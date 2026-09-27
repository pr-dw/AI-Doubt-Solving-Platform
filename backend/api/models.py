import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        extra_fields.setdefault('username', email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('faculty', 'Faculty'),
        ('admin', 'Administrator'),
    )

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    department = models.CharField(max_length=150, default='Computer Application (BCA)')
    semester = models.IntegerField(default=5)
    section = models.CharField(max_length=10, default='A')
    roll_number = models.CharField(max_length=50, blank=True)
    streak_count = models.IntegerField(default=1)
    longest_streak = models.IntegerField(default=1)
    last_active_date = models.DateField(default=timezone.now)
    avatar = models.CharField(max_length=500, blank=True)
    bio = models.TextField(blank=True, default='Passionate learner solving academic doubts with AI.')

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"


class Subject(models.Model):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    department = models.CharField(max_length=150, default='Computer Application (BCA)')
    semester = models.IntegerField(default=5)
    weak_topics = models.JSONField(default=list, blank=True)
    recommended_topics = models.JSONField(default=list, blank=True)
    syllabus_overview = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default='BookOpen')

    def __str__(self):
        return f"{self.code} - {self.name}"


class AcademicRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='academic_records')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='records')
    semester = models.IntegerField(default=5)
    exam_type = models.CharField(max_length=100, default='Internal Assessment')
    marks_obtained = models.FloatField(default=0.0)
    max_marks = models.FloatField(default=100.0)
    grade = models.CharField(max_length=5, default='A')
    performance_score = models.FloatField(default=0.0)  # percentage
    exam_date = models.DateField(default=timezone.now)

    def save(self, *args, **kwargs):
        if self.max_marks > 0:
            self.performance_score = round((self.marks_obtained / self.max_marks) * 100, 1)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email} - {self.subject.code} ({self.marks_obtained}/{self.max_marks})"


class Resource(models.Model):
    RESOURCE_TYPES = (
        ('notes', 'Lecture Notes'),
        ('paper', 'Previous Year Paper'),
        ('key', 'Answer Key'),
        ('reference', 'Reference Material'),
    )

    title = models.CharField(max_length=255)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='resources')
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPES, default='notes')
    semester = models.IntegerField(default=5)
    description = models.TextField(blank=True)
    file_url = models.TextField(blank=True)
    download_count = models.IntegerField(default=0)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.get_resource_type_display()}] {self.title}"


class Conversation(models.Model):
    MODE_CHOICES = (
        ('detailed', 'Detailed Explanation'),
        ('assist', 'Assist Mode'),
        ('eli5', "Explain Like I'm 5"),
        ('step_by_step', 'Step-by-Step Solutions'),
        ('code', 'Code Explanation'),
        ('formula', 'Formula Explanation'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations')
    title = models.CharField(max_length=255, default='New Doubt Session')
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True)
    mode = models.CharField(max_length=30, choices=MODE_CHOICES, default='detailed')
    is_bookmarked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email}: {self.title} ({self.mode})"


class Message(models.Model):
    SENDER_CHOICES = (
        ('user', 'Student'),
        ('ai', 'AI Assistant'),
    )

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    message_text = models.TextField()
    mode_used = models.CharField(max_length=30, blank=True)
    model_used = models.CharField(max_length=100, default='qwen2.5:latest')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} @ {self.timestamp}: {self.message_text[:40]}"


class StudyGoal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_goals')
    title = models.CharField(max_length=255)
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True)
    target_date = models.DateField(default=timezone.now)
    duration_minutes = models.IntegerField(default=45)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} Goal: {self.title} (Done: {self.is_completed})"


class Quiz(models.Model):
    DIFFICULTY_CHOICES = (
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    )

    title = models.CharField(max_length=255)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='quizzes')
    topic = models.CharField(max_length=200, default='General Subject Concepts')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='Medium')
    questions = models.JSONField(default=list)  # [{question, options: [], correct_index: int, explanation: str}]
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.difficulty}] {self.title} - {self.subject.code}"


class QuizAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    score = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=5)
    time_spent_seconds = models.IntegerField(default=0)
    user_answers = models.JSONField(default=list)
    attempted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.quiz.title}: {self.score}/{self.total_questions}"


class Notification(models.Model):
    TYPE_CHOICES = (
        ('exam', 'Exam Alert'),
        ('note', 'New Study Material'),
        ('assignment', 'Assignment Announcement'),
        ('streak', 'Study Streak Reminder'),
        ('announcement', 'Admin Announcement'),
        ('ai_tip', 'AI Recommendation'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='announcement')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.notification_type}] {self.title} for {self.user.email}"


class Roadmap(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='roadmaps', null=True, blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='roadmaps')
    title = models.CharField(max_length=255)
    overview = models.TextField()
    milestones = models.JSONField(default=list)  # [{step: 1, title: str, description: str, estimated_hours: int, status: str}]
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Roadmap: {self.title} ({self.subject.code})"
