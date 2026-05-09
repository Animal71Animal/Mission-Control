#!/usr/bin/env python3
import gzip, copy, re
import xml.etree.ElementTree as ET

BASE = "/tmp/demo_sketch.als"   # has both AudioTrack and MidiTrack templates
OUT  = "/home/ubuntu/wlp/projects/live-pa/WLP-LivePA-Template.als"

# ── layout ───────────────────────────────────────────────────────────────────
STEM_TRACKS = [   # AudioTrack — warp & loop stems
    ("VOX 1",   16), ("VOX 2",  16), ("PERC",  11), ("DRUMS",  11),
    ("BASS",    13), ("MUSIC",   5), ("LOOPER", 9), ("FX",      7),
]
INSTRUMENT_TRACKS = [   # MidiTrack — play live on Push 2
    ("DRUM RACK", 11),   # will get DrumGroupDevice
    ("SYNTH 1",    5),   # will get Operator
    ("SYNTH 2",    8),   # will get Operator
]
RETURN_TRACKS = [
    ("BEAT RPT", 14), ("INSTANT RPT", 13), ("FILTER PUMP", 5),
    ("FROZEN SMEAR", 7), ("SUPER LOOP", 8),
]
SCENES = [
    "TRANSITION (FX only)", "LOW ENERGY", "MID BUILD", "PEAK / DROP",
    "BREAKDOWN", "RE-BUILD", "PEAK 2", "OUTRO / FADE",
]
N_RETURNS = len(RETURN_TRACKS)

# ── load base ────────────────────────────────────────────────────────────────
with gzip.open(BASE, "rb") as f:
    base_xml = f.read().decode("utf-8")

all_ids = [int(x) for x in re.findall(r'\bId="(\d+)"', base_xml)]
_nid = [max(all_ids) + 500]
def nid():
    _nid[0] += 1
    return str(_nid[0])

root = ET.fromstring(base_xml)
ls   = root.find("LiveSet")
tracks_elem = ls.find("Tracks")
scenes_elem = ls.find("Scenes")

all_tracks   = list(tracks_elem)
audio_tmpl   = next(t for t in all_tracks if t.tag == "AudioTrack")
midi_tmpl    = next(t for t in all_tracks if t.tag == "MidiTrack")
return_tmpl  = next(t for t in all_tracks if t.tag == "ReturnTrack")

# ── helpers ───────────────────────────────────────────────────────────────────
def rename(t, name, color):
    for path in [".//Name/UserName", ".//Name/EffectiveName"]:
        e = t.find(path)
        if e is not None: e.set("Value", name)
    for tag in ["ColorIndex", "Color"]:
        c = t.find(tag)
        if c is not None: c.set("Value", str(color)); break

def strip_clips(t):
    for tag in ["MidiClip", "AudioClip"]:
        for clip in list(t.iter(tag)):
            for p in t.iter():
                if clip in list(p): p.remove(clip); break

def clear_devices(t):
    d = t.find(".//DeviceChain/Devices")
    if d is not None:
        for x in list(d): d.remove(x)

def make_send_holder(idx):
    h = ET.Element("TrackSendHolder", {"Id": str(idx)})
    s = ET.SubElement(h, "Send")
    ET.SubElement(s, "LomId", {"Value": "0"})
    ET.SubElement(s, "Manual", {"Value": "0.0003162277571"})
    mr = ET.SubElement(s, "MidiControllerRange")
    ET.SubElement(mr, "Min", {"Value": "0.0003162277571"})
    ET.SubElement(mr, "Max", {"Value": "1"})
    ET.SubElement(s, "AutomationTarget", {"Id": nid()})
    ET.SubElement(s, "ModulationTarget", {"Id": nid()})
    ET.SubElement(h, "Active", {"Value": "true"})
    return h

def fix_sends(t):
    sends = t.find(".//DeviceChain/Mixer/Sends")
    if sends is None:
        mx = t.find(".//DeviceChain/Mixer")
        if mx is None: return
        sends = ET.SubElement(mx, "Sends")
    for s in list(sends): sends.remove(s)
    for i in range(N_RETURNS): sends.append(make_send_holder(i))

def make_audio(name, color):
    t = copy.deepcopy(audio_tmpl)
    t.set("Id", nid()); strip_clips(t); clear_devices(t)
    rename(t, name, color); fix_sends(t)
    return t

def make_midi(name, color):
    t = copy.deepcopy(midi_tmpl)
    t.set("Id", nid()); strip_clips(t); clear_devices(t)
    rename(t, name, color); fix_sends(t)
    return t

def make_return(name, color):
    t = copy.deepcopy(return_tmpl)
    t.set("Id", nid()); strip_clips(t)
    rename(t, name, color)
    return t

# ── build ─────────────────────────────────────────────────────────────────────
for t in all_tracks: tracks_elem.remove(t)

stems       = [make_audio(n, c) for n, c in STEM_TRACKS]
instruments = [make_midi(n, c)  for n, c in INSTRUMENT_TRACKS]
returns     = [make_return(n, c) for n, c in RETURN_TRACKS]

for t in stems + instruments + returns:
    tracks_elem.append(t)

# SendsPre
sp = ls.find("SendsPre")
if sp is not None:
    for x in list(sp): sp.remove(x)
    for i in range(N_RETURNS):
        ET.SubElement(sp, "SendPreBool", {"Id": str(i), "Value": "false"})

# Scenes
for s in list(scenes_elem): scenes_elem.remove(s)
for i, name in enumerate(SCENES):
    sc = ET.SubElement(scenes_elem, "Scene", {"Id": nid()})
    ET.SubElement(sc, "Name", {"Value": name})
    ET.SubElement(sc, "Annotation", {"Value": ""})
    ET.SubElement(sc, "IsEmpty", {"Value": "true"})
    ET.SubElement(sc, "Tempo", {"Value": "128"})
    ET.SubElement(sc, "TimeSignatureNumerator", {"Value": "4"})
    ET.SubElement(sc, "TimeSignatureDenominator", {"Value": "4"})

# NextPointeeId
npi = ls.find("NextPointeeId")
if npi is not None: npi.set("Value", str(_nid[0] + 5000))

out = b'<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(root, encoding="unicode").encode("utf-8")
with gzip.open(OUT, "wb") as f: f.write(out)

all_built = stems + instruments + returns
print(f"✅ {OUT} | {len(out)//1024}KB")
for t in all_built:
    n = t.find(".//Name/UserName")
    sends = t.findall(".//TrackSendHolder")
    print(f"  {t.tag}: {n.get('Value') if n is not None else '?'} | sends:{len(sends)}")
