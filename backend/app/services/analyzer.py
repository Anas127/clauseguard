from openai import OpenAI
import os
import json
import re

SYSTEM_PROMPT = """You are an expert contract lawyer reviewing contracts on behalf of freelancers and contractors.
You identify clauses that are dangerous, one-sided, or missing. You always respond with valid JSON only, no explanation, no markdown, no code blocks."""

ANALYSIS_PROMPT = """Analyze this contract from the perspective of the CONTRACTOR (not the client).
Return a JSON object with exactly this structure:

{{
  "summary": "2-3 sentence plain English summary",
  "danger_score": 85,
  "parties": "who are the parties involved",
  "start_date": "contract start date or null",
  "end_date": "contract end date or null",
  "payment_terms": "payment terms or null",
  "termination": "termination clause summary or null",
  "governing_law": "governing law or null",
  "clauses": [
    {{
      "type": "Payment Terms",
      "content": "plain English summary of this clause",
      "risk_level": "high",
      "flag_reason": "why this is dangerous for the contractor",
      "recommendation": "exactly what the contractor should ask to change"
    }}
  ]
}}

Rules:
- danger_score is 0-100. 0 = perfectly fair contract, 100 = contractor should never sign this. Be accurate and harsh.
- Clause type must be human readable (e.g. "Payment Terms" not "payment_terms")
- Sort clauses by risk: high first, then medium, then low
- risk_level is "high", "medium", or "low"
- flag_reason: explain the specific risk in plain English
- recommendation: concrete actionable advice e.g. "Negotiate payment to net-15. If they refuse, require a 50% deposit upfront."
- flag_reason and recommendation are null only for low risk clauses
- Be strict. Flag anything one-sided against the contractor.

Return ONLY the JSON object, nothing else.

Contract text:
{text}"""


def analyze_contract(raw_text: str) -> dict:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    truncated = raw_text[:12000]

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": ANALYSIS_PROMPT.format(text=truncated)}
        ],
        temperature=0.1,
    )

    content = response.choices[0].message.content.strip()
    content = re.sub(r'^```(?:json)?\s*', '', content)
    content = re.sub(r'\s*```$', '', content)
    content = content.strip()

    try:
        result = json.loads(content)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"Could not parse AI response: {e}\nRaw: {content[:200]}")

    return result
