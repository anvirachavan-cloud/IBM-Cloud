"""
granite_client.py
LLM integration via IBM watsonx.ai.

Model used: meta-llama/llama-3-3-70b-instruct
This is the supported instruct model on this watsonx.ai project.
(ibm/granite-3-1-8b-base is a base model only and does not support text generation;
 ibm/granite-13b-instruct-v2 is not provisioned in this environment.)

Uses the modern chat-completions API to avoid the deprecated /ml/v1/text/generation endpoint.
"""

import os
from dotenv import load_dotenv
from ibm_watsonx_ai import APIClient, Credentials
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams

# Load credentials from config.env
load_dotenv("config.env")

IBM_API_KEY    = os.getenv("IBM_API_KEY")
IBM_PROJECT_ID = os.getenv("IBM_PROJECT_ID")
IBM_ENDPOINT   = os.getenv("IBM_ENDPOINT_URL", "https://au-syd.ml.cloud.ibm.com")

# Only instruct model supported in this watsonx.ai environment
MODEL_ID = "meta-llama/llama-3-3-70b-instruct"


def _get_model() -> ModelInference:
    """Create and return a ModelInference instance."""
    credentials = Credentials(
        url=IBM_ENDPOINT,
        api_key=IBM_API_KEY,
    )
    client = APIClient(credentials=credentials, project_id=IBM_PROJECT_ID)

    # For the chat API, use max_tokens (not max_new_tokens which is for generate_text)
    params = {
        "max_tokens": 1024,
        GenParams.TEMPERATURE: 0.7,
        GenParams.TOP_P: 0.9,
        GenParams.REPETITION_PENALTY: 1.1,
    }

    model = ModelInference(
        model_id=MODEL_ID,
        api_client=client,
        params=params,
        project_id=IBM_PROJECT_ID,
    )
    return model


def generate_text(user_prompt: str, system_prompt: str | None = None) -> str:
    """
    Send a prompt to the LLM using the modern chat completions API.

    Args:
        user_prompt:   The user-facing message / instruction.
        system_prompt: Optional system role instructions (persona, rules, ethics).

    Returns the assistant's response text.
    Raises RuntimeError on API failure.
    """
    try:
        model = _get_model()

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": user_prompt})

        response = model.chat(messages=messages)
        content = (
            response
            .get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
        )
        return content.strip()
    except Exception as exc:
        raise RuntimeError(f"LLM API error: {exc}") from exc
