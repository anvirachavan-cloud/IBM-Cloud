"""
app.py
Flask web server — NutriGuide AI backend.
Exposes:
  GET  /                  → HTML UI
  POST /api/nutrition-plan → generate personalised nutrition plan
  POST /api/query          → answer a general nutrition query
"""

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables from config.env
load_dotenv("config.env")

from agent import generate_nutrition_plan, answer_query  # noqa: E402 (after dotenv)

app = Flask(__name__)
CORS(app)


# ── Routes ─────────────────────────────────────────────────────

@app.route("/")
def index():
    """Serve the main UI."""
    return render_template("index.html")


@app.route("/api/nutrition-plan", methods=["POST"])
def api_nutrition_plan():
    """
    POST /api/nutrition-plan
    Body (JSON):
      name, age, diet_preference, medical_history,
      city, country, goal, activity_level
    Returns:
      { success: bool, plan?: str, error?: str }
    """
    body = request.get_json(silent=True) or {}
    result = generate_nutrition_plan(body)
    status = 200 if result["success"] else 400
    return jsonify(result), status


@app.route("/api/query", methods=["POST"])
def api_query():
    """
    POST /api/query
    Body (JSON):
      question: str
      user_context?: { name, age, diet_preference, medical_history }  (optional)
    Returns:
      { success: bool, answer?: str, error?: str }
    """
    body        = request.get_json(silent=True) or {}
    question    = body.get("question", "")
    user_ctx    = body.get("user_context")          # optional
    result      = answer_query(question, user_ctx)
    status      = 200 if result["success"] else 400
    return jsonify(result), status


@app.route("/health")
def health():
    """Simple health-check endpoint."""
    return jsonify({"status": "ok", "service": "NutriGuide AI"}), 200


# ── Entry point ────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    print(f"\n🥗  NutriGuide AI starting on http://localhost:{port}\n")
    app.run(host="0.0.0.0", port=port, debug=debug)
