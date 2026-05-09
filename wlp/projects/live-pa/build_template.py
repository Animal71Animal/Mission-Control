#!/usr/bin/env python3
"""
WLP Live PA Template Builder
Generates an Ableton Live Set (.als) XML template for Eric's rig:
  Mac (Ableton + Push 2) → MCX8000 (Ch 3/4) → PA
"""

import gzip
import xml.etree.ElementTree as ET
from xml.dom import minidom

# ─────────────────────────────────────────────
# Track definitions
# ─────────────────────────────────────────────
TRACKS = [
    {"name": "DRUMS",   "color": 11,  "group": "low"},    # green-ish
    {"name": "PERC",    "color": 11,  "group": "low"},
    {"name": "BASS",    "color": 14,  "group": "low"},
    {"name": "CHORDS",  "color": 5,   "group": "mid"},    # yellow
    {"name": "LEAD",    "color": 5,   "group": "mid"},
    {"name": "VOCALS",  "color": 9,   "group": "mid"},
    {"name": "FX",      "color": 7,   "group": "high"},   # blue
    {"name": "LOOPS",   "color": 7,   "group": "high"},
    {"name": "MASTER",  "color": 0,   "group": "master"}, # white
]

# Ableton color palette indices (approximate)
# 0=white 5=yellow 7=blue 9=cyan 11=green 14=orange 18=red

SCENES = [
    "INTRO (Low Energy)",
    "BUILD 1",
    "DROP 1 (Peak)",
    "BREAKDOWN",
    "BUILD 2",
    "DROP 2 (Peak)",
    "OUTRO",
]

# ─────────────────────────────────────────────
# Macro definitions (Push 2 Device knobs)
# ─────────────────────────────────────────────
MACROS = [
    {"name": "Filter Cutoff",     "value": 127},
    {"name": "Filter Resonance",  "value": 0},
    {"name": "Reverb Send",       "value": 0},
    {"name": "Delay Send",        "value": 0},
    {"name": "Volume",            "value": 100},
    {"name": "Distortion/Drive",  "value": 0},
    {"name": "Pitch/Transpose",   "value": 64},
    {"name": "LFO Rate",          "value": 64},
]


def make_id(n):
    return str(n)


def build_live_set():
    root = ET.Element("Ableton", {
        "MajorVersion": "5",
        "MinorVersion": "11.0_11300",
        "SchemaChangeCount": "3",
        "Creator": "Ableton Live 11.3.2",
        "Revision": ""
    })

    live_set = ET.SubElement(root, "LiveSet")

    # Tempo
    master = ET.SubElement(live_set, "MasterTrack")
    ET.SubElement(master, "Name").text = "Master"
    tempo_elem = ET.SubElement(master, "DeviceChain")
    mixer = ET.SubElement(tempo_elem, "Mixer")
    tempo = ET.SubElement(mixer, "Tempo")
    ET.SubElement(tempo, "LomId", {"Value": "0"})
    manual = ET.SubElement(tempo, "Manual")
    manual.set("Value", "128")  # Default BPM

    # Transport
    transport = ET.SubElement(live_set, "Transport")
    ET.SubElement(transport, "PhaseNudgeTempo", {"Value": "10"})
    ET.SubElement(transport, "LoopOn", {"Value": "false"})
    ET.SubElement(transport, "LoopStart", {"Value": "8"})
    ET.SubElement(transport, "LoopLength", {"Value": "16"})

    # Tracks
    tracks_elem = ET.SubElement(live_set, "Tracks")
    for i, track in enumerate(TRACKS):
        if track["name"] == "MASTER":
            continue  # already handled

        t = ET.SubElement(tracks_elem, "AudioTrack", {"Id": make_id(i)})
        name_elem = ET.SubElement(t, "Name")
        ET.SubElement(name_elem, "EffectiveName", {"Value": track["name"]})
        ET.SubElement(name_elem, "UserName", {"Value": track["name"]})
        ET.SubElement(t, "ColorIndex", {"Value": str(track["color"])})

        # Device chain placeholder
        dc = ET.SubElement(t, "DeviceChain")
        ET.SubElement(dc, "AutomationLanes")

        # Mixer
        mx = ET.SubElement(dc, "Mixer")
        vol = ET.SubElement(mx, "Volume")
        ET.SubElement(vol, "Manual", {"Value": "0.85"})  # ~-1.5dB default
        pan = ET.SubElement(mx, "Pan")
        ET.SubElement(pan, "Manual", {"Value": "0"})

        sends = ET.SubElement(mx, "Sends")
        # Reverb send (slot 0)
        rev_send = ET.SubElement(sends, "TrackSendHolder", {"Id": "0"})
        ET.SubElement(rev_send, "Send", {"Value": "0"})
        # Delay send (slot 1)
        dly_send = ET.SubElement(sends, "TrackSendHolder", {"Id": "1"})
        ET.SubElement(dly_send, "Send", {"Value": "0"})

        # Clip slots (one per scene)
        clip_slots = ET.SubElement(t, "ClipSlotList")
        for s_idx, scene_name in enumerate(SCENES):
            slot = ET.SubElement(clip_slots, "ClipSlot", {"Id": str(s_idx)})
            ET.SubElement(slot, "HasStopButton", {"Value": "true"})
            ET.SubElement(slot, "NoteOrMidiClip")  # empty = placeholder

    # Scenes
    scenes_elem = ET.SubElement(live_set, "Scenes")
    for s_idx, scene_name in enumerate(SCENES):
        scene = ET.SubElement(scenes_elem, "Scene", {"Id": str(s_idx)})
        ET.SubElement(scene, "Name", {"Value": scene_name})
        ET.SubElement(scene, "Annotation", {"Value": ""})
        ET.SubElement(scene, "IsEmpty", {"Value": "true"})

    # Return tracks (Reverb + Delay)
    returns = ET.SubElement(live_set, "ReturnTracks")

    rev_track = ET.SubElement(returns, "ReturnTrack", {"Id": "100"})
    rev_name = ET.SubElement(rev_track, "Name")
    ET.SubElement(rev_name, "EffectiveName", {"Value": "REVERB"})
    ET.SubElement(rev_name, "UserName", {"Value": "REVERB"})
    ET.SubElement(rev_track, "ColorIndex", {"Value": "7"})

    dly_track = ET.SubElement(returns, "ReturnTrack", {"Id": "101"})
    dly_name = ET.SubElement(dly_track, "Name")
    ET.SubElement(dly_name, "EffectiveName", {"Value": "DELAY"})
    ET.SubElement(dly_name, "UserName", {"Value": "DELAY"})
    ET.SubElement(dly_track, "ColorIndex", {"Value": "9"})

    # Locators (song structure markers)
    locators_elem = ET.SubElement(live_set, "Locators")
    locator_positions = [0, 32, 64, 96, 128, 160, 192]  # bars
    for l_idx, (pos, scene_name) in enumerate(zip(locator_positions, SCENES)):
        loc = ET.SubElement(locators_elem, "Locator", {"Id": str(l_idx)})
        ET.SubElement(loc, "Time", {"Value": str(pos * 2)})  # in beats
        ET.SubElement(loc, "Name", {"Value": scene_name})
        ET.SubElement(loc, "Annotation", {"Value": ""})

    return root


def prettify(elem):
    rough = ET.tostring(elem, encoding="unicode")
    reparsed = minidom.parseString(rough)
    return reparsed.toprettyxml(indent="  ", encoding="UTF-8")


def main():
    import os
    out_dir = "/home/ubuntu/wlp/projects/live-pa"
    os.makedirs(out_dir, exist_ok=True)

    root = build_live_set()
    xml_bytes = prettify(root)

    # Write .als (gzipped XML)
    als_path = f"{out_dir}/WLP-LivePA-Template.als"
    with gzip.open(als_path, "wb") as f:
        if isinstance(xml_bytes, str):
            f.write(xml_bytes.encode("utf-8"))
        else:
            f.write(xml_bytes)

    # Also write raw XML for inspection
    xml_path = f"{out_dir}/WLP-LivePA-Template.xml"
    with open(xml_path, "wb") as f:
        if isinstance(xml_bytes, str):
            f.write(xml_bytes.encode("utf-8"))
        else:
            f.write(xml_bytes)

    print(f"✅ Template written: {als_path}")
    print(f"📄 XML written:     {xml_path}")


if __name__ == "__main__":
    main()
