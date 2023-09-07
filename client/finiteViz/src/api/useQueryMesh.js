import { useMutation } from '@tanstack/react-query'
import { generateMesh } from '.'
export function useGenerateMesh () {
  return useMutation(generateMesh)
}
