#!/usr/bin/env python
"""
Database initialization and seeding script for CampusHire
Run this after starting the backend to populate initial data
"""

import asyncio
import sys
from datetime import datetime, timedelta
import uuid

sys.path.insert(0, '/workspaces/CampusHire/Backend')

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import engine, SessionLocal
from app.models.base import Base
from app.models.roles import Role
from app.models.user import User
from app.models.departments import Department
from app.core.security import hash_password


async def init_db():
    """Initialize database with tables and seed data"""
    
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    print("✓ Tables created successfully")


async def seed_roles(db: AsyncSession):
    """Seed default roles"""
    
    roles_data = [
        {"name": "ADMIN", "description": "Administrator"},
        {"name": "STUDENT", "description": "Student"},
        {"name": "RECRUITER", "description": "Company Recruiter"},
        {"name": "COMPANY", "description": "Company"},
        {"name": "TPO", "description": "Training & Placement Officer"},
    ]
    
    for role_data in roles_data:
        existing = await db.execute(
            f"SELECT * FROM roles WHERE name = '{role_data['name']}'"
        )
        # Create role if not exists
        try:
            role = Role(
                id=uuid.uuid4(),
                name=role_data["name"],
                description=role_data["description"],
            )
            db.add(role)
        except:
            pass  # Role already exists
    
    await db.commit()
    print("✓ Roles seeded successfully")


async def seed_departments(db: AsyncSession):
    """Seed departments"""
    
    departments_data = [
        "Computer Science",
        "Electronics & Communication",
        "Mechanical Engineering",
        "Civil Engineering",
        "Electrical Engineering",
    ]
    
    for dept_name in departments_data:
        try:
            dept = Department(
                id=uuid.uuid4(),
                name=dept_name,
                description=f"{dept_name} Department",
            )
            db.add(dept)
        except:
            pass  # Department already exists
    
    await db.commit()
    print("✓ Departments seeded successfully")


async def seed_test_data(db: AsyncSession):
    """Seed test data"""
    
    print("\n--- Seeding Test Data ---")
    
    # Check if data already exists
    existing_users = await db.execute("SELECT COUNT(*) FROM users")
    if existing_users and existing_users.scalar() > 0:
        print("✓ Test data already exists, skipping...")
        return
    
    try:
        # Get roles
        student_role_result = await db.execute(
            "SELECT id FROM roles WHERE name = 'STUDENT' LIMIT 1"
        )
        recruiter_role_result = await db.execute(
            "SELECT id FROM roles WHERE name = 'RECRUITER' LIMIT 1"
        )
        tpo_role_result = await db.execute(
            "SELECT id FROM roles WHERE name = 'TPO' LIMIT 1"
        )
        
        student_role_id = student_role_result.scalar()
        recruiter_role_id = recruiter_role_result.scalar()
        tpo_role_id = tpo_role_result.scalar()
        
        if not all([student_role_id, recruiter_role_id, tpo_role_id]):
            print("✗ Roles not found, please run seed_roles first")
            return
        
        # Get computer science department
        cs_dept_result = await db.execute(
            "SELECT id FROM departments WHERE name = 'Computer Science' LIMIT 1"
        )
        cs_dept_id = cs_dept_result.scalar()
        
        if not cs_dept_id:
            print("✗ Computer Science department not found")
            return
        
        # Create test user
        test_user = User(
            id=uuid.uuid4(),
            email="student@example.com",
            password_hash=hash_password("Student@123"),
            role_id=student_role_id,
            is_active=True,
            must_change_password=False,
        )
        db.add(test_user)
        await db.flush()
        
        # Create test student
        from app.models.students import Student
        test_student = Student(
            id=uuid.uuid4(),
            user_id=test_user.id,
            department_id=cs_dept_id,
            enrollment_number="CS2021001",
            cgpa=8.5,
            tenth_percentage=92.0,
            twelfth_percentage=88.0,
            backlog_count=0,
            phone="+919876543210",
            university_id="MU/CS/2021/001",
            preferred_role="Software Developer",
            linkedin_url="https://linkedin.com/in/student",
            github_url="https://github.com/student",
            portfolio_url="https://student.dev",
        )
        db.add(test_student)
        
        # Create test recruiter user
        recruiter_user = User(
            id=uuid.uuid4(),
            email="recruiter@google.com",
            password_hash=hash_password("Recruiter@123"),
            role_id=recruiter_role_id,
            is_active=True,
            must_change_password=False,
        )
        db.add(recruiter_user)
        await db.flush()
        
        # Create test TPO user
        tpo_user = User(
            id=uuid.uuid4(),
            email="tpo@college.edu",
            password_hash=hash_password("TPO@123"),
            role_id=tpo_role_id,
            is_active=True,
            must_change_password=False,
        )
        db.add(tpo_user)
        
        await db.commit()
        
        print("✓ Test data seeded successfully")
        print("\n--- Test Credentials ---")
        print("Student Account:")
        print("  Email: student@example.com")
        print("  Password: Student@123")
        print("\nRecruiter Account:")
        print("  Email: recruiter@google.com")
        print("  Password: Recruiter@123")
        print("\nTPO Account:")
        print("  Email: tpo@college.edu")
        print("  Password: TPO@123")
        
    except Exception as e:
        print(f"✗ Error seeding test data: {e}")
        await db.rollback()


async def main():
    """Main initialization function"""
    
    print("=" * 50)
    print("CampusHire Database Initialization")
    print("=" * 50)
    
    # Initialize database
    print("\n1. Creating tables...")
    await init_db()
    
    # Seed data
    print("\n2. Seeding roles and departments...")
    async with SessionLocal() as db:
        try:
            await seed_roles(db)
            await seed_departments(db)
            await seed_test_data(db)
        except Exception as e:
            print(f"✗ Error during seeding: {e}")
            return
    
    print("\n" + "=" * 50)
    print("✓ Database initialization completed successfully!")
    print("=" * 50)
    print("\nNext steps:")
    print("1. Start the backend: python main.py")
    print("2. Visit http://localhost:8000/docs for API documentation")
    print("3. Login with test credentials to verify setup")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\nInitialization cancelled by user")
    except Exception as e:
        print(f"\n✗ Fatal error: {e}")
        sys.exit(1)
