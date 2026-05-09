#!/usr/bin/env python3
"""
WLP Live PA Template v3 — proper ID remapping for injected devices.
"""
import gzip, re, copy, xml.etree.ElementTree as ET

BASE = "/tmp/demo_sketch.als"
OUT  = "/home/ubuntu/wlp/projects/live-pa/WLP-LivePA-Template.als"

ADG_MAP = [
    ("BEAT RPT",     "/tmp/beat_repeat_echo_stripped.adg", 14),  # red
    ("INSTANT RPT",  "/tmp/instant_repeat_stripped.adg",   13),  # orange
    ("FILTER PUMP",  "/tmp/filter_pumper_stripped.adg",     5),  # yellow
    ("FROZEN SMEAR", "/tmp/frozen_smear_stripped.adg",      7),  # blue
    ("SUPER LOOP",   "/tmp/looper_stripped.adg",            8),  # purple
]

SCENES = [
    "TRANSITION (FX only)", "LOW ENERGY", "MID BUILD", "PEAK / DROP",
    "BREAKDOWN", "RE-BUILD", "PEAK 2", "OUTRO / FADE",
]

C = dict(pink=16, green=11, orange=13, yellow=5, blue=7, purple=8, red=14, cyan=9)

# ── helpers ──────────────────────────────────────────────────────────────────

def remap_ids(xml_str, id_offset):
    """
    Shift every numeric Id="N" and PointeeId/LomId Value="N" in xml_str
    by id_offset so they don't clash with the host file.
    We only remap small IDs (< 50000) to avoid touching color/value constants.
    """
    def shift(m):
        n = int(m.group(1))
        if n < 50000:
            return m.group(0).replace(f'"{n}"', f'"{n + id_offset}"')
        return m.group(0)

    # Remap Id="N" attributes
    xml_str = re.sub(r'\bId="(\d+)"', shift, xml_str)
    # Remap PointeeId Value and LomId Value (small numbers only)
    def shift_val(m):
        n = int(m.group(1))
        if n < 50000 and n > 0:
            return m.group(0).replace(f'"{n}"', f'"{n + id_offset}"')
        return m.group(0)
    xml_str = re.sub(r'(?:PointeeId|LomId|LomIdView)\s+Value="(\d+)"', shift_val, xml_str)
    return xml_str

def get_device_xml(adg_path, id_offset):
    with gzip.open(adg_path, "rb") as f:
        raw = f.read().decode("utf-8")
    remapped = remap_ids(raw, id_offset)
    root = ET.fromstring(remapped)
    gdp = root.find("GroupDevicePreset")
    dev_wrapper = gdp.find("Device")
    device = dev_wrapper.find("AudioEffectGroupDevice") if dev_wrapper is not None else None
    return device

def rename(t, name, color):
    for path in [".//Name/UserName", ".//Name/EffectiveName"]:
        e = t.find(path)
        if e is not None: e.set("Value", name)
    c = t.find("ColorIndex")
    if c is not None: c.set("Value", str(color))

def strip_clips(t):
    for tag in ["MidiClip", "AudioClip"]:
        for clip in list(t.iter(tag)):
            for p in t.iter():
                if clip in list(p): p.remove(clip); break

def devices_elem(t):
    dc = t.find("DeviceChain")
    if dc is None: dc = ET.SubElement(t, "DeviceChain")
    dv = dc.find("Devices")
    if dv is None: dv = ET.SubElement(dc, "Devices")
    return dv

# ── load base ────────────────────────────────────────────────────────────────
with gzip.open(BASE, "rb") as f:
    base_xml = f.read().decode("utf-8")

# Find max ID in base
all_ids = [int(x) for x in re.findall(r'\bId="(\d+)"', base_xml)]
max_base_id = max(all_ids) if all_ids else 5000
print(f"Base max ID: {max_base_id}")

root = ET.fromstring(base_xml)
ls = root.find("LiveSet")
tracks_elem = ls.find("Tracks")
scenes_elem = ls.find("Scenes")

all_tracks    = list(tracks_elem)
midi_tracks   = [t for t in all_tracks if t.tag == "MidiTrack"]
audio_tracks  = [t for t in all_tracks if t.tag == "AudioTrack"]
return_tracks = [t for t in all_tracks if t.tag == "ReturnTrack"]

# Rename keepers
rename(midi_tracks[0],  "DRUMS",  C["green"])
rename(midi_tracks[1],  "BASS",   C["orange"])
rename(audio_tracks[0], "VOX 1",  C["pink"])

atpl  = audio_tracks[0]
rtpl  = return_tracks[0]
_nid  = [max_base_id + 2000]

def fresh_id():
    _nid[0] += 1
    return str(_nid[0])

def new_audio(name, color):
    t = copy.deepcopy(atpl)
    t.set("Id", fresh_id())
    strip_clips(t)
    dv = devices_elem(t)
    for d in list(dv): dv.remove(d)
    rename(t, name, color)
    return t

def new_return(name, color, adg_path):
    t = copy.deepcopy(rtpl)
    t.set("Id", fresh_id())
    strip_clips(t)
    rename(t, name, color)
    id_offset = _nid[0] * 100
    rack = get_device_xml(adg_path, id_offset)
    if rack is not None:
        rack.set("Id", fresh_id())
        dv = devices_elem(t)
        for d in list(dv): dv.remove(d)
        dv.append(rack)
        print(f"  ✅ {name}")
    else:
        print(f"  ❌ {name} — rack not found")
    return t

# ── build track list ─────────────────────────────────────────────────────────
page1 = [
    audio_tracks[0],          # VOX 1
    new_audio("VOX 2",  C["pink"]),
    new_audio("PERC",   C["green"]),
    midi_tracks[0],            # DRUMS
    midi_tracks[1],            # BASS
    new_audio("MUSIC",  C["yellow"]),
    new_audio("LOOPER", C["cyan"]),
    new_audio("FX",     C["blue"]),
]

print("Building return FX tracks:")
returns = [new_return(name, color, adg) for name, adg, color in ADG_MAP]

# Rebuild
for t in all_tracks: tracks_elem.remove(t)
for t in page1 + returns: tracks_elem.append(t)

# Scenes
for s in list(scenes_elem): scenes_elem.remove(s)
for i, name in enumerate(SCENES):
    sc = ET.SubElement(scenes_elem, "Scene", {"Id": str(i + 9000)})
    ET.SubElement(sc, "Name", {"Value": name})
    ET.SubElement(sc, "Annotation", {"Value": ""})
    ET.SubElement(sc, "IsEmpty", {"Value": "true"})
    ET.SubElement(sc, "Tempo", {"Value": "128"})
    ET.SubElement(sc, "TimeSignatureNumerator", {"Value": "4"})
    ET.SubElement(sc, "TimeSignatureDenominator", {"Value": "4"})

# Serialize
out_xml = b'<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(root, encoding="unicode").encode("utf-8")
with gzip.open(OUT, "wb") as f:
    f.write(out_xml)

print(f"\n✅ Written: {OUT} ({len(out_xml)//1024}KB)")
