#!/usr/bin/env python3
"""
Local development startup script for IPL Opposition Planning Tool
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def start_backend():
    """Start the backend server"""
    print("🚀 Starting backend server...")
    backend_dir = Path(__file__).parent / "backend"
    
    # Set environment variables for local development
    env = os.environ.copy()
    env["ENVIRONMENT"] = "development"
    env["HOST"] = "0.0.0.0"
    env["PORT"] = "8000"
    
    try:
        # Start the backend server
        backend_process = subprocess.Popen(
            [sys.executable, "main.py"],
            cwd=backend_dir,
            env=env
        )
        print("✅ Backend server started on http://localhost:8000")
        return backend_process
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return None

def start_frontend():
    """Start the frontend development server"""
    print("🚀 Starting frontend server...")
    frontend_dir = Path(__file__).parent / "frontend"
    
    try:
        # Start the frontend server
        frontend_process = subprocess.Popen(
            ["npm", "start"],
            cwd=frontend_dir
        )
        print("✅ Frontend server started on http://localhost:3000")
        return frontend_process
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")
        return None

def main():
    """Main function to start both servers"""
    print("🏏 IPL Opposition Planning Tool - Local Development")
    print("=" * 50)
    
    # Start backend
    backend_process = start_backend()
    if not backend_process:
        return
    
    # Wait a moment for backend to start
    time.sleep(3)
    
    # Start frontend
    frontend_process = start_frontend()
    if not frontend_process:
        backend_process.terminate()
        return
    
    print("\n🎉 Both servers are running!")
    print("📱 Frontend: http://localhost:3000")
    print("🔧 Backend API: http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("\n⚠️  Press Ctrl+C to stop both servers")
    
    try:
        # Wait for user to stop the servers
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\n🛑 Stopping servers...")
        backend_process.terminate()
        frontend_process.terminate()
        print("✅ Servers stopped")

if __name__ == "__main__":
    main()
