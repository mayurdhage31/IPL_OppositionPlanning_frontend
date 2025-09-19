#!/usr/bin/env python3
"""
Configuration test script for IPL Opposition Planning Tool
Tests both local and Railway API endpoints
"""

import requests
import json
import sys
from pathlib import Path

# Add backend to path for importing config
sys.path.append(str(Path(__file__).parent / "backend"))

try:
    from config import settings
    print("✅ Backend config imported successfully")
    print(f"   Environment: {settings.ENVIRONMENT}")
    print(f"   Local API URL: {settings.api_url}")
    print(f"   Railway Host: {settings.RAILWAY_HOST}")
except ImportError as e:
    print(f"❌ Failed to import backend config: {e}")
    sys.exit(1)

def test_api_endpoint(url, name):
    """Test an API endpoint"""
    print(f"\n🔍 Testing {name}: {url}")
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Status: {response.status_code}")
            print(f"   📄 Response: {json.dumps(data, indent=2)}")
            return True
        else:
            print(f"   ⚠️  Status: {response.status_code}")
            print(f"   📄 Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Connection failed: {e}")
        return False

def main():
    """Main test function"""
    print("🏏 IPL Opposition Planning Tool - Configuration Test")
    print("=" * 60)
    
    # Test endpoints
    endpoints = [
        ("http://localhost:8000", "Local Backend"),
        ("https://iploppositionplanningbackend-game-planner.up.railway.app", "Railway Backend")
    ]
    
    results = {}
    
    for url, name in endpoints:
        # Test root endpoint
        root_success = test_api_endpoint(url, f"{name} (Health Check)")
        
        # Test config endpoint if root works
        config_success = False
        if root_success:
            config_success = test_api_endpoint(f"{url}/config", f"{name} (Config)")
        
        results[name] = {
            "health": root_success,
            "config": config_success
        }
    
    # Summary
    print("\n📊 Test Summary")
    print("=" * 30)
    for name, result in results.items():
        health_status = "✅" if result["health"] else "❌"
        config_status = "✅" if result["config"] else "❌"
        print(f"{name}:")
        print(f"   Health Check: {health_status}")
        print(f"   Config Endpoint: {config_status}")
    
    # Recommendations
    print("\n💡 Recommendations")
    print("=" * 20)
    
    local_working = results["Local Backend"]["health"]
    railway_working = results["Railway Backend"]["health"]
    
    if local_working and railway_working:
        print("🎉 Both local and Railway backends are working!")
        print("   You can use either environment for development.")
    elif local_working:
        print("🏠 Local backend is working.")
        print("   Railway backend may need to be updated with the latest code.")
    elif railway_working:
        print("🚀 Railway backend is working.")
        print("   Local backend may need to be started.")
    else:
        print("⚠️  Neither backend is responding.")
        print("   Check if servers are running and accessible.")
    
    print("\n🔧 Next Steps:")
    if not local_working:
        print("   • Start local backend: cd backend && python main.py")
    if not railway_working:
        print("   • Deploy updated code to Railway")
    if not results["Railway Backend"]["config"]:
        print("   • Railway backend needs the latest code with /config endpoint")

if __name__ == "__main__":
    main()
