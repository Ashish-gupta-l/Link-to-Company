import os
import sys
import subprocess
import time
import webbrowser

def main():
    print("=" * 60)
    print("   LinktoCompany - Skill Proof Network (SIH 2026)")
    print("=" * 60)
    
    root_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("\n[1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=root_dir
    )
    
    time.sleep(2)
    
    print("\n[2/3] Starting Vite Frontend on http://localhost:3000 ...")
    # On Windows npm is npm.cmd
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=root_dir
    )
    
    time.sleep(2)
    print("\n[3/3] Opening browser at http://localhost:3000 ...")
    webbrowser.open("http://localhost:3000")
    
    print("\n" + "=" * 60)
    print(" Application is running!")
    print(" Frontend: http://localhost:3000")
    print(" Backend:  http://127.0.0.1:8000/docs")
    print(" Press Ctrl+C to stop both servers.")
    print("=" * 60 + "\n")
    
    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Done.")

if __name__ == "__main__":
    main()
