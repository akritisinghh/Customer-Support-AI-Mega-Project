"""NLP service — intent detection, sentiment analysis, urgency classification, and language detection."""

from __future__ import annotations

from groq import AsyncGroq

from backend.core.config import settings
from backend.core.exceptions import ExternalServiceError
from backend.core.logging import get_logger

log = get_logger(__name__)


class NLPService:
    def __init__(self) -> None:
        self.groq = AsyncGroq(api_key=settings.GROQ_API_KEY)

    async def detect_intent(self, text: str) -> str:
        prompt = (
            "Classify the customer intent of the following message into ONE of these categories: "
            "billing, technical_support, account, shipping, returns, general_inquiry, complaint, "
            "cancellation, upgrade, feedback. Reply with the category name only."
        )
        result = await self._classify(prompt, text)
        log.info("nlp.detect_intent", text_len=len(text), intent=result)
        return result

    async def analyze_sentiment(self, text: str) -> dict:
        prompt = (
            "Analyze the sentiment of the following customer message. "
            "Reply ONLY in this exact format: <label>|<score>\n"
            "where <label> is one of: positive, negative, neutral\n"
            "and <score> is a float between 0.0 and 1.0 representing confidence."
        )
        raw = await self._classify(prompt, text)

        label = "neutral"
        score = 0.5
        if "|" in raw:
            parts = raw.split("|", 1)
            label = parts[0].strip().lower()
            try:
                score = float(parts[1].strip())
            except (ValueError, IndexError):
                score = 0.5
            if label not in ("positive", "negative", "neutral"):
                label = "neutral"

        result = {"label": label, "score": round(score, 3)}
        log.info("nlp.analyze_sentiment", text_len=len(text), sentiment=result)
        return result

    async def classify_urgency(self, text: str) -> str:
        prompt = (
            "Classify the urgency of the following support message as exactly one of: "
            "low, medium, high, urgent. Reply with the word only."
        )
        raw = await self._classify(prompt, text)
        priority = raw.lower().strip()
        if priority not in ("low", "medium", "high", "urgent"):
            priority = "medium"
        log.info("nlp.classify_urgency", text_len=len(text), priority=priority)
        return priority

    async def detect_language(self, text: str) -> str:
        prompt = (
            "Detect the language of the following text. "
            "Reply with the ISO 639-1 two-letter language code only (e.g. en, es, fr, de, ja)."
        )
        raw = await self._classify(prompt, text)
        code = raw.strip().lower()[:2]
        log.info("nlp.detect_language", text_len=len(text), language=code)
        return code

    # ---- Internal ----

    async def _classify(self, system_prompt: str, text: str) -> str:
        try:
            response = await self.groq.chat.completions.create(
                model=settings.AI_MODEL,
                temperature=0,
                max_tokens=30,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text},
                ],
            )
            return (response.choices[0].message.content or "").strip()
        except Exception as exc:
            log.error("nlp.classification_error", error=str(exc))
            raise ExternalServiceError("Groq", "NLP classification failed") from exc
