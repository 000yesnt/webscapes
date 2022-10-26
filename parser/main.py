import json

import vdf

with open("soundscapes_all.txt") as f:
    in_scapes: vdf.VDFDict = vdf.load(f, mapper=vdf.VDFDict, merge_duplicate_keys=False)

final = {}

def safeget(i, idx, defl):
    try:
        return i[idx]
    except IndexError:
        return defl

def crawldict(data):
    looping = [dict(x) for x in data.get_all_for("playlooping")]
    playscape = [dict(x) for x in data.get_all_for("playsoundscape")]
    random = [dict(x) for x in data.get_all_for("playrandom")]
    return (looping, playscape, random)

for scape, data in in_scapes.items():
    # waves
    looping, playscape, random = crawldict(data)
    if random:
        for r in random:
            # unpacking each playrandom's "rndwave" into a list of waves
            r["waves"] = [x.lower() for _, x in r["rndwave"].items()]
            r.pop("rndwave")
    if looping:
        for l in looping:
            l["wave"] = l["wave"].lower()

    final[scape] = {"playlooping": looping, "playsoundscape": playscape, "playrandom": random}

for npass in range(3):
    print(f"pass {npass}")
    for idx, scape in final.items():
        # crawl through each soundscape's "playsoundscape", to merge the "playrandom" and "playlooping" lists
        if scape.get("playsoundscape"):
            for subidx, subscape in enumerate(scape["playsoundscape"]):
                try:
                    merge_scape = final[subscape["name"]]
                    # this isn't my proudest moment tbh
                    # what this does: every "playsoundscape" entry has a "volume" setting
                    # so, for accuracy, the following mess multiplies the volume of everything 
                    # in the child soundscape by the volume of the parent playsoundscape
                    
                    # for the child soundscape's "playlooping" and "playsoundscape" entries, 
                    # the volume will never be less than 10% (0.1)
                    for slooping in merge_scape.get("playlooping", {}):
                        r = round(float(slooping["volume"]) * float(subscape["volume"]), 2)
                        slooping["volume"] = r if r > 0.1 else 0.1
                    for ssoundscape in merge_scape.get("playsoundscape", {}):
                        r = round(float(ssoundscape["volume"]) * float(subscape["volume"]), 2)
                        ssoundscape["volume"] = r if r > 0.1 else 0.1
                    # for the child soundscape's "playrandom", the lower bound never goes under 5% (0.05)
                    # and the upper bound never goes under 10% (0.1)
                    for srandom in merge_scape.get("playrandom", {}):
                        vol_lower = round(float(srandom["volume"].split(",")[0]) * float(subscape["volume"]), 2)
                        vol_upper = round(float(srandom["volume"].split(",")[1]) * float(subscape["volume"]), 2)
                        srandom["volume"] = f"{vol_lower if vol_lower > 0.05 else 0.05},{vol_upper if vol_upper > 0.1 else 0.1}"
                    
                    scape["playlooping"] += merge_scape.get("playlooping", {})
                    scape["playsoundscape"] += merge_scape.get("playsoundscape", {})
                    scape["playrandom"] += merge_scape.get("playrandom", {})
                    scape["playsoundscape"].pop(subidx)
                except KeyError as e:
                    print(e)
                    continue

with open("scapes.json", "w") as f:
    json.dump(final, f, indent=4, sort_keys=True)