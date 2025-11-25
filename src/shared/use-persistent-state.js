/* global localStorage */
import { useState } from 'preact/hooks'

export default function usePersistentState (key, initialState) {
  const stateFromLocalStorage = JSON.parse(localStorage.getItem(key))
  const [state, setState] = useState(stateFromLocalStorage || initialState)

  const setPersistentState = (newState) => {
    localStorage.setItem(key, JSON.stringify(newState))
    setState(newState)
  }

  return [state, setPersistentState, stateFromLocalStorage]
}
