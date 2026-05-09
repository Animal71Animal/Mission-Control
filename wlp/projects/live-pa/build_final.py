#!/usr/bin/env python3
"""
WLP Live PA Template — built from Ableton's own DefaultLiveSet.als
"""
import gzip, copy
import xml.etree.ElementTree as ET

BASE  = "/tmp/DefaultLiveSet.als"
OUT   = "/home/ubuntu/wlp/projects/live-pa/WLP-LivePA-Template.als"

AUDIO_TRACKS = [
    {"name": "VOX 1",  "color": 16},
    {"name": "VOX 2",  "color": 16},
    {"name": "DRUMS",  "color": 11},
    {"name": "PERC",   "color": 11},
    {"name": "BASS",   "color": 13},
    {"name": "MUSIC",  "color": 5},
    {"name": "FX",     "color": 7},
    {"name": "LOOP",   "color": 7},
]

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

RETURNS = ["REVERB", "DELAY"]

with gzip.open(BASE, "rb") as f:
    content = f.read().decode("utf-8")

root = ET.fromstring(content)
ls = root.find("LiveSet")
tracks_elem = ls.find("Tracks")
scenes_elem = ls.find("Scenes")

# Separate track types
all_tracks = list(tracks_elem)
midi_tracks   = [t for t in all_tracks if t.tag == "MidiTrack"]
audio_tracks  = [t for t in all_tracks if t.tag == "AudioTrack"]
return_tracks = [t for t in all_tracks if t.tag == "ReturnTrack"]

# We need 8 AudioTracks — clone from existing audio track template
audio_template = audio_tracks[0] if audio_tracks else midi_tracks[0]

# Remove all tracks from element
for t in all_tracks:
    tracks_elem.remove(t)

# Build 8 fresh audio tracks by cloning the template
for i, desired in enumerate(AUDIO_TRACKS):
    new_track = copy.deepcopy(audio_template)
    new_track.set("Id", str(i))

    # Strip any clips
    for clip_tag in ["MidiClip", "AudioClip"]:
        for clip in list(new_track.iter(clip_tag)):
            for elem in new_track.iter():
                if clip in list(elem):
                    elem.remove(clip)
                    break

    # Set name
    for path in [".//Name/UserName", ".//Name/EffectiveName"]:
        e = new_track.find(path)
        if e is not None:
            e.set("Value", desired["name"])

    # Set color
    c = new_track.find("ColorIndex")
    if c is not None:
        c.set("Value", str(desired["color"]))

    tracks_elem.append(new_track)
    print(f"  Added: {desired['name']}")

# Add return tracks back
for i, (rt, name) in enumerate(zip(return_tracks, RETURNS)):
    rt.set("Id", str(100 + i))
    for path in [".//Name/UserName", ".//Name/EffectiveName"]:
        e = rt.find(path)
        if e is not None:
            e.set("Value", name)
    tracks_elem.append(rt)
    print(f"  Return: {name}")

# Rebuild scenes
for s in list(scenes_elem):
    scenes_elem.remove(s)

scene_template_elem = ET.SubElement(scenes_elem, "Scene")  # placeholder
scenes_elem.remove(scene_template_elem)

for i, name in enumerate(SCENES):
    sc = ET.SubElement(scenes_elem, "Scene", {"Id": str(i)})
    ET.SubElement(sc, "Name", {"Value": name})
    ET.SubElement(sc, "Annotation", {"Value": ""})
    ET.SubElement(sc, "IsEmpty", {"Value": "true"})
    ET.SubElement(sc, "Tempo", {"Value": "128"})
    ET.SubElement(sc, "TimeSignatureNumerator", {"Value": "4"})
    ET.SubElement(sc, "TimeSignatureDenominator", {"Value": "4"})
    print(f"  Scene: {name}")

xml_bytes = b'<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(root, encoding="unicode").encode("utf-8")
with gzip.open(OUT, "wb") as f:
    f.write(xml_bytes)

print(f"\n✅ {OUT}")
