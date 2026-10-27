# 🥗 NutriGuide AI — IBM Granite Nutrition Agentic Application

<p align="center">
  <img src="https://img.shields.io/badge/IBM%20watsonx.ai-Powered-blue?style=for-the-badge&logo=ibm" />
  <img src="https://img.shields.io/badge/LLM-Llama%203.3%2070B%20Instruct-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Python-3.10%2B-yellow?style=for-the-badge&logo=python" />
  <img src="https://img.shields.io/badge/Flask-3.x-black?style=for-the-badge&logo=flask" />
  <img src="https://img.shields.io/badge/License-MIT-lightgrey?style=for-the-badge" />
</p>

> **NutriGuide AI** is a web-based **Agentic AI** nutrition planning application powered by **IBM watsonx.ai** and the **IBM Granite** project environment. It collects user details, generates personalised 7-day meal plans, and answers real-time nutrition queries — all while following AI ethics, guardrails, and HAM (Helpful, Accurate, Mindful) principles.

---

## 📸 Features at a Glance

| Feature | Detail |
|---|---|
| 🍽️ **Personalised 7-Day Plan** | Tailored to age, diet preference, medical history, location & goal |
| 🏥 **Medical Condition Awareness** | Specific guidance for Diabetes, Hypertension, Thyroid, etc. |
| 💬 **Real-Time AI Chatbot** | Ask any nutrition or diet question, answered instantly |
| 🛡️ **Ethical AI Guardrails** | Regex + prompt-level filtering blocks harmful/off-topic content |
| ⚕️ **Medical Disclaimer** | Automatically appended to every AI response |
| 🌍 **Location-Aware Plans** | Uses locally available, culturally relevant foods |
| 🤖 **HAM Principles** | Helpful, Accurate & Mindful responses enforced via system prompt |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser (UI)                     │
│         HTML5 / CSS3 / Vanilla JavaScript           │
└────────────────────┬────────────────────────────────┘
                     │  HTTP (REST)
┌────────────────────▼────────────────────────────────┐
│              Flask Web Server (app.py)               │
│   GET /          → Serve UI                         │
│   POST /api/nutrition-plan → Generate meal plan     │
│   POST /api/query          → Answer question        │
│   GET  /health             → Health check           │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│           Agentic AI Core (agent.py)                │
│   • Input validation & age check                   │
│   • Guardrail layer (regex content filter)          │
│   • Prompt engineering (system + user messages)     │
│   • HAM ethical persona injection                   │
│   • Medical disclaimer append                       │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│       LLM Client (granite_client.py)                │
│   IBM watsonx.ai — Chat Completions API             │
│   Model: meta-llama/llama-3-3-70b-instruct          │
│   Region: au-syd.ml.cloud.ibm.com                   │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
nutrition_ai/
├── app.py                  # Flask web server & REST API routes
├── agent.py                # Agentic AI core: validation, guardrails, prompts
├── granite_client.py       # IBM watsonx.ai LLM integration
├── requirements.txt        # Python dependencies
├── config.env.example      # Environment variable template (copy → config.env)
├── README.md               # This file
├── templates/
│   └── index.html          # Web UI (3-tab: Plan | Chat | About)
└── static/
    ├── css/
    │   └── style.css       # Application styling
    └── js/
        └── app.js          # Frontend JS logic
```

---

## ⚙️ Prerequisites

- Python **3.10** or later
- An **IBM Cloud** account with a **watsonx.ai** project
- The following credentials:
  - `IBM_API_KEY` — IBM Cloud IAM API Key
  - `IBM_PROJECT_ID` — watsonx.ai Project ID
  - `IBM_ENDPOINT_URL` — watsonx.ai regional endpoint

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/anvirachavan-cloud/IBM-Cloud.git
cd IBM-Cloud/nutrition_ai
```

### 2. Create a virtual environment (recommended)

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure credentials

Copy the example config and fill in your credentials:

```bash
cp config.env.example config.env
```

Edit `config.env`:

```env
IBM_API_KEY=your_ibm_api_key_here
IBM_PROJECT_ID=your_project_id_here
IBM_ENDPOINT_URL=https://au-syd.ml.cloud.ibm.com
```

> ⚠️ **Never commit `config.env` with real credentials.** It is in `.gitignore`.

### 5. Run the application

```bash
python app.py
```

### 6. Open in browser

```
http://localhost:5000
```

---

## 🔗 API Reference

### `POST /api/nutrition-plan`

Generate a personalised 7-day nutrition plan.

**Request body (JSON):**

```json
{
  "name": "Priya Sharma",
  "age": "30",
  "diet_preference": "vegetarian",
  "medical_history": "Type 2 Diabetes",
  "city": "Mumbai",
  "country": "India",
  "goal": "Manage blood sugar levels",
  "activity_level": "moderately active"
}
```

**Response:**

```json
{
  "success": true,
  "plan": "## Personalised Nutrition Plan for Priya\n..."
}
```

---

### `POST /api/query`

Answer a general nutrition or health question.

**Request body (JSON):**

```json
{
  "question": "What foods are good for managing high blood pressure?"
}
```

**Response:**

```json
{
  "success": true,
  "answer": "Foods rich in potassium such as bananas..."
}
```

---

### `GET /health`

```json
{ "status": "ok", "service": "NutriGuide AI" }
```

---

## 🛡️ AI Ethics & Guardrails

This application is built with responsible AI at its core:

1. **Input Guardrails** — Regex patterns block harmful, abusive, jailbreak, or off-topic content before any LLM call is made.
2. **System Prompt Ethics** — Every request includes a strict system persona instructing the LLM to follow HAM principles, avoid dangerous dietary advice, and use inclusive language.
3. **Safe Diet Limits** — The LLM is explicitly instructed never to recommend calorie intake below 1200 kcal/day or unproven supplements.
4. **Medical Disclaimer** — A mandatory disclaimer is appended to **every** AI response reminding users to consult a qualified healthcare professional.
5. **Condition-Specific Safety** — For users with diabetes, hypertension, or other conditions, the agent provides conservative, evidence-based guidance.

---

## 🧪 Running Tests

```bash
# End-to-end tests (guardrails + real LLM calls)
python e2e_test.py
```

---

## 🧱 Tech Stack

| Component | Technology |
|---|---|
| **LLM** | meta-llama/llama-3-3-70b-instruct (via IBM watsonx.ai) |
| **AI Platform** | IBM watsonx.ai (au-syd region) |
| **Backend** | Python 3.10+ / Flask 3.x |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **LLM SDK** | ibm-watsonx-ai 1.x |
| **Auth** | IBM Cloud IAM API Key |

---

## ⚕️ Medical Disclaimer

> This application is for **informational and educational purposes only** and does **not** constitute medical, dietary, or clinical advice. Always consult a qualified healthcare provider or registered dietitian before making changes to your diet, especially if you have a medical condition. Do not disregard professional medical advice based on anything this application generates.

---

## 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">Built with IBM watsonx.ai &nbsp;|&nbsp; IBM Granite Project &nbsp;|&nbsp; Agentic AI</p>
