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
      return newState
  }
}
