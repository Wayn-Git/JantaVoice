from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import os
import time
from datetime import datetime

# HuggingFace (optional - used as fallback when OpenRouter fails)
try:
    from transformers import pipeline
    HF_AVAILABLE = True
except ImportError:
    HF_AVAILABLE = False

# Routes
from routes.complaint_routes import complaint_routes
from routes.admin_routes import admin_routes
from routes.voice_routes import voice_routes
from routes.pickup_routes import pickup_routes

# Voice Bot (optional - legacy support)
try:
    from voice_bot.enhanced_jantavoice import start_conversation
    VOICE_BOT_AVAILABLE = True
except ImportError:
    VOICE_BOT_AVAILABLE = False
    start_conversation = None

# ✅ Import schemes
from schemes_data import SCHEMES  

# ---------------- Logging Setup ----------------
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=LOG_LEVEL,
    format="%(asctime)s [%(levelname)s] - %(name)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("server.log", encoding="utf-8")
    ],
)
logger = logging.getLogger("JantaVoice")

# ---------------- Flask Setup ----------------
app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = os.environ.get("APP_SECRET_KEY", "super_secret_key_change_later")

# Register Blueprints
app.register_blueprint(complaint_routes)                 
app.register_blueprint(admin_routes)                   
app.register_blueprint(voice_routes)
app.register_blueprint(pickup_routes)                     

# ---------------- HuggingFace Model (Optional Fallback) ----------------
HF_MODEL_NAME = os.environ.get("HF_MODEL_NAME", "bigscience/bloom-560m")

GEN_MAX_LENGTH = int(os.environ.get("GEN_MAX_LENGTH", "256"))
GEN_TEMPERATURE = float(os.environ.get("GEN_TEMPERATURE", "0.8"))
GEN_TOP_P = float(os.environ.get("GEN_TOP_P", "0.95"))
GEN_DO_SAMPLE = os.environ.get("GEN_DO_SAMPLE", "true").lower() == "true"

chatbot = None
if HF_AVAILABLE:
    try:
        logger.info(f"Loading Hugging Face model: {HF_MODEL_NAME} (optional fallback)")
        chatbot = pipeline("text-generation", model=HF_MODEL_NAME)
        logger.info("✅ Chatbot model loaded successfully (as fallback).")
    except Exception as e:
        logger.warning(f"⚠️ HuggingFace model not loaded (OpenRouter will be primary): {e}")
        chatbot = None 

# ---------------- Helpers ----------------
def _build_prompt(user_text: str) -> str:
    return (
        "You are a helpful assistant that explains Indian Government Schemes in simple English.\n\n"
        f"Question: {user_text.strip()}\n\n"
        "Answer in simple, bullet points, and clear English.\n"
        "If possible, include the Scheme Name, Eligibility, Application Process, and Benefits.\n\n"
        "Answer:\n"
    )

def _postprocess_generated(user_prompt: str, generated_text: str) -> str:
    try:
        if generated_text.startswith(user_prompt):
            generated_text = generated_text[len(user_prompt):]
        return generated_text.strip()
    except Exception:
        return generated_text.strip()

def find_scheme_info(user_text: str):
    for scheme_name, data in SCHEMES.items():
        if scheme_name.lower() in user_text.lower():
            return scheme_name, data
    return None, None

# ---------------- Routes ----------------
@app.route("/", methods=["GET"])
def health_check():
    logger.info("Health check pinged")
    return jsonify({
        "status": "running",
        "message": "JantaVoice API is live 🚀",
        "version": "2.0",
        "timestamp_utc": datetime.utcnow().isoformat() + "Z",
        "chatbot_model": HF_MODEL_NAME,
        "chatbot_loaded": chatbot is not None
    }), 200

@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json(silent=True) or {}
        prompt = data.get("message", "").strip()

        if not prompt:
            return jsonify({"reply": "Message is empty"}), 400

        # Step 1: Predefined schemes
        scheme_name, scheme_data = find_scheme_info(prompt)
        if scheme_data:
            reply = f"👉 *{scheme_name}*\n\n"
            reply += f"🌐 Official Link: {scheme_data['link']}\n\n"
            reply += f"📌 Eligibility: {scheme_data['eligibility']}\n\n"
            reply += f"🎯 Benefits: {scheme_data['benefits']}\n\n"
            reply += "📝 Application Process:\n"
            for i, step in enumerate(scheme_data["steps"], 1):
                reply += f"{i}. {step}\n"

            return jsonify({"reply": reply}), 200

        # Step 2: OpenRouter LLM fallback
        try:
            from ai_services import get_scheme_info
            result = get_scheme_info(prompt)
            if result.get("success"):
                return jsonify({"reply": result.get("reply", "No information found.")}), 200
            else:
                return jsonify({"reply": "Sorry, information is not available right now."}), 200
        except Exception as llm_error:
            logger.warning(f"OpenRouter LLM error: {llm_error}")
            # Fallback to HuggingFace if available
            if chatbot is not None:
                full_prompt = _build_prompt(prompt)
                outputs = chatbot(
                    full_prompt,
                    max_length=GEN_MAX_LENGTH,
                    do_sample=GEN_DO_SAMPLE,
                    top_p=GEN_TOP_P,
                    temperature=GEN_TEMPERATURE,
                    num_return_sequences=1,
                    pad_token_id=None
                )
                raw_text = outputs[0].get("generated_text", "")
                reply = _postprocess_generated(full_prompt, raw_text)
                return jsonify({"reply": reply}), 200
            else:
                return jsonify({"reply": "Sorry, the chatbot is currently unavailable."}), 500

    except Exception as e:
        logger.exception("Chat error")
        return jsonify({"reply": f"Error: {str(e)}"}), 500

@app.route("/api/voice-complaint", methods=["POST"])
def voice_complaint():
    try:
        logger.info("Voice complaint endpoint triggered")
        result = start_conversation()
        if result:
            return jsonify({
                "status": "success",
                "message": "Voice complaint submitted successfully!",
                "data": result,
                "complaint_id": result.get("complaint_id", "Unknown")
            }), 200
        else:
            return jsonify({"status": "error", "message": "Failed to process voice complaint"}), 500
    except Exception as e:
        logger.exception("Voice complaint error")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/voice-complaint-alt", methods=["POST"])
def voice_complaint_alt():
    try:
        logger.info("Voice complaint (alt) triggered")
        result = start_conversation()
        if result:
            return jsonify({
                "message": "Voice complaint submitted successfully!",
                "data": result,
                "complaint_id": result.get("complaint_id", "Unknown")
            }), 200
        else:
            return jsonify({"error": "Failed to process voice complaint"}), 500
    except Exception as e:
        logger.exception("Voice complaint error")
        return jsonify({"error": str(e)}), 500

# ---------------- Error Handlers ----------------
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

# ---------------- Main ----------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug_mode = os.environ.get("DEBUG", "True").lower() == "true"
    logger.info(f"🚀 Starting JantaVoice server on port {port}")
    app.run(debug=debug_mode, use_reloader=False, host="0.0.0.0", port=port)
