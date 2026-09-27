#!/usr/bin/env python3
"""
NIRIKSHAK AI — Administrative User Provisioning Utility
Creates backend-authoritative accounts with assigned roles and data scopes.

Usage example:
    python scripts/create_user.py --email nodal.kar@nic.in --name "Shri K. Sharma" --role STATE_NODAL_AUTHORITY --scope-type STATE --state Karnataka
"""
import sys
import os
import argparse
import getpass

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.auth.roles import VALID_ROLES, VALID_SCOPE_TYPES
from src.auth.auth_service import provision_user

def main():
    parser = argparse.ArgumentParser(description="NIRIKSHAK AI User Account Provisioning")
    parser.add_argument("--email", required=True, help="User email address")
    parser.add_argument("--name", required=True, help="Full name of user")
    parser.add_argument("--role", required=True, choices=list(sorted(VALID_ROLES)), help="Authoritative backend role")
    parser.add_argument("--password", required=False, help="Password (prompted securely if omitted)")
    parser.add_argument("--scope-type", default="NATIONAL", choices=list(sorted(VALID_SCOPE_TYPES)), help="Assigned data scope type")
    parser.add_argument("--state", required=False, help="State restriction for STATE or DISTRICT scope")
    parser.add_argument("--district", required=False, help="District restriction for DISTRICT scope")
    parser.add_argument("--constituency", required=False, help="Constituency restriction for CONSTITUENCY scope")
    parser.add_argument("--mp-name", required=False, help="MP name restriction")
    parser.add_argument("--designation", required=False, help="Official designation / title")
    parser.add_argument("--phone", required=False, help="Official contact phone number")
    parser.add_argument("--inactive", action="store_true", help="Provision as deactivated account")
    parser.add_argument("--completed-onboarding", action="store_true", help="Mark onboarding as already completed")

    args = parser.parse_args()

    password = args.password
    if not password:
        password = getpass.getpass("Enter secure password: ")
        password_confirm = getpass.getpass("Confirm password: ")
        if password != password_confirm:
            print("Error: Passwords do not match.", file=sys.stderr)
            sys.exit(1)

    if len(password) < 8:
        print("Error: Password must be at least 8 characters long.", file=sys.stderr)
        sys.exit(1)

    try:
        user_info = provision_user(
            email=args.email,
            password=password,
            full_name=args.name,
            role=args.role,
            scope_type=args.scope_type,
            state=args.state,
            district=args.district,
            constituency=args.constituency,
            mp_name=args.mp_name,
            designation=args.designation,
            phone=args.phone,
            is_active=not args.inactive,
            onboarding_completed=args.completed_onboarding
        )
        print("\n=== User Successfully Provisioned ===")
        print(f"User ID:             {user_info['user_id']}")
        print(f"Email:               {user_info['email']}")
        print(f"Full Name:           {user_info['full_name']}")
        print(f"Authoritative Role:  {user_info['role']}")
        print(f"Assigned Scope:      {user_info['scope']['scope_type']}")
        if user_info['scope']['state']:
            print(f"Scope State:         {user_info['scope']['state']}")
        if user_info['scope']['constituency']:
            print(f"Scope Constituency:  {user_info['scope']['constituency']}")
        print(f"Recommended Portal:  {user_info['recommended_portal']}")
        print(f"Active Status:       {user_info['is_active']}")
        print(f"Onboarding Complete: {user_info['onboarding_completed']}")
        print("=====================================\n")
    except Exception as e:
        print(f"Error provisioning user: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
