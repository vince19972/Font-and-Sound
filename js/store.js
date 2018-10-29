export const store = {
  toneSets: {}
}

export const params = {
  bpm: {
    val: 100,
    min: 50,
    max: 225
  },
  timeSignature: 4,
  bass: {
    pitch: {
      val: 'C2',
      min: 0,
      max: 8
    },
    volume: {
      val: 8,
      min: -24,
      max: 24
    },
    distortion: 0,
    interval: '4n'
  }
}