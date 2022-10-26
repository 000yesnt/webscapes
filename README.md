# webscapes

a barebones soundscape listener for the browser. doesn't come with any audio assets - get some from your copy of HL2 or [use my demo](https://dbd.yesnt.ga/fog/webscapes/)

im gonna document and improve this eventually

## in this repo

* a Python script to parse the soundscape scripts into json. requires [vdf](https://github.com/ValvePython/vdf)
* js script that has the player code
* html page to test the player
* scapes.json - a pre-generated soundscape list

## deploying

if you're using the repo's scapes.json, you need to extract the following folders to the index dir:

* ambient
* hl1
* music
* npc
* physics
* plats
* test
