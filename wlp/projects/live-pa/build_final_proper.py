#!/usr/bin/env python3
"""
WLP Live PA Template — Final
Properly converts .adg BranchPresets → AudioEffectBranch in live .als format.
"""
import gzip, copy, re
import xml.etree.ElementTree as ET

BASE    = "/tmp/demo_sketch.als"
OUT     = "/home/ubuntu/wlp/projects/live-pa/WLP-LivePA-Template.als"

STEM_TRACKS = [
    ("VOX 1",16),("VOX 2",16),("PERC",11),("DRUMS",11),
    ("BASS",13),("MUSIC",5),("LOOPER",9),("FX",7),
]
INSTRUMENT_TRACKS = [
    ("DRUM RACK",11),("SYNTH 1",5),("SYNTH 2",8),
]
RETURN_TRACKS = [
    ("BEAT RPT",14),("INSTANT RPT",13),("FILTER PUMP",5),
    ("FROZEN SMEAR",7),("SUPER LOOP",8),
]
CHANNEL_RACKS = [
    ("VOX 1",  "/tmp/Cut-o-matic.adg"),
    ("VOX 2",  "/tmp/Cut-o-matic.adg"),
    ("DRUMS",  "/tmp/Re-Pulsor.adg"),
    ("PERC",   "/tmp/Re-Pulsor.adg"),
    ("MUSIC",  "/tmp/Washed_Out.adg"),
    ("BASS",   "/tmp/EQ_Three_Rack.adg"),
]
RETURN_RACKS = [
    ("BEAT RPT",    "/tmp/beat_repeat_echo.adg"),
    ("INSTANT RPT", "/tmp/instant_repeat.adg"),
    ("FILTER PUMP", "/tmp/filter_pumper.adg"),
    ("FROZEN SMEAR","/tmp/frozen_smear.adg"),
    ("SUPER LOOP",  "/tmp/looper.adg"),
]
SCENES = [
    "TRANSITION (FX only)","LOW ENERGY","MID BUILD","PEAK / DROP",
    "BREAKDOWN","RE-BUILD","PEAK 2","OUTRO / FADE",
]
N_RETURNS = 5

# ── load base ─────────────────────────────────────────────────────────────────
with gzip.open(BASE,"rb") as f: base_xml = f.read().decode("utf-8")
all_ids = [int(x) for x in re.findall(r'Id="(\d+)"', base_xml)]
_nid = [max(all_ids)+1000]
def nid(): _nid[0]+=1; return str(_nid[0])

root = ET.fromstring(base_xml)
ls = root.find("LiveSet")
tracks_elem = ls.find("Tracks")
scenes_elem = ls.find("Scenes")
all_tracks = list(tracks_elem)
audio_tmpl  = next(t for t in all_tracks if t.tag=="AudioTrack")
midi_tmpl   = next(t for t in all_tracks if t.tag=="MidiTrack")
return_tmpl = next(t for t in all_tracks if t.tag=="ReturnTrack")

# ── adg → AudioEffectGroupDevice with populated Branches ─────────────────────
def adg_to_rack(adg_path, id_base):
    """Load .adg, convert BranchPresets → Branches, return ready AudioEffectGroupDevice."""
    with gzip.open(adg_path,"rb") as f: content = f.read().decode("utf-8")
    
    # Remap all IDs
    counter = [id_base]
    def shift_id(m):
        n = int(m.group(1))
        if n < 500000: counter[0]+=1; return f'Id="{counter[0]}"'
        return m.group(0)
    def shift_val(m):
        n = int(m.group(2))
        if 0 < n < 500000: counter[0]+=1; return m.group(0).replace(f'"{n}"',f'"{counter[0]}"')
        return m.group(0)
    content = re.sub(r'Id="(\d+)"', shift_id, content)
    content = re.sub(r'(PointeeId|LomId|LomIdView|AutomationTarget|ModulationTarget)\s+(?:Id|Value)="(\d+)"', shift_val, content)
    _nid[0] = max(_nid[0], counter[0]+1)
    
    adg_root = ET.fromstring(content)
    rack = adg_root.find(".//AudioEffectGroupDevice")
    if rack is None: return None
    
    # Convert BranchPresets → Branches
    branch_presets_elem = adg_root.find(".//BranchPresets")
    branches_elem = rack.find("Branches")
    if branches_elem is None:
        branches_elem = ET.SubElement(rack, "Branches")
    
    if branch_presets_elem is not None:
        for bp in list(branch_presets_elem):
            branch = ET.SubElement(branches_elem, "AudioEffectBranch")
            
            # Name
            bp_name = bp.find("Name")
            name_elem = ET.SubElement(branch, "Name")
            ET.SubElement(name_elem, "EffectiveName", {"Value": bp_name.text if bp_name is not None and bp_name.text else "Chain"})
            ET.SubElement(name_elem, "UserName", {"Value": ""})
            ET.SubElement(name_elem, "Annotation", {"Value": ""})
            ET.SubElement(name_elem, "MemorizedFirstClipName", {"Value": ""})
            
            ET.SubElement(branch, "IsSelected", {"Value": "false"})
            
            # DeviceChain
            dc = ET.SubElement(branch, "DeviceChain")
            a2a = ET.SubElement(dc, "AudioToAudioDeviceChain")
            devices = ET.SubElement(a2a, "Devices")
            ET.SubElement(a2a, "SignalModulations")
            
            # Add devices from DevicePresets
            dev_presets = bp.find("DevicePresets")
            if dev_presets is not None:
                for dp in list(dev_presets):
                    dev_wrapper = dp.find("Device")
                    if dev_wrapper is not None:
                        for dev in list(dev_wrapper):
                            devices.append(copy.deepcopy(dev))
            
            # BranchSelectorRange
            bsr = bp.find("BranchSelectorRange")
            if bsr is not None:
                branch.append(copy.deepcopy(bsr))
            else:
                bsr_new = ET.SubElement(branch, "BranchSelectorRange")
                ET.SubElement(bsr_new, "Min", {"Value": "0"})
                ET.SubElement(bsr_new, "Max", {"Value": "127"})
                ET.SubElement(bsr_new, "CrossfadeMin", {"Value": "0"})
                ET.SubElement(bsr_new, "CrossfadeMax", {"Value": "0"})
            
            ET.SubElement(branch, "IsSoloed", {"Value": "false"})
            ET.SubElement(branch, "Color", {"Value": "-1"})
    
    # Remove BranchPresets (no longer needed)
    bp_elem = rack.find("BranchPresets")
    if bp_elem is not None: rack.remove(bp_elem)
    rbp_elem = rack.find("ReturnBranchPresets")  
    if rbp_elem is not None: rack.remove(rbp_elem)
    
    return rack

# ── track builders ────────────────────────────────────────────────────────────
def make_send_holder(idx):
    h = ET.Element("TrackSendHolder",{"Id":str(idx)})
    s = ET.SubElement(h,"Send")
    ET.SubElement(s,"LomId",{"Value":"0"})
    ET.SubElement(s,"Manual",{"Value":"0.0003162277571"})
    mr = ET.SubElement(s,"MidiControllerRange")
    ET.SubElement(mr,"Min",{"Value":"0.0003162277571"})
    ET.SubElement(mr,"Max",{"Value":"1"})
    ET.SubElement(s,"AutomationTarget",{"Id":nid()})
    ET.SubElement(s,"ModulationTarget",{"Id":nid()})
    ET.SubElement(h,"Active",{"Value":"true"})
    return h

def fix_sends(t):
    sends = t.find(".//DeviceChain/Mixer/Sends")
    if sends is None:
        mx = t.find(".//DeviceChain/Mixer")
        if mx: sends = ET.SubElement(mx,"Sends")
        else: return
    for s in list(sends): sends.remove(s)
    for i in range(N_RETURNS): sends.append(make_send_holder(i))

def rename(t,name,color):
    for path in [".//Name/UserName",".//Name/EffectiveName"]:
        e=t.find(path)
        if e is not None: e.set("Value",name)
    for tag in ["ColorIndex","Color"]:
        c=t.find(tag)
        if c is not None: c.set("Value",str(color)); break

def strip_clips(t):
    for tag in ["MidiClip","AudioClip"]:
        for clip in list(t.iter(tag)):
            for p in t.iter():
                if clip in list(p): p.remove(clip); break

def clear_devices(t):
    d = t.find(".//DeviceChain/DeviceChain/Devices")
    if d is not None:
        for x in list(d): d.remove(x)

def get_insert_devices(t):
    inner_dc = t.find("DeviceChain/DeviceChain")
    if inner_dc is None:
        outer = t.find("DeviceChain")
        if outer is None: return None
        inner_dc = ET.SubElement(outer,"DeviceChain")
        ET.SubElement(inner_dc,"Devices")
        ET.SubElement(inner_dc,"SignalModulations")
    d = inner_dc.find("Devices")
    if d is None: d = ET.SubElement(inner_dc,"Devices")
    return d

def make_audio(name,color):
    t=copy.deepcopy(audio_tmpl); t.set("Id",nid())
    strip_clips(t); clear_devices(t); rename(t,name,color); fix_sends(t)
    return t

def make_midi(name,color):
    t=copy.deepcopy(midi_tmpl); t.set("Id",nid())
    strip_clips(t); clear_devices(t); rename(t,name,color); fix_sends(t)
    return t

def make_return(name,color):
    t=copy.deepcopy(return_tmpl); t.set("Id",nid())
    strip_clips(t); rename(t,name,color)
    return t

# ── build track list ──────────────────────────────────────────────────────────
for t in all_tracks: tracks_elem.remove(t)

stems       = [make_audio(n,c) for n,c in STEM_TRACKS]
instruments = [make_midi(n,c)  for n,c in INSTRUMENT_TRACKS]
returns     = [make_return(n,c) for n,c in [
    ("BEAT RPT",14),("INSTANT RPT",13),("FILTER PUMP",5),
    ("FROZEN SMEAR",7),("SUPER LOOP",8)
]]

for t in stems+instruments+returns: tracks_elem.append(t)
all_built = {t.find(".//Name/UserName").get("Value"):t for t in stems+instruments+returns if t.find(".//Name/UserName") is not None}

# ── inject MIDI instruments (Operator, DrumGroupDevice) from donor ─────────────
with gzip.open("/tmp/demo_sketch.als","rb") as f: donor_xml = f.read().decode("utf-8")
donor_root = ET.fromstring(donor_xml)
donor_tracks = list(donor_root.find("LiveSet").find("Tracks"))
drum_dev = next(t for t in donor_tracks if t.find(".//DrumGroupDevice") is not None).find(".//DrumGroupDevice")
op_dev   = next(t for t in donor_tracks if t.find(".//Operator") is not None).find(".//Operator")

def inject_midi_device(track_name, device):
    t = all_built.get(track_name)
    if not t: return
    d = get_insert_devices(t)
    if d is None: return
    xml_str = ET.tostring(device, encoding="unicode")
    offset = _nid[0]*10
    def sid(m): n=int(m.group(1)); _nid[0]+=1; return f'Id="{n+offset}"' if n<500000 else m.group(0)
    def sval(m): n=int(m.group(2)); return m.group(0).replace(f'"{n}"',f'"{n+offset}"') if 0<n<500000 else m.group(0)
    remapped = re.sub(r'Id="(\d+)"',sid,xml_str)
    remapped = re.sub(r'(PointeeId|LomId|LomIdView)\s+(?:Id|Value)="(\d+)"',sval,remapped)
    d.append(ET.fromstring(remapped))
    print(f"  ✅ {device.tag} → {track_name}")

print("MIDI instruments:")
inject_midi_device("DRUM RACK", drum_dev)
inject_midi_device("SYNTH 1", op_dev)
inject_midi_device("SYNTH 2", op_dev)

# ── inject FX racks (channel inserts + returns) ───────────────────────────────
print("\nChannel inserts:")
id_step = 100000
for i, (track_name, adg_path) in enumerate(CHANNEL_RACKS):
    rack = adg_to_rack(adg_path, _nid[0]+id_step*(i+1))
    if rack:
        t = all_built.get(track_name)
        if t:
            d = get_insert_devices(t)
            if d is not None:
                d.append(rack)
                branches = rack.find("Branches")
                n_branches = len(list(branches)) if branches else 0
                print(f"  ✅ {track_name}: {n_branches} branches")

print("\nReturn racks:")
return_racks_list = [
    ("BEAT RPT",    "/tmp/beat_repeat_echo.adg"),
    ("INSTANT RPT", "/tmp/instant_repeat.adg"),
    ("FILTER PUMP", "/tmp/filter_pumper.adg"),
    ("FROZEN SMEAR","/tmp/frozen_smear.adg"),
    ("SUPER LOOP",  "/tmp/looper.adg"),
]
for i, (track_name, adg_path) in enumerate(return_racks_list):
    rack = adg_to_rack(adg_path, _nid[0]+id_step*(i+10))
    if rack:
        t = all_built.get(track_name)
        if t:
            d = get_insert_devices(t)
            if d is not None:
                d.append(rack)
                branches = rack.find("Branches")
                n_branches = len(list(branches)) if branches else 0
                print(f"  ✅ {track_name}: {n_branches} branches")

# ── SendsPre ──────────────────────────────────────────────────────────────────
sp = ls.find("SendsPre")
if sp is not None:
    for x in list(sp): sp.remove(x)
    for i in range(N_RETURNS): ET.SubElement(sp,"SendPreBool",{"Id":str(i),"Value":"false"})

# ── Scenes ─────────────────────────────────────────────────────────────────────
for s in list(scenes_elem): scenes_elem.remove(s)
for name in SCENES:
    sc = ET.SubElement(scenes_elem,"Scene",{"Id":nid()})
    ET.SubElement(sc,"Name",{"Value":name}); ET.SubElement(sc,"Annotation",{"Value":""})
    ET.SubElement(sc,"IsEmpty",{"Value":"true"}); ET.SubElement(sc,"Tempo",{"Value":"128"})
    ET.SubElement(sc,"TimeSignatureNumerator",{"Value":"4"}); ET.SubElement(sc,"TimeSignatureDenominator",{"Value":"4"})

# ── NextPointeeId ─────────────────────────────────────────────────────────────
out_xml = ET.tostring(root, encoding="unicode")
final_max = max(int(x) for x in re.findall(r'Id="(\d+)"', out_xml))
npi = ls.find("NextPointeeId")
if npi is not None: npi.set("Value", str(final_max+1000))

out = b'<?xml version="1.0" encoding="UTF-8"?>\n' + out_xml.encode("utf-8")
with gzip.open(OUT,"wb") as f: f.write(out)
print(f"\n✅ {OUT} | {len(out)//1024}KB | NextPointeeId: {final_max+1000}")
