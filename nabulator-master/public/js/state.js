/* global m */
'use strict'

import { google } from './google.js'

class State {
  //
  // Login handling.
  //

  async init () {
    this.email = await google.getEmail()
    if (this.email) {
      this.setSaves(await google.load())
      m.redraw()
    }
  }

  signIn () {
    google.signIn()
  }

  signOut () {
    this.email = null
    this.setSaves([])
  }

  //
  // Saves handling.
  //

  delSave () {
    if (this.currentSave !== -1) {
      this.saves.splice(this.currentSave, 1)
      this._updateSaves()
      this._saveToDrive()
    }
  }

  setSave (name) {
    if (this.hash && name) {
      if (this.currentSave !== -1) {
        this.saves[this.currentSave].name = name
      } else {
        const save = this.saves.find(s => s.name === name)
        if (save) {
          save.value = this.hash
        } else {
          this.saves.push({ name, value: this.hash })
        }
      }

      this._updateSaves()
      this._saveToDrive()
    }
  }

  setSaves (saves) {
    this.saves = saves || []
    this._updateSaves()
  }

  _saveToDrive () {
    if (this.email) {
      console.log('Saving:', this.saves)
      google.save(this.saves)
    }
  }

  _updateSaves () {
    this.saves.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1)
    this.currentSave = this.saves.findIndex(save => save.value === this.hash)
    this.currentSaveName = this.currentSave !== -1 ? this.saves[this.currentSave].name : null
  }

  //
  // Hash handling.
  //

  setHash () {
    // Cache handling.
    if (!window.location.hash) {
      window.location.hash = window.localStorage.getItem('cache') || this.hash
      return
    }

    // Store current hash.
    this.hash = window.location.hash.substr(1)

    // Cache the result.
    window.localStorage.setItem('cache', this.hash)

    // Calculation based on the hash.
    const [tuning, gauges, scale] = this._ensureArraySize(this.hash.split('/').slice(1), 3)
    this.gauges = this._ensureArraySize(gauges.split(','), this.numberOfStrings)
    this.notes = this._ensureArraySize(tuning.split(','), this.numberOfStrings)
    this.scale = scale

    this._updateTension()
    this._updateSaves()
  }

  _updateTension () {
    const notesCount = this.notes.join(' ').trim().split(' ').length
    const gaugesCount = this.gauges.join(' ').trim().split(' ').length
    const stringCount = Math.max(notesCount, gaugesCount)

    const [scaleEnd, scaleStart] = this.scale.split('-').map(scale => Number(scale))
    const scaleDelta = scaleStart ? (scaleEnd - scaleStart) / (stringCount - 1) : 0

    // Reset all calculated values.
    for (let ii = 0; ii < this.numberOfStrings; ++ii) {
      this.calculated.scales[ii] = ''
      this.calculated.tensions[ii] = ''
      this.calculated.widths[ii] = ''
    }

    // Iterate over each string.
    for (let ii = 0; ii < stringCount; ++ii) {
      const scale = scaleEnd - ii * scaleDelta

      const note = this.notes[ii]
      const gauge = this.gauges[ii]

      if (note && gauge) {
        const weight = this.data.gauges.find(g => g.name === gauge).weight
        const freq = this.data.notes.find(n => n.name === note).freq
        const tension = (weight * Math.pow(2 * scale * freq, 2)) / 386.4 * 4.45
        const width = Math.min(100, tension / 2)

        this.calculated.scales[ii] = scale.toFixed(2)
        this.calculated.tensions[ii] = tension.toFixed(2)
        this.calculated.widths[ii] = width
      }
    }
  }

  //
  // Miscellaneous.
  //

  escape () {
    if (this.isDialogShown) {
      this.isDialogShown = false
    } else {
      this.isDrawerOpen = false
    }
  }

  _ensureArraySize (arr, size) {
    while (arr.length < size) {
      arr.push('')
    }

    return arr
  }

  //
  // Fields and data.
  //

  constructor () {
    this.isDrawerOpen = false
    this.isDialogShown = false
    this.dialogValue = null
    this.hash = '/E2,A2,D3,G3,B3,E4,,/42,30,21,14p,11p,8p,,/25.5'
    this.numberOfStrings = 8
    this.email = null // Will be set if logged it.
    this.gauges = Array(this.numberOfStrings)
    this.notes = Array(this.numberOfStrings)
    this.scale = '25.5'
    this.currentSave = -1
    this.currentSaveName = null
    this.saves = []

    this.init()

    // Calculated values based on user selection.
    this.calculated = {
      scales: Array(this.numberOfStrings),
      tensions: Array(this.numberOfStrings),
      widths: Array(this.numberOfStrings)
    }

    // Dropdown select data.
    this.data = {
      scales: [
        { name: '24.5' },
        { name: '24.75' },
        { name: '25' },
        { name: '25.4' },
        { name: '25.5' },
        { name: '25.5 - 25', value: '25.5-25' },
        { name: '25 - 26.1', value: '25-26.1' },
        { name: '25.7 - 27', value: '25.7-27' },
        { name: '26' },
        { name: '26.2' },
        { name: '26.25' },
        { name: '26.25 - 25.5', value: '26.25-25.5' },
        { name: '26.5' },
        { name: '26.5 - 28', value: '26.5-28' },
        { name: '27' },
        { name: '27 - 25.5', value: '27-25.5' },
        { name: '28' },
        { name: '28 - 26.5', value: '28-26.5' },
        { name: '29' },
        { name: '30' },
        { name: '30.5' },
        { name: '34' },
        { name: '34.25' },
        { name: '34.5 - 33', value: '34.5-33' },
        { name: '35' },
        { name: '35 - 33', value: '35-33' },
        { name: '35.5' },
        { name: '36' },
        { name: '38' }
      ],
      notes: [
        { name: 'C0', freq: 16.35 },
        { name: 'C0#', freq: 17.32 },
        { name: 'D0', freq: 18.35 },
        { name: 'D0#', freq: 19.45 },
        { name: 'E0', freq: 20.60 },
        { name: 'F0', freq: 21.83 },
        { name: 'F0#', freq: 23.12 },
        { name: 'G0', freq: 24.50 },
        { name: 'G0#', freq: 25.96 },
        { name: 'A0', freq: 27.50 },
        { name: 'A0#', freq: 29.14 },
        { name: 'B0', freq: 30.87 },
        { name: 'C1', freq: 32.70 },
        { name: 'C1#', freq: 34.65 },
        { name: 'D1', freq: 36.71 },
        { name: 'D1#', freq: 38.89 },
        { name: 'E1', freq: 41.20 },
        { name: 'F1', freq: 43.65 },
        { name: 'F1#', freq: 46.25 },
        { name: 'G1', freq: 49.00 },
        { name: 'G1#', freq: 51.91 },
        { name: 'A1', freq: 55.00 },
        { name: 'A1#', freq: 58.27 },
        { name: 'B1', freq: 61.74 },
        { name: 'C2', freq: 65.41 },
        { name: 'C2#', freq: 69.30 },
        { name: 'D2', freq: 73.42 },
        { name: 'D2#', freq: 77.78 },
        { name: 'E2', freq: 82.41 },
        { name: 'F2', freq: 87.31 },
        { name: 'F2#', freq: 92.50 },
        { name: 'G2', freq: 98.00 },
        { name: 'G2#', freq: 103.83 },
        { name: 'A2', freq: 110.00 },
        { name: 'A2#', freq: 116.54 },
        { name: 'B2', freq: 123.47 },
        { name: 'C3', freq: 130.81 },
        { name: 'C3#', freq: 138.59 },
        { name: 'D3', freq: 146.83 },
        { name: 'D3#', freq: 155.56 },
        { name: 'E3', freq: 164.81 },
        { name: 'F3', freq: 174.61 },
        { name: 'F3#', freq: 185.00 },
        { name: 'G3', freq: 196.00 },
        { name: 'G3#', freq: 207.65 },
        { name: 'A3', freq: 220.00 },
        { name: 'A3#', freq: 233.08 },
        { name: 'B3', freq: 246.94 },
        { name: 'C4', freq: 261.63 },
        { name: 'C4#', freq: 277.18 },
        { name: 'D4', freq: 293.66 },
        { name: 'D4#', freq: 311.13 },
        { name: 'E4', freq: 329.63 },
        { name: 'F4', freq: 349.23 },
        { name: 'F4#', freq: 369.99 },
        { name: 'G4', freq: 392.00 },
        { name: 'G4#', freq: 415.30 },
        { name: 'A4', freq: 440.00 },
        { name: 'A4#', freq: 466.16 },
        { name: 'B4', freq: 493.88 },
        { name: 'C5', freq: 523.25 },
        { name: 'C5#', freq: 554.37 },
        { name: 'D5', freq: 587.33 },
        { name: 'D5#', freq: 622.25 },
        { name: 'E5', freq: 659.26 },
        { name: 'F5', freq: 698.46 },
        { name: 'F5#', freq: 739.99 },
        { name: 'G5', freq: 783.99 },
        { name: 'G5#', freq: 830.61 },
        { name: 'A5', freq: 880.00 },
        { name: 'A5#', freq: 932.33 },
        { name: 'B5', freq: 987.77 },
        { name: 'C6', freq: 1046.50 },
        { name: 'C6#', freq: 1108.73 },
        { name: 'D6', freq: 1174.66 },
        { name: 'D6#', freq: 1244.51 },
        { name: 'E6', freq: 1318.51 },
        { name: 'F6', freq: 1396.91 },
        { name: 'F6#', freq: 1479.98 },
        { name: 'G6', freq: 1567.98 },
        { name: 'G6#', freq: 1661.22 },
        { name: 'A6', freq: 1760.00 },
        { name: 'A6#', freq: 1864.66 },
        { name: 'B6', freq: 1975.53 },
        { name: 'C7', freq: 2093.00 },
        { name: 'C7#', freq: 2217.46 },
        { name: 'D7', freq: 2349.32 },
        { name: 'D7#', freq: 2489.02 },
        { name: 'E7', freq: 2637.02 },
        { name: 'F7', freq: 2793.83 },
        { name: 'F7#', freq: 2959.96 },
        { name: 'G7', freq: 3135.96 },
        { name: 'G7#', freq: 3322.44 },
        { name: 'A7', freq: 3520.00 },
        { name: 'A7#', freq: 3729.31 },
        { name: 'B7', freq: 3951.07 },
        { name: 'C8', freq: 4186.01 },
        { name: 'C8#', freq: 4434.92 },
        { name: 'D8', freq: 4698.64 },
        { name: 'D8#', freq: 4978.03 }
      ],
      gauges: [
        { name: 'Guitar', isDisabled: true },
        { name: '7p', weight: 0.00001085 },
        { name: '8p', weight: 0.00001418 },
        { name: '9p', weight: 0.00001794 },
        { name: '10p', weight: 0.00002215 },
        { name: '11p', weight: 0.00002680 },
        { name: '12p', weight: 0.00003190 },
        { name: '13p', weight: 0.00003744 },
        { name: '14p', weight: 0.00004342 },
        { name: '15p', weight: 0.00004984 },
        { name: '16p', weight: 0.00005671 },
        { name: '18', weight: 0.00006215 },
        { name: '17p', weight: 0.00006402 },
        { name: '19', weight: 0.00006947 },
        { name: '18p', weight: 0.00007177 },
        { name: '20', weight: 0.00007495 },
        { name: '21', weight: 0.00008293 },
        { name: '20p', weight: 0.00008861 },
        { name: '22', weight: 0.00009184 },
        { name: '22p', weight: 0.00010722 },
        { name: '24', weight: 0.00010857 },
        { name: '26', weight: 0.00012671 },
        { name: '24p', weight: 0.00012760 },
        { name: '28', weight: 0.00014666 },
        { name: '30', weight: 0.00017236 },
        { name: '32', weight: 0.00019347 },
        { name: '34', weight: 0.00021590 },
        { name: '36', weight: 0.00023964 },
        { name: '38', weight: 0.00026471 },
        { name: '39', weight: 0.00027932 },
        { name: '40', weight: 0.00029400, isApprox: true },
        { name: '42', weight: 0.00032279 },
        { name: '44', weight: 0.00035182 },
        { name: '46', weight: 0.00038216 },
        { name: '48', weight: 0.00041382 },
        { name: '49', weight: 0.00043014 },
        { name: '50', weight: 0.00045500, isApprox: true },
        { name: '52', weight: 0.00050000 },
        { name: '54', weight: 0.00053838 },
        { name: '56', weight: 0.00057598 },
        { name: '58', weight: 0.00062000, isApprox: true },
        { name: '59', weight: 0.00064191 },
        { name: '60', weight: 0.00066542 },
        { name: '62', weight: 0.00070697 },
        { name: '64', weight: 0.00074984 },
        { name: '66', weight: 0.00079889 },
        { name: '68', weight: 0.00084614 },
        { name: '70', weight: 0.00089304 },
        { name: '72', weight: 0.00094124 },
        { name: '74', weight: 0.00098869 },
        { name: '80', weight: 0.00115011 },
        { name: '84', weight: 0.00127206, isApprox: true },
        { name: '90', weight: 0.00145500, isApprox: true },
        { name: 'Bass', isDisabled: true },
        { name: '25b', weight: 0.00011200, isApprox: true },
        { name: '30b', weight: 0.00016600, isApprox: true }, // 0.0000112066
        { name: '32b', weight: 0.00019000 },
        { name: '35b', weight: 0.00022362 },
        { name: '40b', weight: 0.00029322 },
        { name: '45b', weight: 0.00037240 },
        { name: '50b', weight: 0.00046463 },
        { name: '55b', weight: 0.00054816 },
        { name: '60b', weight: 0.00066540 },
        { name: '65b', weight: 0.00079569 },
        { name: '70b', weight: 0.00093218 },
        { name: '75b', weight: 0.00104973 },
        { name: '80b', weight: 0.00116023 },
        { name: '85b', weight: 0.00133702 },
        { name: '90b', weight: 0.00150277 },
        { name: '95b', weight: 0.00169349 },
        { name: '100b', weight: 0.00179687 },
        { name: '105b', weight: 0.00198395 },
        { name: '110b', weight: 0.00227440 },
        { name: '115b', weight: 0.00238860, isApprox: true },
        { name: '120b', weight: 0.00250280 },
        { name: '125b', weight: 0.00274810 },
        { name: '130b', weight: 0.00301941 },
        { name: '135b', weight: 0.00315944 },
        { name: '140b', weight: 0.00339500, isApprox: true },
        { name: '145b', weight: 0.00363204 },
        { name: '150b', weight: 0.00386908, isApprox: true },
        { name: '155b', weight: 0.00410464, isApprox: true }
      ],
      tunings: [
        { name: 'Bass 4 - Standard E', value: 'E1,A1,D2,G2,,,,' },
        { name: 'Bass 4 - Standard D', value: 'D1,G1,C2,F2,,,,' },
        { name: 'Bass 4 - Drop D', value: 'D1,A1,D2,G2,,,,' },
        { name: 'Bass 4 - Drop C', value: 'C1,G1,C2,F2,,,,' },
        { name: 'Bass 5 - Standard B', value: 'B0,E1,A1,D2,G2,,,' },
        { name: 'Bass 5 - Standard A', value: 'A0,D1,G1,C2,F2,,,' },
        { name: 'Bass 5 - Drop A', value: 'A0,E1,A1,D2,G2,,,' },
        { name: 'Guitar 6 - Standard E', value: 'E2,A2,D3,G3,B3,E4,,' },
        { name: 'Guitar 6 - Standard D', value: 'D2,G2,C3,F3,A3,D4,,' },
        { name: 'Guitar 6 - Drop D', value: 'D2,A2,D3,G3,B3,E4,,' },
        { name: 'Guitar 6 - Drop C', value: 'C2,G2,C3,F3,A3,D4,,' },
        { name: 'Guitar 6 - Drop B', value: 'B1,F2#,B2,E3,G3#,C4#,,' },
        { name: 'Guitar 7 - Standard B', value: 'B1,E2,A2,D3,G3,B3,E4,' },
        { name: 'Guitar 7 - Drop A', value: 'A1,E2,A2,D3,G3,B3,E4,' },
        { name: 'Guitar 8 - Standard F#', value: 'F1#,B1,E2,A2,D3,G3,B3,E4' },
        { name: 'Guitar 8 - Drop E', value: 'E1,B1,E2,A2,D3,G3,B3,E4' }
      ]
    }
  }
}

export const state = new State()
