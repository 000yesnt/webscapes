function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

function getRandomFloat(min, max, decimals) {
  const str = parseFloat((Math.random() * (max - min) + min)).toFixed(decimals);

  return parseFloat(str);
}

const setRandomInterval = (intervalFunction, minDelay, maxDelay) => {
    let timeout;
  
    const runInterval = () => {
      const timeoutFunction = () => {
        intervalFunction();
        runInterval();
      };
  
      const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  
      timeout = setTimeout(timeoutFunction, delay);
    };
  
    runInterval();
  
    return {
      clear() { clearTimeout(timeout) },
    };
  };

const loop_c = new window.AudioContext()
const rand_c = new window.AudioContext()
var scapes = {}
var playRandomList = []
var playLoopingList = []

function summonRandom(wave) {
    const randwave = wave.waves[Math.floor(Math.random() * wave.waves.length)]
    let r_audthing = new Audio(randwave)
    let r_audtrack = rand_c.createMediaElementSource(r_audthing)
    let pitchLower = wave.pitch.split(",")[0] / 100
    let pitchUpper = wave.pitch.split(",")[1] / 100
    let volLower = wave.volume.split(",")[0]
    let volUpper = wave.volume.split(",")[1]

    if(isNaN(pitchUpper)) {
      pitchUpper = pitchLower
    }

    r_audthing.playbackRate = getRandomFloat(pitchLower, pitchUpper, 2)
    r_audthing.preservesPitch = false
    r_audthing.volume = getRandomFloat(volLower, volUpper, 2)
    r_audtrack.connect(rand_c.destination)
    r_audthing.play()
    console.log("playing (random): " + randwave + " at " + r_audthing.volume*100 + "%")
}

class LoopingPlayer {
  constructor(path, rate, volume) {
    this.audthing = new Audio(path)
    this.audtrack = loop_c.createMediaElementSource(this.audthing)

    this.audcmp = loop_c.createDynamicsCompressor()
    this.audcmp.threshold.setValueAtTime(-60, loop_c.currentTime)
    this.audcmp.knee.setValueAtTime(40, loop_c.currentTime)
    this.audcmp.ratio.setValueAtTime(12, loop_c.currentTime)
    this.audcmp.attack.setValueAtTime(0, loop_c.currentTime)
    this.audcmp.release.setValueAtTime(1, loop_c.currentTime)
  
    if(isNaN(rate)) {
      rate = 1
    }
    this.audthing.playbackRate = rate
    this.audthing.preservesPitch = false
    this.audthing.volume = volume
    this.audthing.loop = true 

    this.audtrack.connect(this.audcmp)
    this.audcmp.connect(loop_c.destination)
    this.audthing.play()

    console.log("playing (loop): " + path + " at " + this.audthing.volume*100 + "%")
  }

  kill() {
    this.audthing.pause()
  }
}

$.getJSON("scapes.json", function(data) {
  scapes = data
})

function summonAudio(scapename) {
    let x = scapes[scapename]

    if(playRandomList.length > 0) {
      for(const r of playRandomList) {
        r.clear()
      }
      playRandomList = []
    }
    if(playLoopingList.length > 0) {
      for(const r of playLoopingList) {
        r.kill()
      }
      playLoopingList = []
    }

    for(const r of x.playrandom) {
        let t_lowerBound = r.time.split(",")[0] * 1000
        let t_upperBound = r.time.split(",")[1] * 1000
        const randival = setRandomInterval((x = r) => summonRandom(x), t_lowerBound, t_upperBound)
        playRandomList.push(randival)
    }

    for(const l of x.playlooping) {
      const looper = new LoopingPlayer(l.wave, l.pitch/100, l.volume)
      playLoopingList.push(looper)
    }
}