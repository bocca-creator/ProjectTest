#!/usr/bin/env python3
"""
Backend API Testing Script for Authentication System
Tests all authentication endpoints with proper error handling
"""

import requests
import json
import sys
import time
from typing import Dict, Any, Optional

# Configuration
BACKEND_URL = "https://be2311f2-2fb9-4ae3-a14a-6273362942a0.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

# Test data
TEST_USER = {
    "username": "gamemaster2024",
    "email": "gamemaster@steamthemes.com",
    "password": "SecurePass123!",
    "display_name": "Game Master",
    "language": "en"
}

class AuthTester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.refresh_token = None
        self.user_data = None
        self.test_results = []

    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and isinstance(response_data, dict):
            print(f"   Response: {json.dumps(response_data, indent=2, default=str)}")
        print()
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response": response_data
        })

    def test_health_check(self) -> bool:
        """Test GET /api/health endpoint"""
        print("🔍 Testing API Health Check...")
        try:
            response = self.session.get(f"{API_BASE}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "Health Check", 
                    True, 
                    f"API is healthy - Status: {response.status_code}",
                    data
                )
                return True
            else:
                self.log_test(
                    "Health Check", 
                    False, 
                    f"Unexpected status code: {response.status_code}",
                    response.text
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Health Check", False, f"Request failed: {str(e)}")
            return False

    def test_user_registration(self) -> bool:
        """Test POST /api/auth/register endpoint"""
        print("🔍 Testing User Registration...")
        try:
            response = self.session.post(
                f"{API_BASE}/auth/register",
                json=TEST_USER,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "refresh_token" in data and "user" in data:
                    self.access_token = data["access_token"]
                    self.refresh_token = data["refresh_token"]
                    self.user_data = data["user"]
                    
                    self.log_test(
                        "User Registration", 
                        True, 
                        f"User registered successfully - Username: {data['user']['username']}",
                        {
                            "user_id": data["user"]["id"],
                            "username": data["user"]["username"],
                            "email": data["user"]["email"],
                            "role": data["user"]["role"],
                            "token_type": data.get("token_type", "bearer"),
                            "expires_in": data.get("expires_in", 900)
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "User Registration", 
                        False, 
                        "Missing required fields in response",
                        data
                    )
                    return False
            elif response.status_code == 400:
                # User might already exist, try to continue with login
                self.log_test(
                    "User Registration", 
                    True, 
                    "User already exists (expected behavior)",
                    response.json()
                )
                return True
            else:
                self.log_test(
                    "User Registration", 
                    False, 
                    f"Registration failed with status: {response.status_code}",
                    response.text
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("User Registration", False, f"Request failed: {str(e)}")
            return False

    def test_user_login(self) -> bool:
        """Test POST /api/auth/login endpoint"""
        print("🔍 Testing User Login...")
        try:
            login_data = {
                "email": TEST_USER["email"],
                "password": TEST_USER["password"]
            }
            
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "refresh_token" in data and "user" in data:
                    self.access_token = data["access_token"]
                    self.refresh_token = data["refresh_token"]
                    self.user_data = data["user"]
                    
                    self.log_test(
                        "User Login", 
                        True, 
                        f"Login successful - Username: {data['user']['username']}",
                        {
                            "user_id": data["user"]["id"],
                            "username": data["user"]["username"],
                            "email": data["user"]["email"],
                            "role": data["user"]["role"],
                            "login_count": data["user"]["login_count"],
                            "token_type": data.get("token_type", "bearer"),
                            "expires_in": data.get("expires_in", 900)
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "User Login", 
                        False, 
                        "Missing required fields in response",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "User Login", 
                    False, 
                    f"Login failed with status: {response.status_code}",
                    response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("User Login", False, f"Request failed: {str(e)}")
            return False

    def test_protected_route(self) -> bool:
        """Test GET /api/auth/me endpoint (protected route)"""
        print("🔍 Testing Protected Route (/api/auth/me)...")
        
        if not self.access_token:
            self.log_test("Protected Route", False, "No access token available")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.get(
                f"{API_BASE}/auth/me",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "username" in data and "email" in data:
                    self.log_test(
                        "Protected Route", 
                        True, 
                        f"User info retrieved - Username: {data['username']}",
                        {
                            "user_id": data["id"],
                            "username": data["username"],
                            "email": data["email"],
                            "role": data["role"],
                            "is_active": data["is_active"],
                            "login_count": data["login_count"]
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "Protected Route", 
                        False, 
                        "Missing required user fields in response",
                        data
                    )
                    return False
            elif response.status_code == 401:
                self.log_test(
                    "Protected Route", 
                    False, 
                    "Authentication failed - Invalid or expired token",
                    response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                )
                return False
            else:
                self.log_test(
                    "Protected Route", 
                    False, 
                    f"Unexpected status code: {response.status_code}",
                    response.text
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Protected Route", False, f"Request failed: {str(e)}")
            return False

    def test_token_refresh(self) -> bool:
        """Test POST /api/auth/refresh endpoint"""
        print("🔍 Testing Token Refresh...")
        
        if not self.refresh_token:
            self.log_test("Token Refresh", False, "No refresh token available")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.refresh_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.post(
                f"{API_BASE}/auth/refresh",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "refresh_token" in data and "user" in data:
                    # Update tokens
                    old_access_token = self.access_token
                    self.access_token = data["access_token"]
                    self.refresh_token = data["refresh_token"]
                    
                    self.log_test(
                        "Token Refresh", 
                        True, 
                        f"Tokens refreshed successfully - User: {data['user']['username']}",
                        {
                            "user_id": data["user"]["id"],
                            "username": data["user"]["username"],
                            "token_changed": old_access_token != self.access_token,
                            "token_type": data.get("token_type", "bearer"),
                            "expires_in": data.get("expires_in", 900)
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "Token Refresh", 
                        False, 
                        "Missing required fields in refresh response",
                        data
                    )
                    return False
            elif response.status_code == 401:
                self.log_test(
                    "Token Refresh", 
                    False, 
                    "Refresh token invalid or expired",
                    response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                )
                return False
            else:
                self.log_test(
                    "Token Refresh", 
                    False, 
                    f"Unexpected status code: {response.status_code}",
                    response.text
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Token Refresh", False, f"Request failed: {str(e)}")
            return False

    def test_protected_route_after_refresh(self) -> bool:
        """Test protected route with refreshed token"""
        print("🔍 Testing Protected Route with Refreshed Token...")
        return self.test_protected_route()

    def run_all_tests(self):
        """Run all authentication tests"""
        print("=" * 60)
        print("🚀 STARTING AUTHENTICATION SYSTEM TESTS")
        print("=" * 60)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print()
        
        # Test sequence
        tests = [
            ("Health Check", self.test_health_check),
            ("User Registration", self.test_user_registration),
            ("User Login", self.test_user_login),
            ("Protected Route", self.test_protected_route),
            ("Token Refresh", self.test_token_refresh),
            ("Protected Route (After Refresh)", self.test_protected_route_after_refresh)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
                time.sleep(0.5)  # Small delay between tests
            except Exception as e:
                self.log_test(test_name, False, f"Test execution error: {str(e)}")
        
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        print()
        
        if passed == total:
            print("🎉 ALL TESTS PASSED! Authentication system is working correctly.")
        else:
            print("⚠️  Some tests failed. Check the details above.")
            
        return passed == total

def main():
    """Main test execution"""
    tester = AuthTester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()