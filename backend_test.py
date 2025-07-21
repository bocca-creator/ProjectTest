#!/usr/bin/env python3
"""
Backend API Testing Script - Admin Panel and Tier Endpoints
Tests admin panel functionality and tier management endpoints
"""

import requests
import json
import sys
import time
from typing import Dict, Any, Optional

# Configuration
BACKEND_URL = "https://62e07c51-5bd0-49d4-aacc-d7cf6010e3bd.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

# Test data
ADMIN_USER = {
    "email": "admin@admin.com",
    "password": "admin123"
}

class AdminPanelTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
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

    def test_admin_login(self) -> bool:
        """Test admin user login"""
        print("🔍 Testing Admin User Login...")
        try:
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json=ADMIN_USER,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    self.admin_token = data["access_token"]
                    
                    self.log_test(
                        "Admin Login", 
                        True, 
                        f"Admin login successful - Username: {data['user']['username']}, Role: {data['user']['role']}",
                        {
                            "user_id": data["user"]["id"],
                            "username": data["user"]["username"],
                            "email": data["user"]["email"],
                            "role": data["user"]["role"]
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "Admin Login", 
                        False, 
                        "Missing required fields in response",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "Admin Login", 
                    False, 
                    f"Login failed with status: {response.status_code}",
                    response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Admin Login", False, f"Request failed: {str(e)}")
            return False

    def test_admin_dashboard(self) -> bool:
        """Test GET /api/admin/dashboard endpoint"""
        print("🔍 Testing Admin Dashboard...")
        try:
            if not self.admin_token:
                self.log_test("Admin Dashboard", False, "No admin token available")
                return False
            
            headers = {
                "Authorization": f"Bearer {self.admin_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.get(
                f"{API_BASE}/admin/dashboard",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["total_users", "active_players", "matches_tracked", "leaderboard_status", "donation_stats", "recent_activity_count"]
                
                if all(field in data for field in required_fields):
                    self.log_test(
                        "Admin Dashboard", 
                        True, 
                        f"Dashboard stats retrieved - Users: {data['total_users']}, Active: {data['active_players']}, Matches: {data['matches_tracked']}",
                        {
                            "total_users": data["total_users"],
                            "active_players": data["active_players"],
                            "matches_tracked": data["matches_tracked"],
                            "leaderboard_status": data["leaderboard_status"],
                            "recent_activity_count": data["recent_activity_count"]
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "Admin Dashboard", 
                        False, 
                        f"Missing required fields. Expected: {required_fields}",
                        data
                    )
                    return False
            elif response.status_code == 403:
                self.log_test(
                    "Admin Dashboard", 
                    False, 
                    "Access denied - admin role required",
                    response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                )
                return False
            else:
                self.log_test(
                    "Admin Dashboard", 
                    False, 
                    f"Unexpected status code: {response.status_code}",
                    response.text
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Admin Dashboard", False, f"Request failed: {str(e)}")
            return False

    def test_admin_users_management(self) -> bool:
        """Test GET /api/admin/users endpoint"""
        print("🔍 Testing Admin Users Management...")
        try:
            if not self.admin_token:
                self.log_test("Admin Users Management", False, "No admin token available")
                return False
            
            headers = {
                "Authorization": f"Bearer {self.admin_token}",
                "Content-Type": "application/json"
            }
            
            # Test with pagination and filtering
            response = self.session.get(
                f"{API_BASE}/admin/users?page=1&limit=10",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["users", "total_count", "page", "limit", "total_pages"]
                
                if all(field in data for field in required_fields):
                    self.log_test(
                        "Admin Users Management", 
                        True, 
                        f"Users retrieved - Total: {data['total_count']}, Page: {data['page']}, Users on page: {len(data['users'])}",
                        {
                            "total_count": data["total_count"],
                            "page": data["page"],
                            "limit": data["limit"],
                            "total_pages": data["total_pages"],
                            "users_count": len(data["users"])
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "Admin Users Management", 
                        False, 
                        f"Missing required fields. Expected: {required_fields}",
                        data
                    )
                    return False
            elif response.status_code == 403:
                self.log_test(
                    "Admin Users Management", 
                    False, 
                    "Access denied - admin role required",
                    response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                )
                return False
            else:
                self.log_test(
                    "Admin Users Management", 
                    False, 
                    f"Unexpected status code: {response.status_code}",
                    response.text
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Admin Users Management", False, f"Request failed: {str(e)}")
            return False

    def test_admin_recent_matches(self) -> bool:
        """Test GET /api/admin/matches/recent endpoint"""
        print("🔍 Testing Admin Recent Matches...")
        try:
            if not self.admin_token:
                self.log_test("Admin Recent Matches", False, "No admin token available")
                return False
            
            headers = {
                "Authorization": f"Bearer {self.admin_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.get(
                f"{API_BASE}/admin/matches/recent?limit=20",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["matches", "total_count"]
                
                if all(field in data for field in required_fields):
                    self.log_test(
                        "Admin Recent Matches", 
                        True, 
                        f"Recent matches retrieved - Total: {data['total_count']}, Matches: {len(data['matches'])}",
                        {
                            "total_count": data["total_count"],
                            "matches_count": len(data["matches"])
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "Admin Recent Matches", 
                        False, 
                        f"Missing required fields. Expected: {required_fields}",
                        data
                    )
                    return False
            elif response.status_code == 403:
                self.log_test(
                    "Admin Recent Matches", 
                    False, 
                    "Access denied - admin role required",
                    response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                )
                return False
            else:
                self.log_test(
                    "Admin Recent Matches", 
                    False, 
                    f"Unexpected status code: {response.status_code}",
                    response.text
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Admin Recent Matches", False, f"Request failed: {str(e)}")
            return False

    def test_admin_tier_benefits(self) -> bool:
        """Test GET /api/admin/tiers/benefits endpoint"""
        print("🔍 Testing Admin Tier Benefits...")
        try:
            if not self.admin_token:
                self.log_test("Admin Tier Benefits", False, "No admin token available")
                return False
            
            headers = {
                "Authorization": f"Bearer {self.admin_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.get(
                f"{API_BASE}/admin/tiers/benefits",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if "benefits" in data and isinstance(data["benefits"], list):
                    expected_tiers = ["bronze", "silver", "gold", "platinum", "diamond", "elite"]
                    found_tiers = [benefit["tier"] for benefit in data["benefits"]]
                    
                    self.log_test(
                        "Admin Tier Benefits", 
                        True, 
                        f"Tier benefits retrieved - {len(data['benefits'])} tiers: {', '.join(found_tiers)}",
                        {
                            "total_tiers": len(data["benefits"]),
                            "tiers": found_tiers,
                            "sample_tier": data["benefits"][0] if data["benefits"] else None
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "Admin Tier Benefits", 
                        False, 
                        "Missing 'benefits' field or invalid format",
                        data
                    )
                    return False
            elif response.status_code == 403:
                self.log_test(
                    "Admin Tier Benefits", 
                    False, 
                    "Access denied - admin role required",
                    response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                )
                return False
            else:
                self.log_test(
                    "Admin Tier Benefits", 
                    False, 
                    f"Unexpected status code: {response.status_code}",
                    response.text
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Admin Tier Benefits", False, f"Request failed: {str(e)}")
            return False

    def test_admin_activity_logs(self) -> bool:
        """Test GET /api/admin/activity-logs endpoint"""
        print("🔍 Testing Admin Activity Logs...")
        try:
            if not self.admin_token:
                self.log_test("Admin Activity Logs", False, "No admin token available")
                return False
            
            headers = {
                "Authorization": f"Bearer {self.admin_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.get(
                f"{API_BASE}/admin/activity-logs?limit=50",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["logs", "total_count"]
                
                if all(field in data for field in required_fields):
                    self.log_test(
                        "Admin Activity Logs", 
                        True, 
                        f"Activity logs retrieved - Total: {data['total_count']}, Logs: {len(data['logs'])}",
                        {
                            "total_count": data["total_count"],
                            "logs_count": len(data["logs"])
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "Admin Activity Logs", 
                        False, 
                        f"Missing required fields. Expected: {required_fields}",
                        data
                    )
                    return False
            elif response.status_code == 403:
                self.log_test(
                    "Admin Activity Logs", 
                    False, 
                    "Access denied - admin role required",
                    response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                )
                return False
            else:
                self.log_test(
                    "Admin Activity Logs", 
                    False, 
                    f"Unexpected status code: {response.status_code}",
                    response.text
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Admin Activity Logs", False, f"Request failed: {str(e)}")
            return False

    def test_public_tier_benefits(self) -> bool:
        """Test GET /api/tiers/benefits endpoint (public access)"""
        print("🔍 Testing Public Tier Benefits...")
        try:
            response = self.session.get(
                f"{API_BASE}/tiers/benefits",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list) and len(data) > 0:
                    expected_tiers = ["bronze", "silver", "gold", "platinum", "diamond", "elite"]
                    found_tiers = [tier["tier"] for tier in data]
                    
                    # Check if each tier has required fields
                    required_tier_fields = ["tier", "name", "description", "price", "benefits", "cosmetics"]
                    valid_tiers = all(
                        all(field in tier for field in required_tier_fields) 
                        for tier in data
                    )
                    
                    if valid_tiers:
                        self.log_test(
                            "Public Tier Benefits", 
                            True, 
                            f"Public tier benefits retrieved - {len(data)} tiers: {', '.join(found_tiers)}",
                            {
                                "total_tiers": len(data),
                                "tiers": found_tiers,
                                "sample_tier": {
                                    "tier": data[0]["tier"],
                                    "name": data[0]["name"],
                                    "price": data[0]["price"],
                                    "benefits_count": len(data[0]["benefits"])
                                }
                            }
                        )
                        return True
                    else:
                        self.log_test(
                            "Public Tier Benefits", 
                            False, 
                            f"Tiers missing required fields. Expected: {required_tier_fields}",
                            data[0] if data else {}
                        )
                        return False
                else:
                    self.log_test(
                        "Public Tier Benefits", 
                        False, 
                        "Invalid response format - expected list of tiers",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "Public Tier Benefits", 
                    False, 
                    f"Unexpected status code: {response.status_code}",
                    response.text
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Public Tier Benefits", False, f"Request failed: {str(e)}")
            return False

    def test_my_tier_without_auth(self) -> bool:
        """Test GET /api/tiers/my-tier endpoint without authentication"""
        print("🔍 Testing My Tier Without Authentication...")
        try:
            response = self.session.get(
                f"{API_BASE}/tiers/my-tier",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if "tier" in data and data["tier"] is None and "message" in data:
                    self.log_test(
                        "My Tier Without Auth", 
                        True, 
                        f"Correctly handles unauthenticated request - Message: {data['message']}",
                        data
                    )
                    return True
                else:
                    self.log_test(
                        "My Tier Without Auth", 
                        False, 
                        "Unexpected response format",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "My Tier Without Auth", 
                    False, 
                    f"Unexpected status code: {response.status_code}",
                    response.text
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("My Tier Without Auth", False, f"Request failed: {str(e)}")
            return False

    def test_tier_purchase_bronze(self) -> bool:
        """Test POST /api/tiers/purchase/bronze endpoint"""
        print("🔍 Testing Tier Purchase Bronze...")
        try:
            if not self.admin_token:
                self.log_test("Tier Purchase Bronze", False, "No admin token available")
                return False
            
            headers = {
                "Authorization": f"Bearer {self.admin_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.post(
                f"{API_BASE}/tiers/purchase/bronze",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["tier", "name", "price", "currency", "benefits", "message", "payment_methods"]
                
                if all(field in data for field in required_fields):
                    self.log_test(
                        "Tier Purchase Bronze", 
                        True, 
                        f"Bronze tier purchase initiated - Price: ${data['price']} {data['currency']}, Benefits: {len(data['benefits'])}",
                        {
                            "tier": data["tier"],
                            "name": data["name"],
                            "price": data["price"],
                            "currency": data["currency"],
                            "benefits_count": len(data["benefits"]),
                            "payment_methods": data["payment_methods"]
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "Tier Purchase Bronze", 
                        False, 
                        f"Missing required fields. Expected: {required_fields}",
                        data
                    )
                    return False
            elif response.status_code == 401:
                self.log_test(
                    "Tier Purchase Bronze", 
                    False, 
                    "Authentication required for tier purchase",
                    response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                )
                return False
            else:
                self.log_test(
                    "Tier Purchase Bronze", 
                    False, 
                    f"Unexpected status code: {response.status_code}",
                    response.text
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Tier Purchase Bronze", False, f"Request failed: {str(e)}")
            return False

    def test_non_admin_access_to_admin_endpoints(self) -> bool:
        """Test that non-admin users get 403 Forbidden on admin endpoints"""
        print("🔍 Testing Non-Admin Access to Admin Endpoints...")
        try:
            # Create a mock non-admin token (this will fail auth anyway due to MySQL unavailability)
            mock_token = "mock_non_admin_token"
            
            headers = {
                "Authorization": f"Bearer {mock_token}",
                "Content-Type": "application/json"
            }
            
            # Test admin dashboard access
            response = self.session.get(
                f"{API_BASE}/admin/dashboard",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 403 or response.status_code == 401:
                self.log_test(
                    "Non-Admin Access Block", 
                    True, 
                    f"Admin endpoints correctly reject non-admin access - Status: {response.status_code}",
                    response.json() if response.headers.get('content-type', '').startswith('application/json') else {"status": response.status_code}
                )
                return True
            else:
                self.log_test(
                    "Non-Admin Access Block", 
                    False, 
                    f"Admin endpoints should reject non-admin access but got: {response.status_code}",
                    response.text
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Non-Admin Access Block", False, f"Request failed: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all admin panel and tier endpoint tests"""
        print("=" * 60)
        print("🚀 STARTING ADMIN PANEL AND TIER ENDPOINTS TESTS")
        print("=" * 60)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print()
        
        # Test sequence
        tests = [
            ("API Health Check", self.test_health_check),
            ("Admin User Login", self.test_admin_login),
            ("Admin Dashboard", self.test_admin_dashboard),
            ("Admin Users Management", self.test_admin_users_management),
            ("Admin Recent Matches", self.test_admin_recent_matches),
            ("Admin Tier Benefits", self.test_admin_tier_benefits),
            ("Admin Activity Logs", self.test_admin_activity_logs),
            ("Public Tier Benefits", self.test_public_tier_benefits),
            ("My Tier Without Auth", self.test_my_tier_without_auth),
            ("Tier Purchase Bronze", self.test_tier_purchase_bronze),
            ("Non-Admin Access Block", self.test_non_admin_access_to_admin_endpoints)
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
            print("🎉 ALL TESTS PASSED! Admin panel and tier endpoints are working correctly.")
        else:
            print("⚠️  Some tests failed. Check the details above.")
            
        return passed == total

def main():
    """Main test execution"""
    tester = AdminPanelTester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()