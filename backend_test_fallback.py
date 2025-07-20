#!/usr/bin/env python3
"""
Comprehensive Authentication System Test
Tests the authentication system with MySQL fallback behavior
"""

import requests
import json
import sys
import time

# Configuration
BACKEND_URL = "https://dd4b5807-b8ef-4fdb-89f6-54213177b758.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class AuthSystemTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []

    def log_test(self, test_name: str, success: bool, details: str = "", response_data: any = None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data:
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
                mysql_status = data.get("mysql", "unknown")
                mongodb_status = data.get("mongodb", "unknown")
                
                self.log_test(
                    "API Health Check", 
                    True, 
                    f"API is healthy - MySQL: {mysql_status}, MongoDB: {mongodb_status}",
                    data
                )
                return True
            else:
                self.log_test(
                    "API Health Check", 
                    False, 
                    f"Health check failed with status: {response.status_code}",
                    response.text
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("API Health Check", False, f"Request failed: {str(e)}")
            return False

    def test_registration_fallback(self) -> bool:
        """Test user registration with MySQL unavailable (expected to fail gracefully)"""
        print("🔍 Testing User Registration Fallback Behavior...")
        
        test_user = {
            "username": "gamemaster2024",
            "email": "gamemaster@steamthemes.com",
            "password": "SecurePass123!",
            "display_name": "Game Master",
            "language": "en"
        }
        
        try:
            response = self.session.post(
                f"{API_BASE}/auth/register",
                json=test_user,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            # With MySQL unavailable, registration should fail gracefully
            if response.status_code == 500:
                data = response.json()
                if data.get("detail") == "Failed to create user":
                    self.log_test(
                        "Registration Fallback", 
                        True, 
                        "Registration correctly failed when MySQL is unavailable (graceful fallback)",
                        {"status_code": response.status_code, "detail": data.get("detail")}
                    )
                    return True
                else:
                    self.log_test(
                        "Registration Fallback", 
                        False, 
                        f"Unexpected error message: {data.get('detail')}",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "Registration Fallback", 
                    False, 
                    f"Unexpected status code: {response.status_code} (expected 500 with MySQL unavailable)",
                    response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Registration Fallback", False, f"Request failed: {str(e)}")
            return False

    def test_login_fallback(self) -> bool:
        """Test user login with MySQL unavailable (expected to fail gracefully)"""
        print("🔍 Testing User Login Fallback Behavior...")
        
        login_data = {
            "email": "gamemaster@steamthemes.com",
            "password": "SecurePass123!"
        }
        
        try:
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            # With MySQL unavailable, login should fail gracefully
            if response.status_code == 401:
                data = response.json()
                if data.get("detail") == "Invalid email or password":
                    self.log_test(
                        "Login Fallback", 
                        True, 
                        "Login correctly failed when MySQL is unavailable (graceful fallback)",
                        {"status_code": response.status_code, "detail": data.get("detail")}
                    )
                    return True
                else:
                    self.log_test(
                        "Login Fallback", 
                        False, 
                        f"Unexpected error message: {data.get('detail')}",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "Login Fallback", 
                    False, 
                    f"Unexpected status code: {response.status_code} (expected 401 with MySQL unavailable)",
                    response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Login Fallback", False, f"Request failed: {str(e)}")
            return False

    def test_protected_route_without_token(self) -> bool:
        """Test protected route without authentication token"""
        print("🔍 Testing Protected Route Without Token...")
        
        try:
            response = self.session.get(f"{API_BASE}/auth/me", timeout=10)
            
            # Should return 403 or 401 without authentication
            if response.status_code in [401, 403]:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {"detail": response.text}
                self.log_test(
                    "Protected Route (No Token)", 
                    True, 
                    f"Correctly rejected request without token (status: {response.status_code})",
                    {"status_code": response.status_code, "detail": data.get("detail", "No detail")}
                )
                return True
            else:
                self.log_test(
                    "Protected Route (No Token)", 
                    False, 
                    f"Unexpected status code: {response.status_code} (expected 401 or 403)",
                    response.text
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Protected Route (No Token)", False, f"Request failed: {str(e)}")
            return False

    def test_refresh_without_token(self) -> bool:
        """Test token refresh without refresh token"""
        print("🔍 Testing Token Refresh Without Token...")
        
        try:
            response = self.session.post(f"{API_BASE}/auth/refresh", timeout=10)
            
            # Should return 403 or 401 without refresh token
            if response.status_code in [401, 403]:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {"detail": response.text}
                self.log_test(
                    "Token Refresh (No Token)", 
                    True, 
                    f"Correctly rejected refresh request without token (status: {response.status_code})",
                    {"status_code": response.status_code, "detail": data.get("detail", "No detail")}
                )
                return True
            else:
                self.log_test(
                    "Token Refresh (No Token)", 
                    False, 
                    f"Unexpected status code: {response.status_code} (expected 401 or 403)",
                    response.text
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Token Refresh (No Token)", False, f"Request failed: {str(e)}")
            return False

    def test_api_root(self) -> bool:
        """Test API root endpoint"""
        print("🔍 Testing API Root Endpoint...")
        
        try:
            response = self.session.get(f"{API_BASE}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "status" in data:
                    self.log_test(
                        "API Root", 
                        True, 
                        f"API root accessible - Message: {data.get('message')}",
                        data
                    )
                    return True
                else:
                    self.log_test(
                        "API Root", 
                        False, 
                        "Missing expected fields in root response",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "API Root", 
                    False, 
                    f"API root failed with status: {response.status_code}",
                    response.text
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("API Root", False, f"Request failed: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all authentication system tests"""
        print("=" * 70)
        print("🚀 AUTHENTICATION SYSTEM FALLBACK TESTING")
        print("=" * 70)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print("Note: MySQL is unavailable - testing graceful fallback behavior")
        print()
        
        # Test sequence
        tests = [
            ("API Health Check", self.test_health_check),
            ("API Root Endpoint", self.test_api_root),
            ("Registration Fallback", self.test_registration_fallback),
            ("Login Fallback", self.test_login_fallback),
            ("Protected Route (No Token)", self.test_protected_route_without_token),
            ("Token Refresh (No Token)", self.test_refresh_without_token)
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
        print("=" * 70)
        print("📊 TEST SUMMARY")
        print("=" * 70)
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        print()
        
        if passed == total:
            print("🎉 ALL TESTS PASSED!")
            print("✅ Authentication system correctly handles MySQL unavailability")
            print("✅ All endpoints respond appropriately with graceful fallback")
        else:
            print("⚠️  Some tests failed. Check the details above.")
            
        return passed == total

def main():
    """Main test execution"""
    tester = AuthSystemTester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()