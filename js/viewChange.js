/* ------------------------------------
*  variables declarations
* ------------------------------------ */

const main = 'js-view'

const nodes = {
  main: `.${main}`,
  trigger: `.${main}_trigger`,
  textChange: `.${main}_textChange`,
}

const flags = {
  data: {
    textChange: 'data-text-change'
  }
}

/* ------------------------------------
*  store
* ------------------------------------ */

const store = {
  nowSoundView: false,
  title_heading: {
    typo: 'HEADING',
    sound: 'BASS'
  },
  title_paragraph: {
    typo: 'PARAGRAPH',
    sound: 'OSCILLTATOR'
  },
  bass_pitch: {
    typo: 'weight',
    sound: 'pitch'
  },
  bass_pitch_min: {
    typo: '250',
    sound: 'C0'
  },
  bass_pitch_max: {
    typo: '900',
    sound: 'C8'
  },
  bass_volume: {
    typo: 'size',
    sound: 'volume'
  },
  bass_volume_min: {
    typo: '1',
    sound: '-24'
  },
  bass_volume_max: {
    typo: '10',
    sound: '24'
  },
  bass_bpm: {
    typo: 'width',
    sound: 'bpm'
  },
  bass_bpm_min: {
    typo: '75',
    sound: '50'
  },
  bass_bpm_max: {
    typo: '125',
    sound: '225'
  },
  bass_distort: {
    typo: 'italic',
    sound: 'distort'
  },
  bass_distort_min: {
    typo: '0',
    sound: '0'
  },
  bass_distort_max: {
    typo: '1',
    sound: '1'
  },
  osc_filter: {
    typo: 'line height',
    sound: 'filter'
  },
  osc_filter_min: {
    typo: '1.0',
    sound: '0'
  },
  osc_filter_max: {
    typo: '5.0',
    sound: '5000'
  },
  osc_frequency: {
    typo: 'letter spacing',
    sound: 'frequency'
  },
  osc_frequency_min: {
    typo: '0',
    sound: '120'
  },
  osc_frequency_max: {
    typo: '1',
    sound: '2400'
  },
  osc_volume: {
    typo: 'size',
    sound: 'volume'
  },
  osc_volume_min: {
    typo: '8',
    sound: '-40'
  },
  osc_volume_max: {
    typo: '40',
    sound: '24'
  },
}

/* ------------------------------------
*  main programm
* ------------------------------------ */

$(document).ready(function() {
  const $trigger = $(nodes.trigger)
  const hasTrigger = $trigger.length > 0 || $slides !== null

  if (hasTrigger) {
    const $textChangeTargets = $(nodes.textChange)

    $trigger.on('click', event => {
      store.nowSoundView = !store.nowSoundView
      const flag = store.nowSoundView ? 'sound' : 'typo'

      if (store.nowSoundView) {
        $trigger.html('TO TYPOGRAPHY VIEW')
      } else {
        $trigger.html('TO SOUND VIEW')
      }

      $textChangeTargets.each((index, target) => {
        const $target = $(target)
        const type = $target.attr(flags.data.textChange)
        const text = store[type][flag]

        $target.html(text)
      })

    })

  }
})