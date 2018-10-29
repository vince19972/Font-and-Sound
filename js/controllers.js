import { store, params } from './store'

/* ------------------------------------
*  variables declarations
* ------------------------------------ */

const main = 'js-ctrl'

const nodes = {
  main: `.${main}`,
  typeface: `.${main}_typeface`,
  slide: `.${main}_slide`,
}

const flags = {
  data: {
    alterTarget: 'data-target',
    typeface: 'data-typeface',
    slideType: 'name'
  }
}

const variableTypes = [
  'wght', 'wdth', 'ital'
]

/* ------------------------------------
*  helper functions
* ------------------------------------ */

const check = {
  isVariableFont(type) {
    return variableTypes.filter(val => type === val).length > 0
  }
}

const get = {
  slideData(slide) {
    const { data } = flags
    const alterTarget = slide.attr(data.alterTarget)
    const fontType = slide.attr(data.typeface)
    const slideType = slide.attr(data.slideType)
    const initVal = slide.attr('value')
    const minVal = slide.attr('min')
    const maxVal = slide.attr('max')

    return {
      alterTarget,
      fontType,
      slideType,
      initVal,
      minVal,
      maxVal
    }
  },
  replacingStyle(target, type, val) {
    const vals = target.css('font-variation-settings')
    const reg = new RegExp(`"${type}"\\s\\d+((.\\d+)+)?`,'g')
    const changingVal = vals.match(reg)
    return vals.replace(changingVal, `"${type}" ${val}`)
  },
  scaleVal (num, in_min, in_max, out_min, out_max, isInt = true) {
    const val = (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
    return isInt ? parseInt(val) : val
  },
  mappedVal(type, param, initVal, minVal, maxVal) {
    const { min, max } = params[type][param]
    return get.scaleVal(initVal, minVal, maxVal, min, max)
  }
}

const set = {
  init(slides) {
    slides.each((index, slide) => {
      const $slide = $(slide)
      const { alterTarget, fontType, slideType, initVal, minVal, maxVal } = get.slideData($slide)

      if (alterTarget === 'heading-bass') {
        switch (slideType) {
          case 'wght':
            store.toneSets[fontType][alterTarget].params.pitch = `C${get.mappedVal('bass', 'pitch', initVal, minVal, maxVal)}`
            break
          case 'font-size':
            store.toneSets[fontType][alterTarget].params.volume = get.mappedVal('bass', 'volume', initVal, minVal, maxVal)
            break
          case 'wdth':
            Tone.Transport.bpm.value = get.scaleVal(initVal, minVal, maxVal, params.bpm.min, params.bpm.max)
            break
          case 'ital':
            store.toneSets[fontType][alterTarget].params.distortion = 0
            break
        }
      }
    })
  },
  updateSound(slide, val) {
    const { alterTarget, fontType, slideType, minVal, maxVal } = get.slideData(slide)
    const toneObj = store.toneSets[fontType][alterTarget]

    switch (slideType) {
      case 'wght':
        const currentPitch = toneObj.params.pitch

        toneObj.params.pitch = currentPitch.replace(/\d/, get.mappedVal('bass', 'pitch', val, minVal, maxVal))
        params.bass.pitch.val = toneObj.params.pitch
        break
      case 'font-size':
        toneObj.params.volume = get.mappedVal('bass', 'volume', val, minVal, maxVal)
        params.bass.volume.val = toneObj.params.volume
        break;
      case 'wdth':
        Tone.Transport.bpm.value = get.scaleVal(val, minVal, maxVal, params.bpm.min, params.bpm.max)
        break;
      case 'ital':
        toneObj.params.distortion = val
        params.bass.distortion = toneObj.params.distortion

        // effect
        toneObj.sampler.disconnect()
        const distortion = new Tone.Distortion(val)
        toneObj.sampler.connect(distortion)
        distortion.toMaster()
        break;
    }
  },
  updateStyle(target, val, type, isVariableFont) {
    let unit = ''

    if (isVariableFont) {
      const newVal = get.replacingStyle(target, type, val)
      target.css('font-variation-settings', newVal)
    } else {
      switch (type) {
        case 'font-size':
          unit = 'vw'
          break
        case 'line-height':
          unit = 'em'
          break
        case 'letter-spacing':
          unit = 'em'
          break
      }
      target.css(type, `${val}${unit}`)
    }
  }
}

/* ------------------------------------
*  main programm
* ------------------------------------ */

$(document).ready(function() {
  const $slides = $(nodes.slide)
  const hasSlide = $slides.length > 0 || $slides !== null
  const { data } = flags

  if (hasSlide) {
    set.init($slides)

    $slides.on('input', event => {
      const $slide = $(event.currentTarget)
      const val = $slide.val()
      const { alterTarget, fontType, slideType } = get.slideData($slide)
      const isVarFont = check.isVariableFont(slideType)
      const $target = $(`${nodes.typeface}[${data.alterTarget}='${alterTarget}'][${data.typeface}='${fontType}']`)

      set.updateStyle($target, val, slideType, isVarFont)
      set.updateSound($slide, val)
    })

  }
})