"""sitecustomize to prevent stray numpy script in Anaconda Scripts from shadowing the real numpy package.
This module is automatically imported by Python's site initialization if found on sys.path.
It removes the offending directory (e.g., C:\\Users\\srisu\\anaconda5\\Scripts) from sys.path before any imports occur.
"""
import os, sys
offending_dir = os.path.join(os.path.expanduser('~'), 'anaconda5', 'Scripts')
if offending_dir in sys.path:
    sys.path.remove(offending_dir)
    print(f"[sitecustomize] Removed offending path from sys.path: {offending_dir}")
