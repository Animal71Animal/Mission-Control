#!/usr/bin/env python3
"""
WLP Live PA Template Customizer
Takes a real Ableton .als as base, renames tracks, strips all MIDI clips → blank set.
"""

import gzip
import xml.etree.ElementTree as ET

BASE_ALS = "/tmp/base_real.als"
OUT_ALS  = "/home/ubuntu/wlp/projects/live-pa/WLP-LivePA-Template.als"

DESIRED_TRACKS = [
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

RETURN_NAMES = ["REVERB", "DELAY"]


def strip_clips(track):
    """Remove all MidiClip and AudioClip elements from a track's clip slots."""
    for clip in track.findall('.//MidiClip'):
        parent = None
        # Find parent and remove
        for elem in track.iter():
            if clip in list(elem):
                elem.remove(clip)
                break
    for clip in track.findall('.//AudioClip'):
        for elem in track.iter():
            if clip in list(elem):
                elem.remove(clip)
                break


def main():
    print(f"Loading base: {BASE_ALS}")
    with gzip.open(BASE_ALS, "rb") as f:
        content = f.read().decode("utf-8")

    root = ET.fromstring(content)
    live_set = root.find("LiveSet")
    tracks_elem = live_set.find("Tracks")
    scenes_elem = live_set.find("Scenes")
    returns_elem = live_set.find("ReturnTracks")

    all_tracks = list(tracks_elem)
    print(f"Found {len(all_tracks)} tracks")

    # Keep only 8 tracks, delete extras
    for t in all_tracks[len(DESIRED_TRACKS):]:
        tracks_elem.remove(t)
        print(f"  Removed extra track")

    # Rename, recolor, strip clips
    for i, desired in enumerate(DESIRED_TRACKS):
        if i >= len(all_tracks):
            break
        t = all_tracks[i]

        # Strip all clips
        for clip_tag in ["MidiClip", "AudioClip"]:
            for clip in list(t.iter(clip_tag)):
                for elem in t.iter():
                    if clip in list(elem):
                        elem.remove(clip)
                        break

        # Rename
        for tag in [".//Name/UserName", ".//Name/EffectiveName"]:
            e = t.find(tag)
            if e is not None:
                e.set("Value", desired["name"])

        # Recolor
        color_elem = t.find("ColorIndex")
        if color_elem is not None:
            color_elem.set("Value", str(desired["color"]))

        # Convert MidiTrack → AudioTrack tag if needed
        # (keep as-is, Live handles both in session view)

        print(f"  Track {i}: → {desired['name']} (clips stripped)")

    # Rename scenes — keep only 8
    if scenes_elem is not None:
        all_scenes = list(scenes_elem)
        # Remove all existing scenes
        for s in all_scenes:
            scenes_elem.remove(s)
        # Add our scenes fresh
        for s_idx, scene_name in enumerate(SCENES):
            new_scene = ET.SubElement(scenes_elem, "Scene", {"Id": str(s_idx)})
            ET.SubElement(new_scene, "Name", {"Value": scene_name})
            ET.SubElement(new_scene, "Annotation", {"Value": ""})
            ET.SubElement(new_scene, "IsEmpty", {"Value": "true"})
            ET.SubElement(new_scene, "Tempo", {"Value": "128"})
            ET.SubElement(new_scene, "TimeSignatureNumerator", {"Value": "4"})
            ET.SubElement(new_scene, "TimeSignatureDenominator", {"Value": "4"})
            print(f"  Scene {s_idx}: {scene_name}")

    # Rename returns
    if returns_elem is not None:
        ret_tracks = list(returns_elem)
        for i, ret_name in enumerate(RETURN_NAMES):
            if i < len(ret_tracks):
                t = ret_tracks[i]
                for tag in [".//Name/UserName", ".//Name/EffectiveName"]:
                    e = t.find(tag)
                    if e is not None:
                        e.set("Value", ret_name)
                # Strip clips from returns too
                for clip_tag in ["MidiClip", "AudioClip"]:
                    for clip in list(t.iter(clip_tag)):
                        for elem in t.iter():
                            if clip in list(elem):
                                elem.remove(clip)
                                break
                print(f"  Return: → {ret_name}")

    # Serialize
    xml_bytes = b'<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(root, encoding="unicode").encode("utf-8")

    with gzip.open(OUT_ALS, "wb") as f:
        f.write(xml_bytes)

    print(f"\n✅ Written: {OUT_ALS}")


if __name__ == "__main__":
    main()
