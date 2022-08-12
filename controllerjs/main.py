# -*- coding:utf-8 -*-

import sys
from pynput.keyboard import Key, Listener
from pynput.mouse import Button
from pynput import keyboard, mouse

keyboard1 = keyboard.Controller()
mouse = mouse.Controller()
commandKeys = ["cmd", "alt", "ctrl", "shift"]
specialKeys = ["space", "backspace", "enter", "tab"]

def press(key, commandKey = []):
    if len(commandKey) > 0:
        for sk in commandKey.split(","):
            keyboard1.press(Key[sk]) 
    if key in specialKeys: key = Key[key]
    keyboard1.press(key)
    # keyboard1.release(key)
    # if len(commandKey) > 0:
    #     for sk in commandKey.split(","):
    #         keyboard1.release(Key[sk]) 


def release(key):
    if key in commandKeys: key = Key[key]
    if key in specialKeys: key = Key[key]
    print(key)
    keyboard1.release(key)


def movemouse(x, y):
    mouse.position = (x, y)

def scroll(x, y):
    mouse.scroll(x, y)

def click(eventType, which):
    if eventType == "dblclick":
        mouse.click(Button[which], 2)
    elif eventType == "up":
        mouse.release(Button[which])
    elif eventType == "down":
        mouse.press(Button[which])

def on_press(key):
    try:
        print('alphanumeric key {0} pressed'.format(key.char))
    except AttributeError:
        print('special key {0} pressed'.format(key))


def on_release(key):    
    print('{0} released'.format(key))
    if key == keyboard.Key.esc:
        # Stop listener
        return False


def listen():
    with keyboard.Listener(
            on_press=on_press,
            on_release=on_release) as listener:
        listener.join()

    # ...or, in a non-blocking fashion:
    listener = keyboard.Listener(
        on_press=on_press,
        on_release=on_release)
    listener.start()


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == "listen":
        globals()[sys.argv[1]]()
    else:
        print("create child")
        for line in sys.stdin:
            line = line.split(' ')
            event = line[0]
            if event == "press" or event == "release":
                key = line[1]
                specialKey = line[2]
                print("event: %s, key: %s, specialKey: %s" % (event, key, specialKey))
                if(len(specialKey) > 0):
                    globals()[event](key, specialKey)
                else : 
                    globals()[event](key)
            elif event == "movemouse" or event == "scroll":
                x = line[1]
                y = line[2]
                print("event: %s, x: %s, y: %s" % (event, x, y))
                globals()[event](int(x), int(y))
            elif event == "click":
                eventType = line[1]
                which = line[2]
                globals()[event](eventType, which)
                
                    
            # keyboard1.press("a")
        # if len(sys.argv) == 4 :
        #     globals()[sys.argv[1]](sys.argv[2], sys.argv[3])
        # else :
        #     globals()[sys.argv[1]](sys.argv[2])
