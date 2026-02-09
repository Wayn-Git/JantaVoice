"""
Fallback Storage Module for JantaVoice
Handles JSON-based storage when MongoDB is unavailable
"""

import os
import json
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from threading import Lock

load_dotenv = None
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

logger = logging.getLogger(__name__)

FALLBACK_JSON_PATH = os.getenv("FALLBACK_JSON_PATH", "./fallback_complaints.json")
SYNC_PENDING_PATH = os.getenv("SYNC_PENDING_PATH", "./sync_pending.json")

# Thread lock for file operations
_file_lock = Lock()


class FallbackStorage:
    """JSON-based fallback storage for complaints"""
    
    def __init__(self, filepath: str = FALLBACK_JSON_PATH):
        self.filepath = filepath
        self._ensure_file_exists()
    
    def _ensure_file_exists(self):
        """Create the JSON file if it doesn't exist"""
        if not os.path.exists(self.filepath):
            with open(self.filepath, 'w', encoding='utf-8') as f:
                json.dump([], f)
    
    def save_complaint(self, complaint: Dict[str, Any]) -> bool:
        """
        Save a complaint to the fallback JSON file
        
        Args:
            complaint: Complaint data dictionary
            
        Returns:
            True if saved successfully, False otherwise
        """
        try:
            with _file_lock:
                # Read existing complaints
                complaints = self._read_all()
                
                # Add metadata for sync tracking
                complaint["_fallback_saved_at"] = datetime.utcnow().isoformat()
                complaint["_sync_status"] = "pending"
                
                # Append new complaint
                complaints.append(complaint)
                
                # Write back
                with open(self.filepath, 'w', encoding='utf-8') as f:
                    json.dump(complaints, f, ensure_ascii=False, indent=2, default=str)
                
                logger.info(f"Complaint saved to fallback storage: {complaint.get('id', 'unknown')}")
                return True
                
        except Exception as e:
            logger.exception(f"Failed to save complaint to fallback storage: {e}")
            return False
    
    def _read_all(self) -> List[Dict[str, Any]]:
        """Read all complaints from fallback file"""
        try:
            with open(self.filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return []
    
    def get_pending_sync(self) -> List[Dict[str, Any]]:
        """Get all complaints pending MongoDB sync"""
        with _file_lock:
            complaints = self._read_all()
            return [c for c in complaints if c.get("_sync_status") == "pending"]
    
    def mark_synced(self, complaint_id: str) -> bool:
        """Mark a complaint as synced to MongoDB"""
        try:
            with _file_lock:
                complaints = self._read_all()
                updated = False
                
                for complaint in complaints:
                    if complaint.get("id") == complaint_id:
                        complaint["_sync_status"] = "synced"
                        complaint["_synced_at"] = datetime.utcnow().isoformat()
                        updated = True
                        break
                
                if updated:
                    with open(self.filepath, 'w', encoding='utf-8') as f:
                        json.dump(complaints, f, ensure_ascii=False, indent=2, default=str)
                    logger.info(f"Marked complaint as synced: {complaint_id}")
                
                return updated
                
        except Exception as e:
            logger.exception(f"Failed to mark complaint as synced: {e}")
            return False
    
    def sync_to_mongodb(self, mongodb_collection) -> Dict[str, Any]:
        """
        Sync pending complaints to MongoDB
        
        Args:
            mongodb_collection: PyMongo collection object
            
        Returns:
            Dict with 'synced_count' and 'failed_count'
        """
        pending = self.get_pending_sync()
        synced_count = 0
        failed_count = 0
        
        for complaint in pending:
            try:
                # Remove fallback metadata before inserting to MongoDB
                complaint_data = {k: v for k, v in complaint.items() 
                                if not k.startswith("_")}
                
                # Check if already exists in MongoDB
                existing = mongodb_collection.find_one({"id": complaint_data.get("id")})
                
                if not existing:
                    mongodb_collection.insert_one(complaint_data)
                    logger.info(f"Synced complaint to MongoDB: {complaint_data.get('id')}")
                
                self.mark_synced(complaint_data.get("id"))
                synced_count += 1
                
            except Exception as e:
                logger.error(f"Failed to sync complaint {complaint.get('id')}: {e}")
                failed_count += 1
        
        return {
            "synced_count": synced_count,
            "failed_count": failed_count,
            "pending_remaining": len(self.get_pending_sync())
        }
    
    def get_all_complaints(self) -> List[Dict[str, Any]]:
        """Get all stored complaints (for admin viewing when DB is down)"""
        with _file_lock:
            complaints = self._read_all()
            # Return without internal metadata
            return [{k: v for k, v in c.items() if not k.startswith("_")} 
                    for c in complaints]
    
    def get_complaint_by_id(self, complaint_id: str) -> Optional[Dict[str, Any]]:
        """Get a single complaint by ID"""
        with _file_lock:
            complaints = self._read_all()
            for complaint in complaints:
                if complaint.get("id") == complaint_id:
                    # Return without internal metadata
                    return {k: v for k, v in complaint.items() if not k.startswith("_")}
            return None
    
    def update_complaint_status(self, complaint_id: str, new_status: str) -> bool:
        """Update the status of a complaint in fallback storage"""
        try:
            with _file_lock:
                complaints = self._read_all()
                updated = False
                
                for complaint in complaints:
                    if complaint.get("id") == complaint_id:
                        complaint["status"] = new_status
                        updated = True
                        break
                
                if updated:
                    with open(self.filepath, 'w', encoding='utf-8') as f:
                        json.dump(complaints, f, ensure_ascii=False, indent=2, default=str)
                    logger.info(f"Updated complaint status in fallback: {complaint_id} -> {new_status}")
                
                return updated
                
        except Exception as e:
            logger.exception(f"Failed to update complaint status in fallback: {e}")
            return False


# Singleton instance
fallback_storage = FallbackStorage()


def save_complaint_fallback(complaint: Dict[str, Any]) -> bool:
    """Convenience function to save complaint to fallback storage"""
    return fallback_storage.save_complaint(complaint)


def sync_fallback_to_db(mongodb_collection) -> Dict[str, Any]:
    """Convenience function to sync fallback to MongoDB"""
    return fallback_storage.sync_to_mongodb(mongodb_collection)


def get_fallback_complaints() -> List[Dict[str, Any]]:
    """Convenience function to get all fallback complaints"""
    return fallback_storage.get_all_complaints()
