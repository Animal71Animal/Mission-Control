#!/usr/bin/env python3
import gzip, copy, re
import xml.etree.ElementTree as ET

TEMPLATE = "/home/ubuntu/wlp/projects/live-pa/WLP-LivePA-Template.als"
OUT      = "/home/ubuntu/wlp/projects/live-pa/WLP-LivePA-Template.als"

# ── device sources ───────────────────────────────────────────────────────────
DONOR_ALS = "/tmp/demo_sketch.als"

RETURN_RACKS = [
    ("BEAT RPT",     "/tmp/beat_repeat_echo_stripped.adg"),
    ("INSTANT RPT",  "/tmp/instant_repeat_stripped.adg"),
    ("FILTER PUMP",  "/tmp/filter_pumper_stripped.adg"),
    ("FROZEN SMEAR", "/tmp/frozen_smear_stripped.adg"),
    ("SUPER LOOP",   "/tmp/looper_stripped.adg"),
]

CHANNEL_RACKS = [
    ("VOX 1",  "/tmp/Cut-o-matic_stripped.adg"),
    ("VOX 2",  "/tmp/Cut-o-matic_stripped.adg"),
    ("DRUMS",  "/tmp/Re-Pulsor_stripped.adg"),
    ("PERC",   "/tmp/Re-Pulsor_stripped.adg"),
    ("MUSIC",  "/tmp/Washed_Out_stripped.adg"),
    ("BASS",   "/tmp/EQ_Three_Rack_stripped.adg"),
]

MIDI_INSTRUMENTS = [
    ("DRUM RACK", "DrumGroupDevice"),
    ("SYNTH 1",   "Operator"),
    ("SYNTH 2",   "Operator"),
]

# ── helpers ───────────────────────────────────────────────────────────────────
with gzip.open(TEMPLATE, "rb") as f:
    tmpl_xml = f.read().decode("utf-8")

tmpl_ids = [int(x) for x in re.findall(r'\bId="(\d+)"', tmpl_xml)]
max_id = max(tmpl_ids)
_offset = [max_id + 5000]

def next_offset():
    _offset[0] += 20000
    return _offset[0]

def remap(xml_str, offset):
    def shift_id(m):
        n = int(m.group(1))
        return f'Id="{n + offset}"' if n < 500000 else m.group(0)
    def shift_val(m):
        tag = m.group(1); n = int(m.group(2))
        return m.group(0).replace(f'"{n}"', f'"{n+offset}"') if 0 < n < 500000 else m.group(0)
    xml_str = re.sub(r'Id="(\d+)"', shift_id, xml_str)
    xml_str = re.sub(r'(PointeeId|LomId|LomIdView|AutomationTarget|ModulationTarget)\s+(?:Id|Value)="(\d+)"', shift_val, xml_str)
    return xml_str

def get_device_from_adg(adg_path):
    with gzip.open(adg_path, "rb") as f:
        c = f.read().decode("utf-8")
    root = ET.fromstring(c)
    gdp = root.find("GroupDevicePreset")
    dw = gdp.find("Device")
    return dw.find("AudioEffectGroupDevice") if dw is not None else None

def get_devices_container(track):
    """Navigate to the correct Devices element — it's at DeviceChain/DeviceChain/Devices."""
    outer_dc = track.find("DeviceChain")
    if outer_dc is None:
        return None
    inner_dc = outer_dc.find("DeviceChain")
    if inner_dc is None:
        # Create it
        inner_dc = ET.SubElement(outer_dc, "DeviceChain")
        ET.SubElement(inner_dc, "Devices")
        ET.SubElement(inner_dc, "SignalModulations")
    devices = inner_dc.find("Devices")
    if devices is None:
        devices = ET.SubElement(inner_dc, "Devices")
    return devices

def inject(track_name, device_elem, offset, tmpl_tracks):
    track = next((t for t in tmpl_tracks
                  if t.find(".//Name/UserName") is not None
                  and t.find(".//Name/UserName").get("Value") == track_name), None)
    if track is None:
        print(f"  ❌ Track '{track_name}' not found"); return
    devices = get_devices_container(track)
    if devices is None:
        print(f"  ❌ No Devices container in '{track_name}'"); return
    xml_str = ET.tostring(device_elem, encoding="unicode")
    remapped = ET.fromstring(remap(xml_str, offset))
    devices.append(remapped)

# ── load and process ──────────────────────────────────────────────────────────
tmpl_root = ET.fromstring(tmpl_xml)
tmpl_ls   = tmpl_root.find("LiveSet")
tmpl_tracks = list(tmpl_ls.find("Tracks"))

# Donor instruments
with gzip.open(DONOR_ALS, "rb") as f:
    donor_root = ET.fromstring(f.read().decode("utf-8"))
donor_tracks = list(donor_root.find("LiveSet").find("Tracks"))

drum_device = next(t for t in donor_tracks if t.find(".//DrumGroupDevice") is not None).find(".//DrumGroupDevice")
op_device   = next(t for t in donor_tracks if t.find(".//Operator") is not None).find(".//Operator")

sources = {"DrumGroupDevice": drum_device, "Operator": op_device}

print("MIDI instruments:")
for track_name, dev_tag in MIDI_INSTRUMENTS:
    inject(track_name, sources[dev_tag], next_offset(), tmpl_tracks)
    print(f"  ✅ {dev_tag} → {track_name}")

print("\nReturn FX racks:")
for track_name, adg_path in RETURN_RACKS:
    rack = get_device_from_adg(adg_path)
    if rack:
        inject(track_name, rack, next_offset(), tmpl_tracks)
        print(f"  ✅ {track_name}")

print("\nChannel insert racks:")
for track_name, adg_path in CHANNEL_RACKS:
    rack = get_device_from_adg(adg_path)
    if rack:
        inject(track_name, rack, next_offset(), tmpl_tracks)
        print(f"  ✅ {track_name}")

# Update NextPointeeId
npi = tmpl_ls.find("NextPointeeId")
if npi is not None:
    npi.set("Value", str(_offset[0] + 50000))

out = b'<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(tmpl_root, encoding="unicode").encode("utf-8")
with gzip.open(OUT, "wb") as f:
    f.write(out)
print(f"\n✅ Written: {len(out)//1024}KB uncompressed")
