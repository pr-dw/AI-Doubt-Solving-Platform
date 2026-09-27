import os
import logging
from django.conf import settings
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_ollama import ChatOllama
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI

logger = logging.getLogger(__name__)

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
        resolved_tag = "qwen2.5:latest"
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


def call_ai_engine(prompt, mode='detailed', subject=None, model='gemini-1.5-flash', custom_api_key=None):
    """
    Executes reasoning pipeline using LangChain.
    Selects between Google Gemini, Ollama Qwen, Ollama Gemma, or OpenAI ChatGPT.
    Raises RuntimeError if the selected provider or service is unreachable.
    """
    llm, resolved_model_label = get_langchain_model(model, custom_api_key=custom_api_key)

    system_instruction = SYSTEM_PROMPTS.get(mode, SYSTEM_PROMPTS['detailed'])
    if subject:
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

    return {
        "success": True,
        "text": response_text,
        "model": resolved_model_label,
        "source": "langchain"
    }

# Backward compatibility alias
def call_ollama(prompt, mode='detailed', subject=None, model=None):
    return call_ai_engine(prompt, mode=mode, subject=subject, model=model or 'gemini-1.5-flash')


def generate_roadmap_content(subject_name, semester):
    """
    Generates structured learning milestones for a subject.
    """
    return [
        {
            "step": 1,
            "title": f"Unit 1: Fundamentals of {subject_name}",
            "description": "Foundational definitions, historical evolution, core architecture, and basic terminology.",
            "estimated_hours": 10,
            "status": "completed"
        },
        {
            "step": 2,
            "title": "Unit 2: Core Data Structures & Methodologies",
            "description": "In-depth study of intermediate concepts, algorithmic representations, and schema models.",
            "estimated_hours": 14,
            "status": "in_progress"
        },
        {
            "step": 3,
            "title": "Unit 3: Advanced Optimization & System Design",
            "description": "Handling concurrency, memory management, indexing, and complex problem decomposition.",
            "estimated_hours": 16,
            "status": "pending"
        },
        {
            "step": 4,
            "title": "Unit 4: Real-world Applications & Case Studies",
            "description": "Analyzing industry implementations, modern frameworks, and architectural trade-offs.",
            "estimated_hours": 12,
            "status": "pending"
        },
        {
            "step": 5,
            "title": "Unit 5: Previous Year Questions & Comprehensive Revision",
            "description": "Solving past 5 years university exam papers, mock viva questions, and high-frequency numericals.",
            "estimated_hours": 10,
            "status": "pending"
        }
    ]
