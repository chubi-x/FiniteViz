export function meshReducer (state, action) {
  const { type, payload } = action
  let newState
  switch (type) {
    case 'coordinates':
      newState = {
        ...state,
        coordinates: payload
      }
      return newState
    case 'elements':
      newState = {
        ...state,
        elements: payload
      }
      return newState
    case 'splitting':
      newState = {
        ...state,
        splitting: payload
      }
      return newState
    default:
      return state
  }
}

export function activeMeshPropStateReducer (state, action) {
  const { type, payload } = action
  let newState
  switch (type) {
    case 'coordinates':
      newState = {
        ...state,
        showCoordinates: payload
      }
      return newState
    case 'elements':
      newState = {
        ...state,
        showElements: payload
      }
      return newState
    case 'splitting':
      newState = {
        ...state,
        showSplits: payload
      }
      return newState
    case 'baseMesh':
      newState = {
        ...state,
        showBaseMesh: payload
      }
      return newState
    default:
      return state
  }
}

export function meshMetadataReducer (state, action) {
  const { type, payload } = action
  let newState
  switch (type) {
    case 'numDims':
      newState = { ...state, numDims: payload }
      return newState
    case 'numNodes':
      newState = { ...state, numNodes: payload }
      return newState
    case 'numElements':
      newState = { ...state, numElements: payload }
      return newState
    case 'nodesPerElement':
      newState = { ...state, nodesPerElement: payload }
      return newState
    default:
      return state
  }
}
