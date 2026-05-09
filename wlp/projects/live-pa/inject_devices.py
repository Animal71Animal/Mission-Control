#!/usr/bin/env python3
"""
Inject DrumGroupDevice + Operator from Demo & Sketch into WLP template.
DRUMS track → Drum Rack
MUSIC track → Operator (chord/pad synth)
BASS track  → Operator (bass synth)
"""
import gzip, copy
import xml.etree.ElementTree as ET

TEMPLATE = "/home/ubuntu/wlp/projects/live-pa/WLP-LivePA-Template.als"
DONOR    = "/tmp/demo_sketch.als"
OUT      = "/home/ubuntu/wlp/projects/live-pa/WLP-LivePA-Template.als"

# Load both files
with gzip.open(TEMPLATE, "rb") as f:
    tmpl_content = f.read().decode("utf-8")
with gzip.open(DONOR, "rb") as f:
    donor_content = f.read().decode("utf-8")

tmpl_root  = ET.fromstring(tmpl_content)
donor_root = ET.fromstring(donor_content)

# Extract devices from donor
donor_ls     = donor_root.find("LiveSet")
donor_tracks = list(donor_ls.find("Tracks"))

drum_track = next(t for t in donor_tracks if t.find(".//DrumGroupDevice") is not None)
keys_track = next(t for t in donor_tracks if t.find(".//Operator") is not None)

drum_device = drum_track.find(".//DrumGroupDevice")
operator_device = keys_track.find(".//Operator")

print(f"DrumGroupDevice found: {drum_device is not None}")
print(f"Operator found: {operator_device is not None}")

# Find device chains in our template tracks
tmpl_ls     = tmpl_root.find("LiveSet")
tmpl_tracks = list(tmpl_ls.find("Tracks"))

def get_device_chain(track):
    dc = track.find(".//DeviceChain/Devices")
    if dc is None:
        dc = track.find("DeviceChain")
        if dc is not None:
            devices = dc.find("Devices")
            if devices is None:
                devices = ET.SubElement(dc, "Devices")
            return devices
    return dc

def track_named(name):
    for t in tmpl_tracks:
        n = t.find(".//Name/UserName")
        if n is not None and n.get("Value") == name:
            return t
    return None

# Inject Drum Rack into DRUMS track
drums_track = track_named("DRUMS")
if drums_track is not None:
    devices_elem = get_device_chain(drums_track)
    if devices_elem is not None:
        devices_elem.append(copy.deepcopy(drum_device))
        print("✅ Drum Rack injected into DRUMS")
    else:
        print("❌ Could not find Devices element in DRUMS")
else:
    print("❌ DRUMS track not found")

# Inject Operator into MUSIC track
music_track = track_named("MUSIC")
if music_track is not None:
    devices_elem = get_device_chain(music_track)
    if devices_elem is not None:
        devices_elem.append(copy.deepcopy(operator_device))
        print("✅ Operator injected into MUSIC")

# Inject Operator into BASS track (second copy, different instance ID)
bass_track = track_named("BASS")
if bass_track is not None:
    op2 = copy.deepcopy(operator_device)
    # Give it a different ID to avoid conflicts
    op2.set("Id", "9999")
    devices_elem = get_device_chain(bass_track)
    if devices_elem is not None:
        devices_elem.append(op2)
        print("✅ Operator injected into BASS")

# Save
xml_bytes = b'<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(tmpl_root, encoding="unicode").encode("utf-8")
with gzip.open(OUT, "wb") as f:
    f.write(xml_bytes)

print(f"\n✅ Written: {OUT}")
