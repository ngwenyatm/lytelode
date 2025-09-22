from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Allow requests from the frontend development server
CORS(app, origins=["http://localhost:3000","https://lytelode-2.onrender.com"])

# Configuration - get API key from environment
ESKOM_API_KEY = os.environ.get('ESKOM_API_KEY')
ESKOM_BASE_URL = "https://developer.sepush.co.za/business/2.0"

# Let the user know if API key isn't set up properly
if not ESKOM_API_KEY or ESKOM_API_KEY == 'your_eskom_api_key_here':
    print("Heads up: Looks like your Eskom API key isn't configured yet.")
    print("You'll need to set ESKOM_API_KEY in your .env file for this to work properly.")

def make_eskom_request(endpoint, params=None):
    """Helper function to make requests to the Eskom API with error handling"""
    if not ESKOM_API_KEY or ESKOM_API_KEY == 'your_eskom_api_key_here':
        return None, "API key not configured"
    
    try:
        response = requests.get(
            f"{ESKOM_BASE_URL}/{endpoint}",
            params=params,
            headers={"token": ESKOM_API_KEY},
            timeout=10  # Add timeout to prevent hanging requests
        )
        response.raise_for_status()  # Raise exception for bad status codes
        return response.json(), None
    except requests.exceptions.RequestException as e:
        return None, f"API request failed: {str(e)}"
    except ValueError as e:
        return None, f"Failed to parse API response: {str(e)}"

@app.route('/api/status', methods=['GET'])
def get_national_status():
    """Get the current national loadshedding status"""
    data, error = make_eskom_request("status")
    
    if error:
        return jsonify({
            "error": error,
            "status": {
                "eskom_stage": 0,
                "timestamp": datetime.now().isoformat(),
                "note": "Falling back to default due to API error"
            }
        }), 500 if "API key" not in error else 503
    
    # Extract the relevant information from the response
    status_info = data.get("status", {}).get("eskom", {})
    stage = status_info.get("stage", 0)
    updated = status_info.get("stage_updated", datetime.now().isoformat())
    
    return jsonify({
        "status": {
            "eskom_stage": stage,
            "timestamp": updated
        }
    })

@app.route('/api/area/search', methods=['GET'])
def search_areas():
    """Search for Eskom areas by name"""
    search_text = request.args.get('q', '')
    
    if not search_text or len(search_text.strip()) < 3:
        return jsonify({
            "error": "Search query must be at least 3 characters long",
            "areas": []
        }), 400
    
    data, error = make_eskom_request("areas_search", {"text": search_text})
    
    if error:
        return jsonify({
            "error": error,
            "areas": []
        }), 500
    
    return jsonify({
        "areas": data.get("areas", []),
        "search_query": search_text
    })

@app.route('/api/area/<area_id>', methods=['GET'])
def get_area_info(area_id):
    """Get loadshedding schedule for a specific area"""
    if not area_id:
        return jsonify({"error": "Area ID is required"}), 400
    
    data, error = make_eskom_request("area", {"id": area_id})
    
    if error:
        return jsonify({"error": error}), 500
    
    # Simplify the response for the frontend
    events = data.get("events", [])
    info = data.get("info", {})
    
    return jsonify({
        "area_name": info.get("name", "Unknown Area"),
        "region": info.get("region", "Unknown Region"),
        "schedule": events,
        "last_updated": datetime.now().isoformat()
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "api_configured": bool(ESKOM_API_KEY and ESKOM_API_KEY != 'your_eskom_api_key_here')
    })

# Basic error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    print("Starting Eskom Loadshedding API Server...")
    print(f"API Key configured: {bool(ESKOM_API_KEY and ESKOM_API_KEY != 'your_eskom_api_key_here')}")
    app.run(debug=True, port=5000)