import os
import logging
from django.conf import settings
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_ollama import ChatOllama
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI

import re

logger = logging.getLogger(__name__)


def get_semester_syllabus_context(semester=5, department=None):
    """
    Fetches the enrolled semester subjects and their associated study library resources
    (lecture notes, previous year solved papers, answer keys) to build a rich academic syllabus grounding context.
    """
    try:
        from api.models import Subject, Resource
        qs = Subject.objects.filter(semester=semester)
        if department:
            dept_qs = qs.filter(department__icontains=department)
            if dept_qs.exists():
                qs = dept_qs
        if not qs.exists():
            qs = Subject.objects.all()

        curriculum_blocks = []
        subjects_list = list(qs)
        for s in subjects_list:
            resources = Resource.objects.filter(subject=s)
            res_list = []
            for r in resources:
                res_list.append(f"  * [{r.get_resource_type_display()}] {r.title}: {r.description}")
            res_str = "\n".join(res_list) if res_list else "  * Standard college reference textbook & unit notes"

            block = (
                f"- SUBJECT: [{s.code}] {s.name} (Semester {s.semester})\n"
                f"  Syllabus Overview: {s.syllabus_overview or 'Core departmental subject'}\n"
                f"  Syllabus Units & Topics: {', '.join(s.recommended_topics) if s.recommended_topics else 'Comprehensive unit curriculum'}\n"
                f"  Library Resources & Reference Materials:\n{res_str}"
            )
            curriculum_blocks.append(block)

        return "\n\n".join(curriculum_blocks), subjects_list
    except Exception as e:
        logger.warning(f"Could not build semester syllabus context: {e}")
        return "", []


SYSTEM_PROMPTS = {
    'detailed': (
        "You are an expert collegiate professor and academic doubt solver on the AI Doubt Solving Platform. "
        "Provide a comprehensive, in-depth academic explanation. Define core principles, theoretical foundations, "
        "architectural concepts, practical use-cases, and key takeaways. Use clear Markdown headings, bullet points, "
        "and structured sections."
    ),
    'assist': (
        "You are a collaborative Socratic teaching assistant. Do not just hand over the raw solution immediately! "
        "Break the problem down, explain the key intuition, provide 2-3 guided hints, ask a checkpoint question to "
        "help the student think critically, and outline the pathway to the solution."
    ),
    'eli5': (
        "You are a friendly, encouraging mentor who explains complex academic and technical concepts using simple, "
        "everyday real-world analogies (Explain Like I'm 5). Avoid dense jargon, use relatable metaphors, "
        "and summarize the concept in simple, memorable bullet points."
    ),
    'step_by_step': (
        "You are a methodical academic tutor. Deliver a rigorous, step-by-step solution to this problem or doubt. "
        "Structure your response as:\n"
        "1. Problem Statement Analysis\n"
        "2. Given Data & Prerequisites\n"
        "3. Step-by-Step Calculation or Logical Derivation (Step 1, Step 2, Step 3...)\n"
        "4. Verification / Sanity Check\n"
        "5. Final Conclusion & Summary"
    ),
    'code': (
        "You are a Senior Software Engineer and Computer Science educator. Provide clear, production-quality code "
        "solutions with detailed line-by-line explanations. Include:\n"
        "- Well-commented code block in the appropriate language (Python, C++, Java, JS, etc.)\n"
        "- Algorithm explanation & Intuition\n"
        "- Time Complexity & Space Complexity analysis (Big-O notation)\n"
        "- Edge Cases considered (e.g. empty inputs, boundaries)"
    ),
    'formula': (
        "You are a Mathematics and Engineering professor. Focus on mathematical rigor and clarity. Provide:\n"
        "- Core Formula in LaTeX / mathematical syntax (e.g. $$ E = mc^2 $$)\n"
        "- Symbol breakdown (defining every variable and constant with units)\n"
        "- Derivation or conceptual origin\n"
        "- Solved numerical example demonstrating how to plug in values\n"
        "- Practical engineering or scientific application"
    )
}

AVAILABLE_MODELS = [
    {
        "id": "gemini-1.5-flash",
        "name": "Google Gemini 1.5 Flash",
        "provider": "Google DeepMind",
        "badge": "Fast Cloud",
        "type": "cloud"
    },
    {
        "id": "gemini-1.5-pro",
        "name": "Google Gemini 1.5 Pro",
        "provider": "Google DeepMind",
        "badge": "Reasoning Cloud",
        "type": "cloud"
    },
    {
        "id": "ollama:qwen",
        "name": "Ollama Qwen 2.5",
        "provider": "Alibaba / Local",
        "badge": "On-Device",
        "type": "local"
    },
    {
        "id": "ollama:gemma",
        "name": "Ollama Gemma 2",
        "provider": "Google / Local",
        "badge": "On-Device",
        "type": "local"
    },
    {
        "id": "gpt-4o-mini",
        "name": "OpenAI ChatGPT-4o Mini",
        "provider": "OpenAI",
        "badge": "Cloud",
        "type": "cloud"
    }
]

def get_langchain_model(model_name: str, custom_api_key: str = None):
    """
    Factory function resolving model identifier to an initialized LangChain ChatModel.
    Supports Google Gemini, Ollama Qwen, Ollama Gemma, and OpenAI ChatGPT.
    """
    model_str = (model_name or "").lower().strip()
    ollama_base = getattr(settings, 'OLLAMA_BASE_URL', 'http://127.0.0.1:11434')

    # 1. Google Gemini Models (e.g. gemini-1.5-flash, gemini-1.5-pro, gemini)
    if 'gemini' in model_str:
        gemini_key = custom_api_key or getattr(settings, 'GEMINI_API_KEY', '') or os.environ.get('GEMINI_API_KEY', '') or os.environ.get('GOOGLE_API_KEY', '')
        if not gemini_key:
            raise RuntimeError(
                "AI engine not communicable: Google Gemini API key is missing. "
                "Please configure GEMINI_API_KEY in backend/.env to use Gemini models."
            )
        resolved_name = model_name if model_name in ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'] else 'gemini-1.5-flash'
        return ChatGoogleGenerativeAI(
            model=resolved_name,
            google_api_key=gemini_key,
            temperature=0.4
        ), f"Gemini ({resolved_name})"

    # 2. Ollama Gemma Model
    elif 'gemma' in model_str:
        resolved_tag = "gemma2:latest"
        return ChatOllama(
            model=resolved_tag,
            base_url=ollama_base,
            temperature=0.4
        ), f"Ollama ({resolved_tag})"

    # 3. Ollama Qwen Model
    elif 'qwen' in model_str:
        resolved_tag = getattr(settings, 'OLLAMA_QWEN_MODEL', os.environ.get('OLLAMA_QWEN_MODEL', 'qwen2.5:3b'))
        return ChatOllama(
            model=resolved_tag,
            base_url=ollama_base,
            temperature=0.4
        ), f"Ollama ({resolved_tag})"

    # 4. OpenAI ChatGPT Models (e.g. gpt-4o-mini, gpt-4o, chatgpt)
    elif 'gpt' in model_str or 'chatgpt' in model_str or 'openai' in model_str:
        openai_key = custom_api_key or getattr(settings, 'OPENAI_API_KEY', '') or os.environ.get('OPENAI_API_KEY', '')
        if not openai_key:
            raise RuntimeError(
                "AI engine not communicable: OpenAI API key is missing. "
                "Please configure OPENAI_API_KEY in backend/.env to use ChatGPT models."
            )
        resolved_name = model_name if 'gpt' in model_name else 'gpt-4o-mini'
        return ChatOpenAI(
            model=resolved_name,
            api_key=openai_key,
            temperature=0.4
        ), f"OpenAI ({resolved_name})"

    # Default fallback: Ollama Qwen
    else:
        resolved_tag = model_name or "qwen2.5:latest"
        return ChatOllama(
            model=resolved_tag,
            base_url=ollama_base,
            temperature=0.4
        ), f"Ollama ({resolved_tag})"


def call_ai_engine(prompt, mode='detailed', semester=5, department=None, subject=None, model='gemini-1.5-flash', custom_api_key=None):
    """
    Executes reasoning pipeline using LangChain.
    Selects between Google Gemini, Ollama Qwen, Ollama Gemma, or OpenAI ChatGPT.
    Automatically retrieves the student's enrolled semester syllabus and library resources
    to ground the answer and identify the relevant subject.
    Raises RuntimeError if the selected provider or service is unreachable.
    """
    llm, resolved_model_label = get_langchain_model(model, custom_api_key=custom_api_key)

    curriculum_context = ""
    subjects_list = []
    if semester:
        curriculum_context, subjects_list = get_semester_syllabus_context(semester=semester, department=department)

    system_instruction = SYSTEM_PROMPTS.get(mode, SYSTEM_PROMPTS['detailed'])

    if curriculum_context:
        system_instruction += (
            f"\n\n======================================================\n"
            f"STUDENT ENROLLED CURRICULUM (SEMESTER {semester}):\n"
            f"The student is enrolled in Semester {semester} with the following subjects, syllabus overviews, and study library resources:\n\n"
            f"{curriculum_context}\n"
            f"======================================================\n"
            f"MANDATORY INSTRUCTIONS FOR AUTOMATIC SUBJECT IDENTIFICATION & SYLLABUS GROUNDING:\n"
            f"1. Cross-examine the student's question against the syllabus units, topics, and library study resources of the enrolled Semester {semester} subjects listed above.\n"
            f"2. Automatically determine which enrolled subject code and title this question belongs to.\n"
            f"3. On the VERY FIRST LINE of your response, output ONLY this metadata tag:\n"
            f"   [SUBJECT_MATCH: <Subject Code> | <Subject Name> | <Specific Topic or Unit>]\n"
            f"4. Do NOT output any boilerplate metadata headers, curriculum alignment intro blocks, or repetitive intros. Provide your academic answer directly, grounded in the subject's curriculum.\n"
            f"5. Answer thoroughly according to the '{mode}' explanation mode.\n"
        )
    elif subject:
        system_instruction += f"\nAcademic Subject Context: {subject}."

    messages = [
        SystemMessage(content=system_instruction),
        HumanMessage(content=prompt)
    ]

    try:
        response = llm.invoke(messages)
    except Exception as e:
        err_str = str(e)
        if "Connection refused" in err_str or "Failed to establish a new connection" in err_str:
            raise RuntimeError(
                f"AI engine not communicable: Unable to connect to local Ollama service at http://127.0.0.1:11434. "
                "Please ensure the Ollama service is running on the server."
            )
        elif "API_KEY_INVALID" in err_str or "Invalid API key" in err_str or "401" in err_str:
            raise RuntimeError(
                f"AI engine not communicable: Invalid API key for {resolved_model_label}. Please check your credentials."
            )
        elif "RESOURCE_EXHAUSTED" in err_str or "429" in err_str:
            raise RuntimeError(
                f"AI engine not communicable: Rate limit or quota exceeded for {resolved_model_label}. Please try again shortly."
            )
        else:
            raise RuntimeError(f"AI engine not communicable: {err_str}")

    # Extract text from LangChain response
    response_text = response.content if hasattr(response, 'content') else str(response)
    if isinstance(response_text, list):
        response_text = "".join([c.get('text', '') if isinstance(c, dict) else str(c) for c in response_text])
    
    response_text = response_text.strip()
    if not response_text:
        raise RuntimeError(f"AI engine ({resolved_model_label}) returned an empty response.")

    # Parse identified subject metadata
    identified_code = None
    identified_name = None
    identified_topic = None

    match = re.search(r'\[SUBJECT_MATCH:\s*([^\|\]]+)\|\s*([^\|\]]+)(?:\|\s*([^\]]+))?\]', response_text)
    if match:
        identified_code = match.group(1).strip()
        identified_name = match.group(2).strip()
        identified_topic = match.group(3).strip() if match.group(3) else None
        # Clean the internal tag so student only sees the clean markdown
        response_text = re.sub(r'\[SUBJECT_MATCH:[^\]]+\]\s*', '', response_text).strip()
    else:
        # Fallback: check markdown header
        hdr_match = re.search(r'###\s*#*\s*📚\s*Subject:\s*([A-Za-z0-9_-]+)(?:\s*[-|]\s*([^|\n\r]+))?(?:\s*[-|]\s*([^\n\r]+))?', response_text)
        if hdr_match:
            identified_code = hdr_match.group(1).strip()
            identified_name = hdr_match.group(2).strip() if hdr_match.group(2) else None
            identified_topic = hdr_match.group(3).strip() if hdr_match.group(3) else None

    # Clean any accidental redundant headers so the user gets a clean answer
    response_text = re.sub(r'^###\s*#*\s*📚\s*Subject:[^\n]*\n*', '', response_text).strip()
    response_text = re.sub(r'^>\s*\*\*Curriculum Alignment\*\*:[^\n]*\n*', '', response_text).strip()

    # Fallback search if code not explicitly tagged in header
    if not identified_code and subjects_list:
        for s in subjects_list:
            if s.code.lower() in response_text[:350].lower() or s.name.lower() in response_text[:350].lower():
                identified_code = s.code
                identified_name = s.name
                break

    return {
        "success": True,
        "text": response_text,
        "model": resolved_model_label,
        "identified_code": identified_code,
        "identified_name": identified_name,
        "identified_topic": identified_topic,
        "source": "langchain"
    }

# Backward compatibility alias
def call_ollama(prompt, mode='detailed', subject=None, model=None):
    return call_ai_engine(prompt, mode=mode, subject=subject, model=model or 'gemini-1.5-flash')


def generate_roadmap_content(subject_name, semester):
    """
    Legacy helper maintained for backward compatibility.
    """
    return []


def extract_text_from_pdf_file(file_path):
    """
    Extracts plain text from a local PDF file using pypdf.
    """
    try:
        from pypdf import PdfReader
        if not os.path.exists(file_path):
            return ""
        reader = PdfReader(file_path)
        text_pages = []
        for idx, page in enumerate(reader.pages):
            extracted = page.extract_text() or ""
            if extracted.strip():
                text_pages.append(f"--- Page {idx+1} ---\n{extracted.strip()}")
        return "\n\n".join(text_pages)
    except Exception as e:
        logger.error(f"Failed to extract text from PDF {file_path}: {e}")
        return ""


def generate_standard_exam_pdf_filename(subject_code, exam_type, paper_set='', is_answer_key=False):
    """
    Generates standardized, clean PDF filenames:
    e.g. NBCA-501_Quiz_1_Set_A.pdf
         NBCA-501_Quiz_2_Set_B.pdf
         NBCA-501_Pre_End_Semester_Examination.pdf
         NBCA-501_Quiz_1_Set_A_AnswerKey.pdf
    """
    clean_subj = re.sub(r'[^a-zA-Z0-9_-]', '', subject_code or 'SUBJ')
    clean_exam = re.sub(r'\s+', '_', (exam_type or 'Exam').strip())
    clean_exam = re.sub(r'[^a-zA-Z0-9_-]', '', clean_exam)
    
    set_part = ""
    if paper_set and str(paper_set).strip():
        s = re.sub(r'\s+', '_', str(paper_set).strip())
        s = re.sub(r'[^a-zA-Z0-9_-]', '', s)
        set_part = f"_{s}"
        
    suffix = "_AnswerKey" if is_answer_key else ""
    return f"{clean_subj}_{clean_exam}{set_part}{suffix}.pdf"


def parse_subject_units_and_topics(syllabus_text):
    """
    Extracts dictionary of { 'Unit I': [topics...], 'Unit II': [topics...], ... }
    from subject syllabus_overview string.
    """
    if not syllabus_text:
        return {}
    unit_map = {}
    segments = re.split(r'(Unit\s+[I|V|X]+)', syllabus_text)
    for i in range(1, len(segments), 2):
        u_name = segments[i].strip()
        u_content = segments[i+1] if i + 1 < len(segments) else ''
        # extract topics separated by commas or newlines
        lines = u_content.replace('–', ':').replace('-', ':').split(':')
        topic_body = lines[-1] if len(lines) > 1 else lines[0]
        raw_topics = [t.strip() for t in re.split(r'[,;\n]', topic_body) if t.strip() and len(t.strip()) > 2]
        if raw_topics:
            unit_map[u_name] = raw_topics
    return unit_map


def generate_syllabus_aligned_questions(subject, exam_type, paper_set=''):
    """
    Generates questions aligned with the subject's official syllabus
    following the college exam blueprint:
    - Quiz 1: Covers Units I & II (30 Marks, Part A 2x5m + Part B Q3 6x1m, Q4 7m, Q5 7m)
    - Quiz 2: Covers Units III & IV (30 Marks)
    - Quiz 3: Covers Units IV & V (30 Marks)
    - Pre-End Sem: Covers Units I-V (100 Marks, Q1 10x4m + Units I-V Choice 5x12m)
    """
    unit_map = parse_subject_units_and_topics(subject.syllabus_overview or "")
    
    def get_unit_topics(u_name, fallback_list):
        return unit_map.get(u_name, fallback_list) or fallback_list

    u1_topics = get_unit_topics("Unit I", ["Network Architecture", "OSI Reference Model", "Physical Layer Media", "Network Topologies", "Delay Analysis"])
    u2_topics = get_unit_topics("Unit II", ["Sliding Window Protocols", "ALOHA Protocols", "IEEE Standards", "Error Handling", "Data Link Layer"])
    u3_topics = get_unit_topics("Unit III", ["Routing Algorithms", "Congestion Control", "IPv4 Addressing", "IPv6 Addressing", "Point-to-Point Networks"])
    u4_topics = get_unit_topics("Unit IV", ["Transport Layer Design", "Connection Management", "Cryptography", "TCP Window Management", "Session Layer"])
    u5_topics = get_unit_topics("Unit V", ["Application Layer", "Electronic Mail", "File Transfer", "Virtual Terminals", "Internet Protocols"])

    is_quiz = "Quiz" in (exam_type or "")
    
    if is_quiz:
        quiz_num = "1"
        if "2" in exam_type:
            quiz_num = "2"
        elif "3" in exam_type:
            quiz_num = "3"

        if quiz_num == "1":
            unit_a_name, unit_a_topics = "Unit I", u1_topics
            unit_b_name, unit_b_topics = "Unit II", u2_topics
        elif quiz_num == "2":
            unit_a_name, unit_a_topics = "Unit III", u3_topics
            unit_b_name, unit_b_topics = "Unit IV", u4_topics
        else:
            unit_a_name, unit_a_topics = "Unit IV", u4_topics
            unit_b_name, unit_b_topics = "Unit V", u5_topics

        t1 = unit_a_topics[0] if len(unit_a_topics) > 0 else "Foundational Principles"
        t2 = unit_a_topics[1] if len(unit_a_topics) > 1 else t1
        t3a = unit_a_topics[2] if len(unit_a_topics) > 2 else t1
        t3b = unit_b_topics[0] if len(unit_b_topics) > 0 else "Core Mechanisms"
        t3c = unit_b_topics[1] if len(unit_b_topics) > 1 else t3b
        t3d = unit_b_topics[2] if len(unit_b_topics) > 2 else t3b
        t3e = unit_b_topics[3] if len(unit_b_topics) > 3 else t3b
        t3f = unit_b_topics[4] if len(unit_b_topics) > 4 else t3b
        t4 = unit_b_topics[0] if len(unit_b_topics) > 0 else "Advanced Protocols"
        t5 = unit_b_topics[1] if len(unit_b_topics) > 1 else "Protocol Analysis & Derivations"

        return [
            {"q_no": "Part A - Q1", "max_marks": 5.0, "unit": unit_a_name, "topic": t1, "question_text": f"Explain theoretical principles and structure of {t1}."},
            {"q_no": "Part A - Q2", "max_marks": 5.0, "unit": unit_a_name, "topic": t2, "question_text": f"Comparative analysis and system design of {t2}."},
            {"q_no": "Part B - Q3(a)", "max_marks": 1.0, "unit": unit_a_name, "topic": t3a, "question_text": f"Define key concept of {t3a}."},
            {"q_no": "Part B - Q3(b)", "max_marks": 1.0, "unit": unit_b_name, "topic": t3b, "question_text": f"Short question on {t3b}."},
            {"q_no": "Part B - Q3(c)", "max_marks": 1.0, "unit": unit_b_name, "topic": t3c, "question_text": f"Formula and definition of {t3c}."},
            {"q_no": "Part B - Q3(d)", "max_marks": 1.0, "unit": unit_b_name, "topic": t3d, "question_text": f"Working mechanism of {t3d}."},
            {"q_no": "Part B - Q3(e)", "max_marks": 1.0, "unit": unit_b_name, "topic": t3e, "question_text": f"Standards and parameters of {t3e}."},
            {"q_no": "Part B - Q3(f)", "max_marks": 1.0, "unit": unit_b_name, "topic": t3f, "question_text": f"Technical specification of {t3f}."},
            {"q_no": "Part B - Q4", "max_marks": 7.0, "unit": unit_b_name, "topic": t4, "question_text": f"Detailed analytical derivation of {t4} with equations."},
            {"q_no": "Part B - Q5", "max_marks": 7.0, "unit": unit_b_name, "topic": t5, "question_text": f"Systematic architecture and protocol operation of {t5}."}
        ]

    # Pre-End Semester Examination (100 Marks)
    return [
        {"q_no": "Q1(a)", "max_marks": 4.0, "unit": "Unit I", "topic": u1_topics[0] if u1_topics else "Network Architecture", "question_text": f"Short question on {u1_topics[0] if u1_topics else 'Unit I'}."},
        {"q_no": "Q1(b)", "max_marks": 4.0, "unit": "Unit I", "topic": u1_topics[1] if len(u1_topics) > 1 else "Delay Analysis", "question_text": f"Key principles of {u1_topics[1] if len(u1_topics) > 1 else 'Unit I'}."},
        {"q_no": "Q1(c)", "max_marks": 4.0, "unit": "Unit II", "topic": u2_topics[0] if u2_topics else "Data Link Layer", "question_text": f"Short question on {u2_topics[0] if u2_topics else 'Unit II'}."},
        {"q_no": "Q1(d)", "max_marks": 4.0, "unit": "Unit II", "topic": u2_topics[1] if len(u2_topics) > 1 else "ALOHA Protocols", "question_text": f"Key concept of {u2_topics[1] if len(u2_topics) > 1 else 'Unit II'}."},
        {"q_no": "Q1(e)", "max_marks": 4.0, "unit": "Unit III", "topic": u3_topics[0] if u3_topics else "Routing", "question_text": f"Short question on {u3_topics[0] if u3_topics else 'Unit III'}."},
        {"q_no": "Q1(f)", "max_marks": 4.0, "unit": "Unit III", "topic": u3_topics[1] if len(u3_topics) > 1 else "IPv4 Addressing", "question_text": f"Addressing and parameters in {u3_topics[1] if len(u3_topics) > 1 else 'Unit III'}."},
        {"q_no": "Q1(g)", "max_marks": 4.0, "unit": "Unit III", "topic": u3_topics[2] if len(u3_topics) > 2 else "Congestion Control", "question_text": f"Principles of {u3_topics[2] if len(u3_topics) > 2 else 'Unit III'}."},
        {"q_no": "Q1(h)", "max_marks": 4.0, "unit": "Unit IV", "topic": u4_topics[0] if u4_topics else "Connection Management", "question_text": f"Short question on {u4_topics[0] if u4_topics else 'Unit IV'}."},
        {"q_no": "Q1(i)", "max_marks": 4.0, "unit": "Unit IV", "topic": u4_topics[1] if len(u4_topics) > 1 else "Cryptography", "question_text": f"Algorithms in {u4_topics[1] if len(u4_topics) > 1 else 'Unit IV'}."},
        {"q_no": "Q1(j)", "max_marks": 4.0, "unit": "Unit V", "topic": u5_topics[0] if u5_topics else "Electronic Mail", "question_text": f"Short question on {u5_topics[0] if u5_topics else 'Unit V'}."},
        # Units I - V Choices (12 Marks each)
        {"q_no": "Unit I - Q2", "max_marks": 12.0, "unit": "Unit I", "topic": u1_topics[0] if u1_topics else "OSI Reference Model", "question_text": f"In-depth explanation and architectural design of {u1_topics[0] if u1_topics else 'Unit I'}.", "is_choice": True, "choice_group": "Unit I"},
        {"q_no": "Unit I - Q3", "max_marks": 12.0, "unit": "Unit I", "topic": u1_topics[1] if len(u1_topics) > 1 else "Network Topology", "question_text": f"Comprehensive derivation and calculations for {u1_topics[1] if len(u1_topics) > 1 else 'Unit I'}.", "is_choice": True, "choice_group": "Unit I"},
        {"q_no": "Unit II - Q4", "max_marks": 12.0, "unit": "Unit II", "topic": u2_topics[0] if u2_topics else "Sliding Window Protocols", "question_text": f"Detailed working and derivation of {u2_topics[0] if u2_topics else 'Unit II'}.", "is_choice": True, "choice_group": "Unit II"},
        {"q_no": "Unit II - Q5", "max_marks": 12.0, "unit": "Unit II", "topic": u2_topics[1] if len(u2_topics) > 1 else "IEEE Standards", "question_text": f"Standards and protocol analysis of {u2_topics[1] if len(u2_topics) > 1 else 'Unit II'}.", "is_choice": True, "choice_group": "Unit II"},
        {"q_no": "Unit III - Q6", "max_marks": 12.0, "unit": "Unit III", "topic": u3_topics[0] if u3_topics else "Routing", "question_text": f"Algorithm analysis and comparison of {u3_topics[0] if u3_topics else 'Unit III'}.", "is_choice": True, "choice_group": "Unit III"},
        {"q_no": "Unit III - Q7", "max_marks": 12.0, "unit": "Unit III", "topic": u3_topics[1] if len(u3_topics) > 1 else "IPv6 Addressing", "question_text": f"Datagram formats and mechanism of {u3_topics[1] if len(u3_topics) > 1 else 'Unit III'}.", "is_choice": True, "choice_group": "Unit III"},
        {"q_no": "Unit IV - Q8", "max_marks": 12.0, "unit": "Unit IV", "topic": u4_topics[0] if u4_topics else "TCP Window Management", "question_text": f"Window management and protocol mechanisms in {u4_topics[0] if u4_topics else 'Unit IV'}.", "is_choice": True, "choice_group": "Unit IV"},
        {"q_no": "Unit IV - Q9", "max_marks": 12.0, "unit": "Unit IV", "topic": u4_topics[1] if len(u4_topics) > 1 else "Cryptography", "question_text": f"Cryptographic algorithms and security mechanisms in {u4_topics[1] if len(u4_topics) > 1 else 'Unit IV'}.", "is_choice": True, "choice_group": "Unit IV"},
        {"q_no": "Unit V - Q10", "max_marks": 12.0, "unit": "Unit V", "topic": u5_topics[0] if u5_topics else "File Transfer", "question_text": f"Application protocol specifications for {u5_topics[0] if u5_topics else 'Unit V'}.", "is_choice": True, "choice_group": "Unit V"},
        {"q_no": "Unit V - Q11", "max_marks": 12.0, "unit": "Unit V", "topic": u5_topics[1] if len(u5_topics) > 1 else "Electronic Mail", "question_text": f"Architecture and message flows of {u5_topics[1] if len(u5_topics) > 1 else 'Unit V'}.", "is_choice": True, "choice_group": "Unit V"},
    ]


def analyze_question_paper_with_ai(pdf_text, subject, exam_type, paper_set='', model='gemini-1.5-flash'):
    """
    Examines extracted PDF text using the selected AI engine (Gemini, Ollama Qwen, ChatGPT, etc.)
    and automatically maps questions to official syllabus units, topics, and maximum marks.
    """
    clean_text = (pdf_text or "").strip()

    if len(clean_text) > 20:
        prompt = (
            f"You are an academic examination coordinator analyzing an uploaded university exam question paper.\n"
            f"Subject: [{subject.code}] {subject.name} (Semester {subject.semester})\n"
            f"Exam Type: {exam_type} {paper_set}\n\n"
            f"Official Subject Syllabus (Units & Topics):\n"
            f"{subject.syllabus_overview}\n\n"
            f"Uploaded Question Paper Text:\n"
            f"\"\"\"\n{clean_text[:4000]}\n\"\"\"\n\n"
            f"Task:\n"
            f"1. Read the uploaded question paper text.\n"
            f"2. Extract every question from the paper.\n"
            f"3. For EACH question, determine the question number (e.g., 'Part A - Q1', 'Part B - Q3(a)', etc.), maximum marks, and summarize the question.\n"
            f"4. Map each question to the exact Unit (e.g. 'Unit I', 'Unit II', 'Unit III', 'Unit IV', 'Unit V') and the specific Topic name from the official syllabus provided above.\n"
            f"5. If it is a choice question (e.g. in Pre-End sem where student chooses between questions), set is_choice: true and choice_group to the Unit name.\n\n"
            f"Required JSON Output Format (ONLY valid JSON array of objects, no markdown formatting):\n"
            f"[\n"
            f"  {{\n"
            f"    \"q_no\": \"Part A - Q1\",\n"
            f"    \"unit\": \"Unit I\",\n"
            f"    \"topic\": \"Specific Syllabus Topic Name\",\n"
            f"    \"max_marks\": 5.0,\n"
            f"    \"question_text\": \"Question summary\",\n"
            f"    \"is_choice\": false,\n"
            f"    \"choice_group\": \"\"\n"
            f"  }}\n"
            f"]"
        )
        try:
            import json
            ai_result = call_ai_engine(prompt, mode='detailed', semester=subject.semester, subject=subject.name, model=model)
            raw_response = ai_result.get('text', '') if isinstance(ai_result, dict) else str(ai_result)

            # Remove any markdown code block wrappers
            cleaned = re.sub(r'^```(?:json)?\s*', '', raw_response.strip(), flags=re.MULTILINE)
            cleaned = re.sub(r'```$', '', cleaned.strip())

            match = re.search(r'\[\s*\{.*\}\s*\]', cleaned, re.DOTALL)
            if match:
                parsed = json.loads(match.group(0))
                if isinstance(parsed, list) and len(parsed) > 0:
                    sanitized = []
                    for q in parsed:
                        sanitized.append({
                            "q_no": str(q.get('q_no', f"Q{len(sanitized)+1}")),
                            "unit": str(q.get('unit', 'Unit I')),
                            "topic": str(q.get('topic', 'General Topic')),
                            "max_marks": float(q.get('max_marks', 5.0)),
                            "question_text": str(q.get('question_text', '')),
                            "is_choice": bool(q.get('is_choice', False)),
                            "choice_group": str(q.get('choice_group', ''))
                        })
                    return sanitized
        except Exception as e:
            logger.warning(f"AI question paper analysis failed, falling back to syllabus alignment: {e}")

    return generate_syllabus_aligned_questions(subject, exam_type, paper_set)


def compute_personalized_study_order(student_user, subject_id=None, exam_id=None):
    """
    Computes an optimal, high-ROI study order prioritized from the student's worst-performing
    topics to best-performing topics based on question-wise previous exam scores and syllabus weightage.
    """
    from api.models import StudentExamScore, Exam, Subject, Resource

    scores_qs = StudentExamScore.objects.filter(student=student_user).select_related('exam', 'exam__subject')
    if exam_id:
        scores_qs = scores_qs.filter(exam_id=exam_id)
    if subject_id:
        scores_qs = scores_qs.filter(exam__subject_id=subject_id)

    if not scores_qs.exists():
        return {
            "total_exams_analyzed": 0,
            "total_marks_lost": 0,
            "recoverable_marks_top_3": 0,
            "quick_strategy": "No exam score records uploaded yet. Once faculty uploads your question-wise marks, your customized high-ROI study order will appear here.",
            "ranked_topics": []
        }

    # Aggregate by topic
    topic_data = {}
    total_exams = scores_qs.count()

    for s_record in scores_qs:
        exam = s_record.exam
        subject = exam.subject
        for q in (s_record.question_scores or []):
            topic_name = (q.get('topic') or 'General Concept').strip()
            unit_name = q.get('unit') or 'General Unit'
            # If question was a non-attempted optional choice, skip it
            if q.get('attempted') is False or q.get('is_choice_omitted') is True:
                continue

            # If student entered null or empty for marks_obtained, skip
            if q.get('marks_obtained') is None or q.get('marks_obtained') == '':
                continue

            obtained = float(q.get('marks_obtained', 0.0))
            max_m = float(q.get('max_marks', 0.0))
            if max_m <= 0:
                continue

            key = (subject.id, topic_name)
            if key not in topic_data:
                topic_data[key] = {
                    "subject_id": subject.id,
                    "subject_code": subject.code,
                    "subject_name": subject.name,
                    "topic": topic_name,
                    "unit": unit_name,
                    "marks_obtained": 0.0,
                    "max_marks": 0.0,
                    "questions_involved": [],
                    "faculty_comments": []
                }
            topic_data[key]["marks_obtained"] += obtained
            topic_data[key]["max_marks"] += max_m
            set_str = f" ({exam.paper_set})" if exam.paper_set else ""
            topic_data[key]["questions_involved"].append(f"{exam.title}{set_str}: {q.get('q_no', 'Q')}")
            note = q.get('faculty_notes') or q.get('faculty_comment') or q.get('faculty_feedback')
            if note and str(note).strip():
                topic_data[key]["faculty_comments"].append(str(note).strip())

    if not topic_data:
        return {
            "total_exams_analyzed": total_exams,
            "total_marks_lost": 0,
            "recoverable_marks_top_3": 0,
            "quick_strategy": "No question breakdown available yet in uploaded exams.",
            "ranked_topics": []
        }

    # Process metrics and compute deficit scores
    topic_list = []
    total_marks_lost = 0.0

    for key, data in topic_data.items():
        obt = round(data["marks_obtained"], 1)
        max_m = round(data["max_marks"], 1)
        lost = round(max(0.0, max_m - obt), 1)
        total_marks_lost += lost
        pct = round((obt / max_m) * 100.0, 1) if max_m > 0 else 0.0

        # High ROI priority formula:
        # Heavily weight total marks lost (absolute mark boost in upcoming exam) + low percentage
        deficit_score = (lost * 2.5) + (100.0 - pct)

        if pct <= 40.0:
            priority = "CRITICAL"
            badge_color = "rose"
        elif pct <= 60.0:
            priority = "HIGH"
            badge_color = "amber"
        elif pct <= 75.0:
            priority = "MEDIUM"
            badge_color = "blue"
        else:
            priority = "MASTERED"
            badge_color = "emerald"

        # Check for matching study resource
        resource = Resource.objects.filter(
            subject_id=data["subject_id"]
        ).filter(
            title__icontains=data["topic"]
        ).first() or Resource.objects.filter(subject_id=data["subject_id"]).first()

        topic_list.append({
            "subject_id": data["subject_id"],
            "subject_code": data["subject_code"],
            "subject_name": data["subject_name"],
            "topic": data["topic"],
            "unit": data["unit"],
            "marks_obtained": obt,
            "max_marks": max_m,
            "marks_lost": lost,
            "percentage": pct,
            "deficit_score": deficit_score,
            "priority": priority,
            "badge_color": badge_color,
            "recovery_potential": f"+{lost} Marks Potential",
            "questions_involved": data["questions_involved"],
            "faculty_comments": data["faculty_comments"],
            "reasoning": f"Scored {obt}/{max_m} ({pct:.0f}%) on {data['topic']}. Recovering these {lost} marks will yield the largest boost in your next exam.",
            "actionable_steps": [
                f"Review {data['unit']} notes and high-frequency problem patterns.",
                f"Clarify doubts on {data['topic']} in AI Doubt Solver.",
                f"Re-solve the missed exam question: {', '.join(data['questions_involved'][:2])}."
            ],
            "suggested_query": f"Explain {data['topic']} in {data['subject_name']} with step-by-step exam numericals and common mistakes.",
            "resource_title": resource.title if resource else None,
            "resource_id": resource.id if resource else None,
            "estimated_minutes": 45 if lost >= 5 else 30
        })

    # Sort from worst topic (most marks lost & lowest percentage) to best topic
    topic_list.sort(key=lambda x: x["deficit_score"], reverse=True)

    # Assign ranks
    for idx, item in enumerate(topic_list):
        item["rank"] = idx + 1

    # Recoverable marks in top 3
    top_3_gain = round(sum(t["marks_lost"] for t in topic_list[:3]), 1)
    top_topic = topic_list[0]["topic"] if topic_list else "None"
    second_topic = topic_list[1]["topic"] if len(topic_list) > 1 else None

    quick_strategy = (
        f"Short on time? Focus on Rank #1 ({top_topic}) and Rank #2 ({second_topic}) "
        f"to recover up to +{top_3_gain} marks in your next exam with under 90 minutes of targeted revision!"
        if second_topic else
        f"Short on time? Master Rank #1 ({top_topic}) to recover up to +{top_3_gain} marks!"
    )

    return {
        "total_exams_analyzed": total_exams,
        "total_marks_lost": round(total_marks_lost, 1),
        "recoverable_marks_top_3": top_3_gain,
        "quick_strategy": quick_strategy,
        "ranked_topics": topic_list
    }

