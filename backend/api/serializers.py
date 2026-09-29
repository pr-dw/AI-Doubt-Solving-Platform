from rest_framework import serializers
from .models import (
    User, Subject, AcademicRecord, Resource, PersonalNote,
    Conversation, Message, StudyGoal, Quiz,
    QuizAttempt, Notification, Roadmap,
    Exam, StudentExamScore, MockExam, ExamPaperFormat
)

class UserSerializer(serializers.ModelSerializer):
    last_active_date = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'phone', 'role',
            'department', 'semester', 'section', 'roll_number',
            'streak_count', 'longest_streak', 'last_active_date',
            'avatar', 'bio', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined']

    def get_last_active_date(self, obj):
        val = getattr(obj, 'last_active_date', None)
        if not val:
            return None
        if hasattr(val, 'date'):
            return str(val.date())
        return str(val)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['email', 'password', 'name', 'department', 'semester', 'section', 'roll_number', 'phone']

    def validate_email(self, value):
        # Academic email validation
        if not value:
            raise serializers.ValidationError("Email is required.")
        return value.lower()

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'


class AcademicRecordSerializer(serializers.ModelSerializer):
    subject_details = SubjectSerializer(source='subject', read_only=True)

    class Meta:
        model = AcademicRecord
        fields = '__all__'


class ResourceSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)

    class Meta:
        model = Resource
        fields = '__all__'


class PersonalNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalNote
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'


class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)

    class Meta:
        model = Conversation
        fields = '__all__'


class StudyGoalSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)

    class Meta:
        model = StudyGoal
        fields = '__all__'


class QuizSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)

    class Meta:
        model = Quiz
        fields = '__all__'


class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    subject_code = serializers.CharField(source='quiz.subject.code', read_only=True)

    class Meta:
        model = QuizAttempt
        fields = '__all__'


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


class RoadmapSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)

    class Meta:
        model = Roadmap
        fields = '__all__'


class ExamSerializer(serializers.ModelSerializer):
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.name', read_only=True)

    class Meta:
        model = Exam
        fields = '__all__'


class StudentExamScoreSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_email = serializers.EmailField(source='student.email', read_only=True)
    student_roll = serializers.CharField(source='student.roll_number', read_only=True)
    exam_title = serializers.CharField(source='exam.title', read_only=True)
    exam_type = serializers.CharField(source='exam.exam_type', read_only=True)
    subject_code = serializers.CharField(source='exam.subject.code', read_only=True)
    subject_name = serializers.CharField(source='exam.subject.name', read_only=True)
    total_max_marks = serializers.FloatField(source='exam.total_marks', read_only=True)

    class Meta:
        model = StudentExamScore
        fields = '__all__'


class MockExamSerializer(serializers.ModelSerializer):
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)

    class Meta:
        model = MockExam
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')


class ExamPaperFormatSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamPaperFormat
        fields = '__all__'



