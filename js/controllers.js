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

    return {
      alterTarget,
      fontType,
      slideType
    }
  },
  replacingStyle(target, type, val) {
    const vals = target.css('font-variation-settings')
    const reg = new RegExp(`"${type}"\\s\\d+((.\\d+)+)?`,'g')
    const changingVal = vals.match(reg)
    return vals.replace(changingVal, `"${type}" ${val}`)
  }
}

const set = {
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
      }
      target.css(type, `${val}${unit}`)
    }
  }
}

$(document).ready(function() {
  const $slides = $(nodes.slide)
  const hasSlide = $slides.length > 0 || $slides !== null
  const { data } = flags

  if (hasSlide) {

    $slides.on('input', event => {
      const $slide = $(event.currentTarget)
      const val = $slide.val()
      const { alterTarget, fontType, slideType } = get.slideData($slide)
      const isVarFont = check.isVariableFont(slideType)
      const $target = $(`${nodes.typeface}[${data.alterTarget}='${alterTarget}'][${data.typeface}='${fontType}']`)

      set.updateStyle($target, val, slideType, isVarFont)
    })

  }
})