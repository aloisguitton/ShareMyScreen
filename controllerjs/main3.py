# -*- coding:utf-8 -*-

import sys
import Quartz

def press(key, commandKey = []):
    event = Quartz.CGEventCreateKeyboardEvent(None, 0x00, True)
    Quartz.CGEventPost(Quartz.kCGHIDEventTap, event)

if __name__ == '__main__':
    print("create child")
    if len(sys.argv) == 4 :
        globals()[sys.argv[1]](sys.argv[2], sys.argv[3])
    else :
        globals()[sys.argv[1]](sys.argv[2])
