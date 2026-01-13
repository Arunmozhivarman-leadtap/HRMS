import requests
import sys

BASE_URL = "http://localhost:8000/api"

def test_settings():
    # Login as Super Admin (assuming demo@leadtap.com is super admin from seeds)
    print("Attempting login...")
    # OAuth2 Password flow usually expects form data
    login_res = requests.post(f"{BASE_URL}/auth/login", data={"username": "demo@leadtap.com", "password": "password123"})
    if login_res.status_code != 200:
        print(f"Login failed: {login_res.text}")
        return
    
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Test Company Settings GET
    print("Testing GET /settings/company...")
    res = requests.get(f"{BASE_URL}/settings/company", headers=headers)
    print(f"Status: {res.status_code}, Data: {res.json()}")
    
    # 2. Test Company Settings PATCH
    print("Testing PATCH /settings/company...")
    patch_data = {"company_name": "LeadTap Digi Solutions Private Limited", "gst_number": "27AAAAA0000A1Z5"}
    res = requests.patch(f"{BASE_URL}/settings/company", json=patch_data, headers=headers)
    print(f"Status: {res.status_code}, Updated Name: {res.json().get('company_name')}")
    
    # 3. Test Master Data - Departments
    print("Testing POST /settings/departments...")
    dept_data = {"name": "Test Engineering", "description": "Automated test dept"}
    res = requests.post(f"{BASE_URL}/settings/departments", json=dept_data, headers=headers)
    print(f"Status: {res.status_code}, Dept Created: {res.json().get('name')}")
    
    print("Testing GET /settings/departments...")
    res = requests.get(f"{BASE_URL}/settings/departments", headers=headers)
    print(f"Status: {res.status_code}, Count: {len(res.json())}")

if __name__ == "__main__":
    test_settings()
