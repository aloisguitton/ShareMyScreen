import sys
from pynput.keyboard import Key, Controller, Listener

keyboard1 = Controller()

print("READY")

for line in sys.stdin:
    print("PYTHON RECEIVED: %s" % line)
    keyboard1.press("m")