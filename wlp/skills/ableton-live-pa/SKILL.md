---
name: ableton-live-pa
description: Build and optimize Ableton Live templates and setups for live PA/DJ performance. Use when creating live performance templates, mapping MIDI controllers for hands-on control, designing transition racks, setting up factory pack-based instrument racks, or building energy-level-organized live sets for club/strip club environments. Covers CPU optimization, zero-downtime failover, macro mapping, and genre-specific rack design.
---

# Ableton Live PA Setup

Build bulletproof live performance templates in Ableton Live. Designed for DJs and producers performing in clubs, strip clubs, and live PA environments where reliability and quick access matter.

## When to Use This Skill

- Building a live performance template from scratch
- Setting up MIDI controller mappings for hands-on live control
- Creating transition racks and effect chains for seamless mixing
- Organizing sounds by energy level for quick set flow
- Optimizing CPU usage for stable live performance
- Designing failover strategies (backup audio, emergency templates)

## Core Principles

**Reliability > Complexity**
- Factory packs first (zero missing files)
- Pre-loaded racks (no loading mid-set)
- Color-coded by energy (visual flow)
- CPU headroom (never above 70%)

**Hands-On Control**
- Macros mapped to physical knobs/faders
- One-knob effects (filter, reverb, delay, glitch)
- Drum pads for one-shot triggers
- Crossfader for seamless transitions

## Live Template Structure

```
Live Set: SRB Live Template
├── Track 1: DRUMS (Factory Drum Rack)
│   ├── Macro 1: Filter
│   ├── Macro 2: Reverb
│   ├── Macro 3: Delay
│   └── Macro 4: Distortion
├── Track 2: BASS (Factory Bass Rack)
├── Track 3: SYNTHS (Factory Synth Rack)
├── Track 4: PADS (Factory Pad Rack)
├── Track 5: VOCALS (Sampler with acapellas)
├── Track 6: FX (One-shots, impacts, risers)
├── Track 7: TRANSITION (White noise, sweeps)
├── Track 8: MASTER (Limiter, EQ, Meter)
└── Return A: REVERB (Shared reverb send)
```

## Factory Packs for Live PA

| Pack | Use Case | Energy |
|------|----------|--------|
| Drum Booth | Electronic drum kits | High |
| Beat Tools | Loop layers, grooves | Medium |
| Drive and Glow | Synths, bass, leads | High |
| Grand Piano | Breakdown moments | Low |
| Latin Percussion | Crowd energy | High |
| Electric Keyboards | Soulful transitions | Medium |
| Orchestral Strings | Epic buildups | Variable |
| Latin Percussion | Live energy injection | High |

## Color Coding

- **Green** — Low energy, warm-up, chill
- **Yellow** — Building, mid-energy
- **Orange** — Peak time, high energy
- **Red** — Maximum impact, drops
- **Blue** — Transitions, effects, ambient
- **Purple** — Vocals, acapellas

## Macro Mapping Strategy

Map these to your controller for instant access:

| Macro | Control | Effect |
|-------|---------|--------|
| 1 | Knob 1 | Filter (lowpass/highpass) |
| 2 | Knob 2 | Reverb send |
| 3 | Knob 3 | Delay send |
| 4 | Knob 4 | Distortion/Drive |
| 5 | Fader 1 | Track volume |
| 6 | Button 1 | Mute toggle |
| 7 | Button 2 | Solo toggle |
| 8 | Button 3 | Effect bypass |

## CPU Optimization

- Freeze tracks you're not actively tweaking
- Use Audio tracks instead of MIDI where possible
- Limit reverb instances (use Return tracks)
- Disable unused plugins
- Set sample rate to 44.1kHz (not 96kHz)
- Buffer size: 256-512 samples (balance latency vs stability)

## Failover Checklist

- [ ] Backup laptop or audio interface ready
- [ ] Emergency template with 4 core tracks only
- [ ] Audio interface tested at venue
- [ ] Power conditioner/surge protector
- [ ] Backup USB drive with project files
- [ ] Phone hotspot for emergency downloads

## Building the Template

1. **Load factory packs** into Drum Racks and Instrument Racks
2. **Map macros** to your controller
3. **Color code** tracks by energy level
4. **Save as Template** (File → Save Live Set as Template)
5. **Test CPU** with all tracks playing simultaneously
6. **Practice transitions** using only the template

## Quick Reference

**One-Knob Effects:**
- Filter sweep: Auto Filter → Macro mapped to frequency
- Reverb wash: Reverb → Macro mapped to decay + mix
- Delay throw: Delay → Macro mapped to feedback + mix
- Glitch: Beat Repeat → Macro mapped to interval + chance

**Transition Tools:**
- White noise sweep: Operator → noise waveform → filter sweep
- Riser: Sampler → reversed cymbal → pitch automation
- Impact: Sampler → kick drum → heavy compression

---

**Next Steps:**
1. Load factory packs into racks
2. Map macros to controller
3. Color code by energy
4. Save as template
5. Test at home, then test at venue
