import requests
import json
import logging
from django.conf import settings

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

def call_ollama(prompt, mode='detailed', subject=None, model=None):
    """
    Calls the local Ollama AI instance.
    Raises RuntimeError if the AI engine is unreachable or cannot respond.
    No mock fallback responses are used.
    """
    selected_model = model or getattr(settings, 'OLLAMA_DEFAULT_MODEL', 'qwen2.5:latest')
    base_url = getattr(settings, 'OLLAMA_BASE_URL', 'http://127.0.0.1:11434')
    system_instruction = SYSTEM_PROMPTS.get(mode, SYSTEM_PROMPTS['detailed'])
    
    if subject:
        system_instruction += f"\nAcademic Subject Context: {subject}."

    full_prompt = f"{system_instruction}\n\nStudent Doubt / Query:\n{prompt}\n\nAcademic Response:"

    try:
        response = requests.post(
            f"{base_url}/api/generate",
            json={
                "model": selected_model,
                "prompt": full_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.4,
                    "top_p": 0.9,
                }
            },
            timeout=25
        )
    except requests.exceptions.ConnectionError:
        raise RuntimeError(
            f"AI engine not communicable: Unable to connect to Ollama service at {base_url}. "
            "Please ensure the Ollama service is running on the server."
        )
    except requests.exceptions.Timeout:
        raise RuntimeError(
            f"AI engine not communicable: Request timed out. "
            f"The model '{selected_model}' did not respond within 25 seconds."
        )
    except Exception as e:
        raise RuntimeError(f"AI engine not communicable: {str(e)}")

    if response.status_code != 200:
        error_msg = response.text
        try:
            err_json = response.json()
            error_msg = err_json.get("error", response.text)
        except Exception:
            pass
        raise RuntimeError(f"AI engine error ({response.status_code}): {error_msg}")

    data = response.json()
    response_text = data.get("response", "").strip()
    if not response_text:
        raise RuntimeError("AI engine returned an empty response.")

    return {
        "success": True,
        "text": response_text,
        "model": selected_model,
        "source": "ollama_local"
    }

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
