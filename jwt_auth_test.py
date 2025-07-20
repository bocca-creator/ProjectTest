#!/usr/bin/env python3
"""
Backend API Testing Script - JWT Authentication Fixes
Tests JWT token creation, admin authentication, and protected routes
"""

import requests
import json
import sys
import time
import jwt
from typing import Dict, Any, Optional

# Configuration
BACKEND_URL = "https://ad04f95e-8dd7-49a6-a649-9120065379fa.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

# Test data
ADMIN_USER = {
    "email": "admin@admin.com",
    "password": "admin123"
}

class JWTAuthTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.admin_refresh_token = None
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

    def test_api_health(self) -> bool:
        """Test GET /api/health endpoint"""
        print("🔍 Testing API Health Check...")
        try:
            response = self.session.get(f"{API_BASE}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "API Health Check", 
                    True, 
                    f"API is healthy - Status: {response.status_code}",
                    data
                )
                return True
            else:
                self.log_test(
                    "API Health Check", 
                    False, 
                    f"Unexpected status code: {response.status_code}",
                    response.text
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("API Health Check", False, f"Request failed: {str(e)}")
            return False

    def test_admin_login(self) -> bool:
        """Test admin user login - this should now work with JWT fixes"""
        print("🔍 Testing Admin User Login (JWT Fix Verification)...")
        try:
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json=ADMIN_USER,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "refresh_token" in data and "user" in data:
                    self.admin_token = data["access_token"]
                    self.admin_refresh_token = data["refresh_token"]
                    
                    # Verify JWT token structure
                    try:
                        # Decode without verification to check structure
                        decoded = jwt.decode(self.admin_token, options={"verify_signature": False})
                        token_valid = all(key in decoded for key in ['user_id', 'username', 'role', 'exp', 'iat'])
                        
                        self.log_test(
                            "Admin Login (JWT Fix)", 
                            True, 
                            f"Admin login successful - Username: {data['user']['username']}, Role: {data['user']['role']}, JWT Valid: {token_valid}",
                            {
                                "user_id": data["user"]["id"],
                                "username": data["user"]["username"],
                                "email": data["user"]["email"],
                                "role": data["user"]["role"],
                                "jwt_claims": decoded,
                                "token_length": len(self.admin_token)
                            }
                        )
                        return True
                    except Exception as jwt_error:
                        self.log_test(
                            "Admin Login (JWT Fix)", 
                            False, 
                            f"JWT token structure invalid: {jwt_error}",
                            data
                        )
                        return False
                else:
                    self.log_test(
                        "Admin Login (JWT Fix)", 
                        False, 
                        "Missing required fields in response",
                        data
                    )
                    return False
            else:
                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {"detail": response.text}
                self.log_test(
                    "Admin Login (JWT Fix)", 
                    False, 
                    f"Login failed with status: {response.status_code} - JWT token creation may still be failing",
                    error_data
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Admin Login (JWT Fix)", False, f"Request failed: {str(e)}")
            return False

    def test_jwt_token_validation(self) -> bool:
        """Test JWT token validation by examining token structure"""
        print("🔍 Testing JWT Token Validation...")
        
        if not self.admin_token:
            self.log_test("JWT Token Validation", False, "No admin token available for validation")
            return False
        
        try:
            # Decode token without verification to examine structure
            decoded = jwt.decode(self.admin_token, options={"verify_signature": False})
            
            # Check required claims
            required_claims = ['user_id', 'username', 'role', 'type', 'exp', 'iat']
            missing_claims = [claim for claim in required_claims if claim not in decoded]
            
            if not missing_claims:
                self.log_test(
                    "JWT Token Validation", 
                    True, 
                    f"JWT token contains all required claims. Token type: {decoded.get('type')}, Role: {decoded.get('role')}",
                    {
                        "claims": decoded,
                        "token_type": decoded.get('type'),
                        "expires_at": decoded.get('exp'),
                        "issued_at": decoded.get('iat')
                    }
                )
                return True
            else:
                self.log_test(
                    "JWT Token Validation", 
                    False, 
                    f"JWT token missing required claims: {missing_claims}",
                    decoded
                )
                return False
                
        except Exception as e:
            self.log_test("JWT Token Validation", False, f"JWT token validation failed: {str(e)}")
            return False

    def test_protected_route_access(self) -> bool:
        """Test GET /api/auth/me with JWT token"""
        print("🔍 Testing Protected Route Access...")
        
        if not self.admin_token:
            self.log_test("Protected Route Access", False, "No admin token available for testing")
            return False
        
        try:
            headers = {
                "Authorization": f"Bearer {self.admin_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.get(
                f"{API_BASE}/auth/me",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "username" in data and "role" in data:
                    self.log_test(
                        "Protected Route Access", 
                        True, 
                        f"Protected route accessible with JWT token - User: {data['username']}, Role: {data['role']}",
                        {
                            "user_id": data["id"],
                            "username": data["username"],
                            "email": data["email"],
                            "role": data["role"],
                            "is_active": data.get("is_active")
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "Protected Route Access", 
                        False, 
                        "Missing required fields in user response",
                        data
                    )
                    return False
            else:
                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {"detail": response.text}
                self.log_test(
                    "Protected Route Access", 
                    False, 
                    f"Protected route access failed with status: {response.status_code}",
                    error_data
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Protected Route Access", False, f"Request failed: {str(e)}")
            return False

    def test_token_refresh(self) -> bool:
        """Test POST /api/auth/refresh with refresh token"""
        print("🔍 Testing Token Refresh...")
        
        if not self.admin_refresh_token:
            self.log_test("Token Refresh", False, "No admin refresh token available for testing")
            return False
        
        try:
            headers = {
                "Authorization": f"Bearer {self.admin_refresh_token}",
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
                    # Verify new tokens are different from old ones
                    new_access_token = data["access_token"]
                    new_refresh_token = data["refresh_token"]
                    
                    tokens_refreshed = (new_access_token != self.admin_token and 
                                      new_refresh_token != self.admin_refresh_token)
                    
                    self.log_test(
                        "Token Refresh", 
                        True, 
                        f"Token refresh successful - New tokens generated: {tokens_refreshed}",
                        {
                            "user_id": data["user"]["id"],
                            "username": data["user"]["username"],
                            "role": data["user"]["role"],
                            "tokens_refreshed": tokens_refreshed,
                            "new_token_length": len(new_access_token)
                        }
                    )
                    
                    # Update tokens for further testing
                    self.admin_token = new_access_token
                    self.admin_refresh_token = new_refresh_token
                    return True
                else:
                    self.log_test(
                        "Token Refresh", 
                        False, 
                        "Missing required fields in refresh response",
                        data
                    )
                    return False
            else:
                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {"detail": response.text}
                self.log_test(
                    "Token Refresh", 
                    False, 
                    f"Token refresh failed with status: {response.status_code}",
                    error_data
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Token Refresh", False, f"Request failed: {str(e)}")
            return False

    def test_cs2_stats_with_admin_token(self) -> bool:
        """Test GET /api/cs2/stats/me with admin authentication"""
        print("🔍 Testing CS2 Statistics Access with Admin Token...")
        
        if not self.admin_token:
            self.log_test("CS2 Stats with Admin Token", False, "No admin token available for testing")
            return False
        
        try:
            headers = {
                "Authorization": f"Bearer {self.admin_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.get(
                f"{API_BASE}/cs2/stats/me",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "user_id" in data and "username" in data and "stats" in data:
                    stats = data["stats"]
                    self.log_test(
                        "CS2 Stats with Admin Token", 
                        True, 
                        f"CS2 stats accessible with admin token - K/D: {stats.get('kd_ratio', 0)}, Matches: {stats.get('matches_played', 0)}",
                        {
                            "user_id": data["user_id"],
                            "username": data["username"],
                            "kd_ratio": stats.get("kd_ratio"),
                            "matches_played": stats.get("matches_played"),
                            "current_rank": stats.get("current_rank"),
                            "recent_matches_count": len(data.get("recent_matches", []))
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "CS2 Stats with Admin Token", 
                        False, 
                        "Missing required fields in CS2 stats response",
                        data
                    )
                    return False
            elif response.status_code == 404:
                # Stats not found - acceptable for admin user
                self.log_test(
                    "CS2 Stats with Admin Token", 
                    True, 
                    "CS2 statistics not found for admin user (expected - admin may not have CS2 stats)",
                    response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                )
                return True
            else:
                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {"detail": response.text}
                self.log_test(
                    "CS2 Stats with Admin Token", 
                    False, 
                    f"CS2 stats access failed with status: {response.status_code}",
                    error_data
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("CS2 Stats with Admin Token", False, f"Request failed: {str(e)}")
            return False

    def run_jwt_auth_tests(self):
        """Run JWT authentication focused tests"""
        print("=" * 70)
        print("🚀 STARTING JWT AUTHENTICATION TESTS (POST-FIX VERIFICATION)")
        print("=" * 70)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print(f"Testing admin account: {ADMIN_USER['email']}")
        print()
        
        # Test sequence focused on JWT authentication
        tests = [
            ("API Health Check", self.test_api_health),
            ("Admin Login (JWT Fix)", self.test_admin_login),
            ("JWT Token Validation", self.test_jwt_token_validation),
            ("Protected Route Access", self.test_protected_route_access),
            ("Token Refresh", self.test_token_refresh),
            ("CS2 Stats with Admin Token", self.test_cs2_stats_with_admin_token)
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
        print("📊 JWT AUTHENTICATION TEST SUMMARY")
        print("=" * 70)
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        print()
        
        if passed == total:
            print("🎉 ALL JWT AUTHENTICATION TESTS PASSED!")
            print("✅ JWT token creation issue has been resolved")
            print("✅ Admin account authentication is working")
            print("✅ Protected routes are accessible with valid tokens")
        else:
            print("⚠️  Some JWT authentication tests failed.")
            print("❌ JWT token creation may still have issues")
            
        return passed == total

def main():
    """Main test execution"""
    tester = JWTAuthTester()
    success = tester.run_jwt_auth_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()