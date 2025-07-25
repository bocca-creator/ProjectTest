#!/usr/bin/env python3
"""
Simple test to debug registration issue
"""

import requests
import json

BACKEND_URL = "https://65093b44-8e47-49ff-b422-ada7036c720f.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

# Test data
TEST_USER = {
    "username": "gamemaster2024",
    "email": "gamemaster@steamthemes.com",
    "password": "SecurePass123!",
    "display_name": "Game Master",
    "language": "en"
}

def test_registration():
    print("Testing registration with detailed error info...")
    try:
        response = requests.post(
            f"{API_BASE}/auth/register",
            json=TEST_USER,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        try:
            data = response.json()
            print(f"Response JSON: {json.dumps(data, indent=2)}")
        except:
            print(f"Response Text: {response.text}")
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_registration()