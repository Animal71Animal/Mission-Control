#!/usr/bin/env python3
"""
Build WLP template from Demo & Sketch (already has DrumRack + Operator).
Rename existing tracks, add audio tracks for stems, rebuild scenes.
"""
import gzip, copy
import xml.etree.ElementTree as ET

BASE = "/tmp/demo_sketch.als"
OUT  = "/home/ubuntu/wlp/projects/live-pa/WLP-LivePA-Template.als"

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

print("Donor tracks:")
for t in all_tracks:
    n = t.find(".//Name/UserName")
    print(f"  {t.tag}: {n.get('Value') if n is not None else '?'}")

# --- Rename existing MIDI tracks ---
# midi_tracks[0] = Drums → rename to DRUMS, color green
def rename_track(t, name, color):
    for path in [".//Name/UserName", ".//Name/EffectiveName"]:
        e = t.find(path)
        if e is not None: e.set("Value", name)
    c = t.find("ColorIndex")
    if c is not None: c.set("Value", str(color))

rename_track(midi_tracks[0], "DRUMS", 11)   # green - has DrumRack
rename_track(midi_tracks[1], "BASS",  13)   # orange - has Operator

# audio_tracks[0] = Vocals → VOX 1
rename_track(audio_tracks[0], "VOX 1", 16)  # pink

# --- Add new audio tracks we need ---
# Clone the audio track as template for new ones
audio_tmpl = audio_tracks[0]

next_id = 200
def new_audio_track(name, color):
    global next_id
    t = copy.deepcopy(audio_tmpl)
    t.set("Id", str(next_id)); next_id += 1
    # Strip clips
    for tag in ["MidiClip", "AudioClip"]:
        for clip in list(t.iter(tag)):
            for elem in t.iter():
                if clip in list(elem):
                    elem.remove(clip); break
    # Strip devices
    devices = t.find(".//DeviceChain/Devices")
    if devices is not None:
        for d in list(devices): devices.remove(d)
    rename_track(t, name, color)
    return t

new_tracks = [
    new_audio_track("VOX 2",  16),
    new_audio_track("PERC",   11),
    new_audio_track("MUSIC",   5),
    new_audio_track("FX",      7),
    new_audio_track("LOOP",    7),
]

# Add MUSIC Operator — clone from Keys/midi_tracks[1] but into an AudioTrack won't work
# Better: just leave MUSIC as empty audio (for stems), BASS already has Operator
# That's the right live PA approach anyway

# Rebuild track order in tracks_elem
for t in all_tracks:
    tracks_elem.remove(t)

# Order: DRUMS(MidiRack), VOX1(Audio), VOX2, PERC, BASS(MidiOperator), MUSIC, FX, LOOP, Returns
track_order = [
    midi_tracks[0],   # DRUMS + DrumRack
    audio_tracks[0],  # VOX 1
    new_tracks[0],    # VOX 2
    new_tracks[1],    # PERC
    midi_tracks[1],   # BASS + Operator
    new_tracks[2],    # MUSIC
    new_tracks[3],    # FX
    new_tracks[4],    # LOOP
] + return_tracks

for t in track_order:
    tracks_elem.append(t)

print("\nFinal track order:")
for t in track_order:
    n = t.find(".//Name/UserName")
    print(f"  {t.tag}: {n.get('Value') if n is not None else '?'}")

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

# Rename returns
ret_names = ["REVERB", "DELAY"]
for rt, rn in zip(return_tracks, ret_names):
    rename_track(rt, rn, 7)

xml_bytes = b'<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(root, encoding="unicode").encode("utf-8")
with gzip.open(OUT, "wb") as f:
    f.write(xml_bytes)

print(f"\n✅ Written: {OUT}")
