import requests
import sys

BASE_URL = "http://localhost:8000/api"

def test_role_access():
    session = requests.Session()

    # 1. Test Employee Access (Should Fail for Pending Approvals)
    print("Testing Employee Access...")
    login_payload = {"email": "employee@leadtap.in", "password": "LU1In49s4qvE"}
    response = session.post(f"{BASE_URL}/auth/login", json=login_payload)
    
    if response.status_code != 200:
        print(f"Employee login failed: {response.text}")
        return

    print("Employee logged in.")
    
    # Try to access pending approvals (Should match logic in backend/api/leaves.py)
    response = session.get(f"{BASE_URL}/leaves/approvals/pending")
    if response.status_code == 403:
        print("PASS: Employee correctly denied access to pending approvals (403).")
    else:
        print(f"FAIL: Employee accessed pending approvals with status {response.status_code}")

    # 2. Test Manager Access (Should Succeed)
    print("\nTesting Manager Access...")
    session = requests.Session() # New session
    login_payload = {"email": "manager@leadtap.in", "password": "2EbOYDsh1ela"}
    response = session.post(f"{BASE_URL}/auth/login", json=login_payload)

    if response.status_code != 200:
        print(f"Manager login failed: {response.text}")
        return

    print("Manager logged in.")

    # Check /me endpoint
    response = session.get(f"{BASE_URL}/auth/me")
    if response.status_code == 200:
        data = response.json()
        if data["role"] == "manager":
            print("PASS: /auth/me returned correct role 'manager'.")
        else:
            print(f"FAIL: /auth/me returned wrong role: {data['role']}")
    else:
        print(f"FAIL: /auth/me failed with status {response.status_code}")

    # Try to access pending approvals
    response = session.get(f"{BASE_URL}/leaves/approvals/pending")
    if response.status_code == 200:
        print("PASS: Manager successfully accessed pending approvals (200).")
    else:
        print(f"FAIL: Manager failed to access pending approvals with status {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    try:
        test_role_access()
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to backend. Is it running on port 8000?")
