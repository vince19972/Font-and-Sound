import { store, params, helpers } from './store'

/* ------------------------------------
*  variables declarations
* ------------------------------------ */

const main = 'js-tone'

const nodes = {
  main: `.${main}`,
  trigger: `.${main}_trigger`,
}

const flags = {
  data: {
    soundTarget: 'data-target',
    typeface: 'data-typeface',
  }
}

/* ------------------------------------
*  helper functions
* ------------------------------------ */

const get = {
  toneData(target) {
    const { data } = flags
    const soundTarget = target.attr(data.soundTarget)
    const fontType = target.attr(data.typeface)

    return {
      soundTarget,
      fontType
    }
  }
}

const set = {
  initMelody(toneNodes, fontType, soundTarget) {
    // console.log(store)
    // get timbre objects
    const toneObjs = Array.from(toneNodes).map(toneNode => {
      const $toneNode = $(toneNode)
      const { melody } = store[fontType]
      const { filter, frequency } = params.melody

      // timbre settings
      const toneFilter = new Tone.Filter(filter.val, "highpass")
      toneFilter.toMaster()

      const ampEnv = new Tone.AmplitudeEnvelope({
        "attack": 0,
        "decay": 0,
        "sustain": 0.2,
        "release": 0
      })
      ampEnv.releaseCurve = "linear"
      ampEnv.connect(toneFilter)

      const osc = new Tone.Oscillator(frequency.val,  "sawtooth")
      osc.connect(ampEnv)
      osc.start()

      return {
        melody,
        toneFilter,
        ampEnv,
        osc
      }
    })

    toneObjs.forEach(toneObj => {
      const { melody, toneFilter, ampEnv, osc } = toneObj
      store.toneSets[fontType][soundTarget] = {
        melody,
        toneFilter,
        ampEnv,
        osc,
        isPlaying: false,
        params: {
          step: 0
        }
      }
    })
  },
  initBass(toneNodes, samplerPitch, fontType, soundTarget) {
    // get samplers keys and values
    const samplers = Array.from(toneNodes).map(toneNode => {
      const $toneNode = $(toneNode)
      const samplerObj = {}
      samplerObj[samplerPitch] = `/assets/sounds/${fontType}/${soundTarget}.mp3`
      const toneSampler = new Tone.Sampler(samplerObj)
      toneSampler.toMaster()

      return {
        sampler: toneSampler
      }
    })

    // construct tone objects
    samplers.forEach(toneSampler => {
      const { sampler } = toneSampler
      store.toneSets[fontType][soundTarget] = {
        sampler,
        isPlaying: false,
        params: {
          pitch: params.bass.pitch
        }
      }
    })
  },
  initToneObj(toneSet, samplerPitch, isBass) {
    const $toneSet = $(toneSet)
    const { fontType, soundTarget } = get.toneData($toneSet)

    if ($.isEmptyObject(store.toneSets))
      store.toneSets[fontType] = {}

    if (isBass)
      set.initBass($toneSet, samplerPitch, fontType, soundTarget)
    else
      set.initMelody($toneSet, fontType, soundTarget)
  },
  initToneSetting() {
    const { bpm, timeSignature } = params
    Tone.Transport.bpm.value = bpm.val
    Tone.Transport.timeSignature = timeSignature
  }
}

/* ------------------------------------
*  main programm
* ------------------------------------ */

$(document).ready(function() {
  const $tone = $(nodes.main)
  const hasTone = $tone.length > 0 || $tone !== null
  const { data } = flags

  // tone settings
  if (hasTone) {
    // vars declaration
    const $triggers = $(nodes.trigger)
    const {
      pitch: bassPitch,
      interval: bassInterval,
      volume: bassVolume
    } = params.bass

    // init
    $tone.each((index, toneSet) => {
      const $toneSet = $(toneSet)
      const { soundTarget } = get.toneData($toneSet)

      // check tone type
      const isBass = soundTarget === 'heading-bass'

      // init settings
      set.initToneObj($toneSet, bassPitch.val, isBass)
      set.initToneSetting()
    })

    // trigger event
    $triggers.on('click', event => {
      const $trigger = $(event.currentTarget)
      const { fontType } = get.toneData($trigger)
      // const soundObj = store.toneSets[fontType][soundTarget]
      const bassObj = store.toneSets[fontType]['heading-bass']
      const melodyObj = store.toneSets[fontType]['paragraph-melody']

      // play sound
      if (!bassObj.isPlaying) {
        // bass settings
        Tone.Transport.scheduleRepeat(() => {
          bassObj.sampler.triggerAttack(bassPitch.val)
          bassObj.sampler.volume.value = bassVolume.val
        }, bassInterval)

        // melody settings
        Tone.Transport.scheduleRepeat(() => {
          // melodyObj.osc.frequency.value = 'C1'
          melodyObj.ampEnv.triggerAttack()
        }, "2n")

        // transport
        Tone.Transport.start()
      } else {
        melodyObj.ampEnv.triggerRelease()
        Tone.Transport.stop()
      }

      // update state
      bassObj.isPlaying = !bassObj.isPlaying

      // update style
      bassObj.isPlaying
        ? $triggers.addClass('-is-active')
        : $triggers.removeClass('-is-active')
    })
  }
})