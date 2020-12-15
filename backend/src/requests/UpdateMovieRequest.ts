/**
 * Fields in a request to update a single Movie item.
 */
export interface UpdateMovieRequest {
  name: string
  dueDate: string
  done: boolean
}