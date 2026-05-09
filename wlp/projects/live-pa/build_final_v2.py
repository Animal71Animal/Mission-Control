#!/usr/bin/env python3
"""
WLP Live PA Template v2
- Page 1 (Push tracks 1-8): VOX1, VOX2, PERC, DRUMS, BASS, MUSIC, LOOPER, FX
- Page 2 (Push tracks 9-13): BEAT RPT, INSTANT RPT, FILTER PUMP, FROZEN, CRUSH (returns)
Built from Demo & Sketch base + factory .adg racks injected into returns.
"""
import gzip, copy
import xml.etree.ElementTree as ET

BASE = "/tmp/demo_sketch.als"
OUT  = "/home/ubuntu/wlp/projects/live-pa/WLP-LivePA-Template.als"

ADG_FILES = {
    "BEAT RPT":    "/tmp/beat_repeat_echo.adg",
    "INSTANT RPT": "/tmp/instant_repeat.adg",
    "FILTER PUMP": "/tmp/filter_pumper.adg",
    "FROZEN SMEAR":"/tmp/frozen_smear.adg",
    "SUPER LOOP":  "/tmp/looper.adg",
}

SCENES = [
    "TRANSITION (FX only)",
    "LOW ENERGY",
    "MID BUILD",
    "PEAK / DROP",
    "BREAKDOWN",
    "RE-BUILD",
    "PEAK 2",
    "OUTRO / FADE",
]

# Colors
C_PINK=16; C_GREEN=11; C_ORANGE=13; C_YELLOW=5; C_BLUE=7; C_PURPLE=8; C_RED=14; C_CYAN=9

def rename_track(t, name, color):
    for path in [".//Name/UserName", ".//Name/EffectiveName"]:
        e = t.find(path)
        if e is not None: e.set("Value", name)
    c = t.find("ColorIndex")
    if c is not None: c.set("Value", str(color))

def strip_clips(t):
    for tag in ["MidiClip", "AudioClip"]:
        for clip in list(t.iter(tag)):
            for elem in t.iter():
                if clip in list(elem):
                    elem.remove(clip); break

def get_rack_device(adg_path):
    """Extract AudioEffectGroupDevice from .adg preset file."""
    with gzip.open(adg_path, "rb") as f:
        content = f.read().decode("utf-8")
    root = ET.fromstring(content)
    gdp = root.find("GroupDevicePreset")
    device_wrapper = gdp.find("Device"); device = device_wrapper.find("AudioEffectGroupDevice") if device_wrapper is not None else None
    return device

def get_devices_elem(track):
    """Get or create Devices container in track's DeviceChain."""
    dc = track.find("DeviceChain")
    if dc is None:
        dc = ET.SubElement(track, "DeviceChain")
    devices = dc.find("Devices")
    if devices is None:
        devices = ET.SubElement(dc, "Devices")
    return devices

# Load base
with gzip.open(BASE, "rb") as f:
    content = f.read().decode("utf-8")

root = ET.fromstring(content)
ls = root.find("LiveSet")
tracks_elem = ls.find("Tracks")
scenes_elem = ls.find("Scenes")

all_tracks = list(tracks_elem)
midi_tracks   = [t for t in all_tracks if t.tag == "MidiTrack"]
audio_tracks  = [t for t in all_tracks if t.tag == "AudioTrack"]
return_tracks = [t for t in all_tracks if t.tag == "ReturnTrack"]

# Rename existing tracks we keep
rename_track(midi_tracks[0], "DRUMS",  C_GREEN)   # DrumRack
rename_track(midi_tracks[1], "BASS",   C_ORANGE)  # Operator
rename_track(audio_tracks[0], "VOX 1", C_PINK)

# Clone audio track for new tracks
atpl = audio_tracks[0]

_next_id = [300]
def new_audio_track(name, color):
    t = copy.deepcopy(atpl)
    t.set("Id", str(_next_id[0])); _next_id[0] += 1
    strip_clips(t)
    devices = get_devices_elem(t)
    for d in list(devices): devices.remove(d)
    rename_track(t, name, color)
    return t

# Clone return track template
rtpl = return_tracks[0]
_ret_id = [500]
def new_return_track(name, color, adg_path=None):
    t = copy.deepcopy(rtpl)
    t.set("Id", str(_ret_id[0])); _ret_id[0] += 1
    strip_clips(t)
    rename_track(t, name, color)
    if adg_path:
        rack = get_rack_device(adg_path)
        if rack is not None:
            rack_copy = copy.deepcopy(rack)
            rack_copy.set("Id", str(_ret_id[0] * 10))
            devices = get_devices_elem(t)
            for d in list(devices): devices.remove(d)
            devices.append(rack_copy)
            print(f"  ✅ Rack injected into {name}")
        else:
            print(f"  ⚠️  No rack found for {name}")
    return t

# Build final track list
vox2  = new_audio_track("VOX 2",  C_PINK)
perc  = new_audio_track("PERC",   C_GREEN)
music = new_audio_track("MUSIC",  C_YELLOW)
looper_t = new_audio_track("LOOPER", C_CYAN)
fx_t  = new_audio_track("FX",    C_BLUE)

# Page 1 tracks (1-8): stems + instruments
page1_tracks = [
    audio_tracks[0],  # VOX 1
    vox2,             # VOX 2
    perc,             # PERC
    midi_tracks[0],   # DRUMS (DrumRack)
    midi_tracks[1],   # BASS (Operator)
    music,            # MUSIC
    looper_t,         # LOOPER
    fx_t,             # FX
]

# Page 2 returns (FX machines) - visible after page 1 on Push
print("\nBuilding FX return tracks:")
ret_beat    = new_return_track("BEAT RPT",     C_RED,    "/tmp/beat_repeat_echo.adg")
ret_instant = new_return_track("INSTANT RPT",  C_ORANGE, "/tmp/instant_repeat.adg")
ret_filter  = new_return_track("FILTER PUMP",  C_YELLOW, "/tmp/filter_pumper.adg")
ret_frozen  = new_return_track("FROZEN SMEAR", C_BLUE,   "/tmp/frozen_smear.adg")
ret_loop    = new_return_track("SUPER LOOP",   C_PURPLE, "/tmp/looper.adg")

# Rebuild tracks element
for t in all_tracks: tracks_elem.remove(t)
for t in page1_tracks: tracks_elem.append(t)
for t in [ret_beat, ret_instant, ret_filter, ret_frozen, ret_loop]:
    tracks_elem.append(t)

# Rebuild scenes
for s in list(scenes_elem): scenes_elem.remove(s)
for i, name in enumerate(SCENES):
    sc = ET.SubElement(scenes_elem, "Scene", {"Id": str(i)})
    ET.SubElement(sc, "Name", {"Value": name})
    ET.SubElement(sc, "Annotation", {"Value": ""})
    ET.SubElement(sc, "IsEmpty", {"Value": "true"})
    ET.SubElement(sc, "Tempo", {"Value": "128"})
    ET.SubElement(sc, "TimeSignatureNumerator", {"Value": "4"})
    ET.SubElement(sc, "TimeSignatureDenominator", {"Value": "4"})

print("\nFinal layout:")
for t in list(tracks_elem):
    n = t.find(".//Name/UserName")
    print(f"  {t.tag}: {n.get('Value') if n is not None else '?'}")

xml_bytes = b'<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(root, encoding="unicode").encode("utf-8")
with gzip.open(OUT, "wb") as f:
    f.write(xml_bytes)

print(f"\n✅ Written: {OUT}")
