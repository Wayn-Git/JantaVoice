"""
Voice Routes for JantaVoice
Handles voice complaint submission with AI processing
"""

from flask import Blueprint, jsonify, request
import logging
import traceback
import os
import uuid
from datetime import datetime

# Import AI services
from ai_services import transcribe_hindi_audio, extract_fields_from_complaint
from fallback_storage import save_complaint_fallback
from config import complaints_collection
from utils.generate_id import generate_complaint_id, generate_token

voice_routes = Blueprint('voice_routes', __name__)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Upload folder for audio files
AUDIO_UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'audios')
os.makedirs(AUDIO_UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'wav', 'mp3', 'webm', 'ogg', 'm4a', 'flac'}


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def is_database_available():
    """Check if MongoDB is available"""
    return complaints_collection is not None


@voice_routes.route('/api/complaint/voice', methods=['POST'])
def handle_voice_complaint():
    """
    Process voice complaint with AI pipeline
    
    Expects multipart/form-data with:
    - audio: Audio file (wav, mp3, webm, etc.)
    - name: (optional) Complainant name
    - phone: (optional) Phone number
    
    Returns structured complaint data with transcript
    """
    try:
        logger.info("Voice complaint endpoint triggered")
        
        # Check if audio file is present
        if 'audio' not in request.files:
            return jsonify({
                "success": False,
                "error": "No audio file provided"
            }), 400
        
        audio_file = request.files['audio']
        
        if audio_file.filename == '':
            return jsonify({
                "success": False,
                "error": "No file selected"
            }), 400
        
        if not allowed_file(audio_file.filename):
            return jsonify({
                "success": False,
                "error": f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            }), 400
        
        # Generate unique filename and save audio
        file_ext = audio_file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{file_ext}"
        audio_path = os.path.join(AUDIO_UPLOAD_FOLDER, unique_filename)
        audio_file.save(audio_path)
        logger.info(f"Audio saved: {audio_path}")
        
        # Step 1: Transcribe audio using OpenAI Whisper
        logger.info("Starting transcription...")
        transcription_result = transcribe_hindi_audio(audio_path)
        
        if not transcription_result.get("success"):
            return jsonify({
                "success": False,
                "error": "Failed to transcribe audio",
                "details": transcription_result.get("error")
            }), 500
        
        transcript = transcription_result.get("transcript", "")
        logger.info(f"Transcription complete: {transcript[:100]}...")
        
        # Step 2: Extract fields using OpenRouter LLM
        logger.info("Extracting fields...")
        extraction_result = extract_fields_from_complaint(transcript)
        
        if not extraction_result.get("success"):
            logger.warning("Field extraction failed, using fallback")
        
        fields = extraction_result.get("fields", {})
        
        # Step 3: Create complaint document
        complaint_id = generate_complaint_id()
        token = generate_token()
        
        # Override with form data if provided
        name = request.form.get('name') or fields.get('name', 'Unknown')
        phone = request.form.get('phone') or fields.get('phone')
        
        complaint = {
            "id": complaint_id,
            "token": token,
            "type": "voice",
            "name": name,
            "phone": phone,
            "location": fields.get('location', 'Unknown'),
            "department": fields.get('department', 'General Administration'),
            "description": fields.get('description', transcript),
            "urgency": fields.get('urgency', 'Medium'),
            "transcript_hindi": transcript,
            "audio_path": f"/audios/{unique_filename}",
            "status": "Pending",
            "timestamp": datetime.utcnow(),
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Step 4: Save to database (with fallback)
        saved_to_db = False
        if is_database_available():
            try:
                complaints_collection.insert_one(complaint.copy())
                saved_to_db = True
                logger.info(f"Complaint saved to MongoDB: {complaint_id}")
            except Exception as db_error:
                logger.error(f"MongoDB save failed: {db_error}")
                # Fall through to fallback
        
        if not saved_to_db:
            # Save to fallback JSON storage
            save_complaint_fallback(complaint)
            logger.warning(f"Complaint saved to fallback storage: {complaint_id}")
        
        # Return success response
        return jsonify({
            "success": True,
            "complaint_id": complaint_id,
            "token": token,
            "transcript": transcript,
            "extracted_fields": {
                "name": name,
                "phone": phone,
                "location": fields.get('location'),
                "department": fields.get('department'),
                "description": fields.get('description'),
                "urgency": fields.get('urgency')
            },
            "saved_to_database": saved_to_db,
            "message": "शिकायत सफलतापूर्वक दर्ज हो गई है" if saved_to_db else "शिकायत सहेजी गई, डेटाबेस में बाद में sync होगी"
        }), 201
        
    except Exception as e:
        logger.exception(f"Voice complaint error: {e}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "तकनीकी समस्या हुई, कृपया पुनः प्रयास करें"
        }), 500


@voice_routes.route('/api/voice-status', methods=['GET'])
def voice_status():
    """Check if voice bot is ready and working"""
    return jsonify({
        "status": "ready",
        "message": "Voice complaint system is ready",
        "version": "3.0",
        "features": {
            "speech_to_text": "OpenAI Whisper",
            "field_extraction": "OpenRouter LLM",
            "database": "MongoDB" if is_database_available() else "Fallback JSON"
        }
    }), 200


@voice_routes.route('/api/voice-test', methods=['GET'])
def voice_test():
    """Test endpoint for voice functionality"""
    return jsonify({
        "status": "success",
        "message": "Voice API is operational",
        "database_available": is_database_available()
    }), 200


# Legacy endpoint for backward compatibility
@voice_routes.route('/api/voice-complaint', methods=['GET', 'POST'])
def legacy_voice_complaint():
    """Legacy endpoint - redirects to new API"""
    if request.method == 'POST':
        return handle_voice_complaint()
    
    return jsonify({
        "status": "info",
        "message": "Please use POST /api/complaint/voice with audio file",
        "new_endpoint": "/api/complaint/voice",
        "method": "POST",
        "content_type": "multipart/form-data"
    }), 200