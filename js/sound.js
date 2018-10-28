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

const store = {
  typeSet: {}
}

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
  init(toneSets) {
    toneSets.each((index, toneSet) => {
      const $toneSet = $(toneSet)
      const { fontType } = get.toneData($toneSet)
      const $childTones = $toneSet.find(nodes.trigger)
      const samplers = Array.from($childTones).map(toneNode => {
        const $toneNode = $(toneNode)
        const soundTarget = $toneNode.attr(flags.data.soundTarget)
        const toneSampler = new Tone.Sampler({'A1': `/assets/sounds/${fontType}/${soundTarget}.mp3`})
        toneSampler.toMaster()

        return {
          set: soundTarget,
          sampler: toneSampler
        }
      })
      store.typeSet[fontType] = {}
      samplers.forEach(toneSampler => {
        const { set, sampler } = toneSampler
        store.typeSet[fontType][set] = {
          sampler,
          isPlaying: false
        }
      })
    })
  }
}

$(document).ready(function() {
  const $tone = $(nodes.main)
  const hasTone = $tone.length > 0 || $tone !== null
  const { data } = flags

  if (hasTone) {
    set.init($tone)
    // console.log(store.typeSet)

    const $triggers = $(nodes.trigger)
    $triggers.on('click', event => {
      const $trigger = $(event.currentTarget)
      const { soundTarget, fontType } = get.toneData($trigger)
      const soundObj = store.typeSet[fontType][soundTarget]

      // update state
      soundObj.isPlaying = !soundObj.isPlaying
      // play sound
      soundObj.sampler.triggerAttack('A1')
    })
  }
})