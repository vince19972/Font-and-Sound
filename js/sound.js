import { store, params } from './store'

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
  },
}

const set = {
  initToneObj(toneSets, samplerPitch) {
    toneSets.each((index, toneSet) => {
      const $toneSet = $(toneSet)
      const { fontType } = get.toneData($toneSet)
      const $childTones = $toneSet.find(nodes.trigger)

      // get samplers keys and values
      const samplers = Array.from($childTones).map(toneNode => {
        const $toneNode = $(toneNode)
        const soundTarget = $toneNode.attr(flags.data.soundTarget)
        const samplerObj = {}
        samplerObj[samplerPitch] = `/assets/sounds/${fontType}/${soundTarget}.mp3`
        const toneSampler = new Tone.Sampler(samplerObj)
        toneSampler.toMaster()

        return {
          set: soundTarget,
          sampler: toneSampler
        }
      })

      // construct tone objects
      store.toneSets[fontType] = {}
      samplers.forEach(toneSampler => {
        const { set, sampler } = toneSampler
        store.toneSets[fontType][set] = {
          sampler,
          isPlaying: false,
          params: {
            pitch: params.bass.pitch
          }
        }
      })
    })
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
    const { pitch: bassPitch, interval: bassInterval } = params.bass

    // init basic settings
    set.initToneObj($tone, bassPitch.val)
    set.initToneSetting()

    // trigger event
    $triggers.on('click', event => {
      const $trigger = $(event.currentTarget)
      const { soundTarget, fontType } = get.toneData($trigger)
      const soundObj = store.toneSets[fontType][soundTarget]

      // update state
      soundObj.isPlaying = !soundObj.isPlaying
      // play sound
      if (soundObj.isPlaying) {
        Tone.Transport.scheduleRepeat(() => {
          soundObj.sampler.triggerAttack(bassPitch.val)
        }, bassInterval)
        Tone.Transport.start()
      } else {
        Tone.Transport.stop()
      }
    })
  }
})