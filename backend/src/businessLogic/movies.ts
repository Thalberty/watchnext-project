import * as uuid from 'uuid'

import { MovieItem } from '../models/MovieItem'
import { MovieUpdate } from '../models/MovieUpdate'
import { MovieAccess } from '../dataLayer/movieAccess'
// import { CreateGroupRequest } from '../requests/CreateGroupRequest'
import { parseUserId } from '../auth/utils'
import { CreateMovieRequest } from '../requests/CreateMovieRequest'
import { UpdateMovieRequest } from '../requests/UpdateMovieRequest'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
const bucketName = process.env.IMAGES_S3_BUCKET
const movieAccess = new MovieAccess()

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

export async function getAllMovieItem(userId: string): Promise<MovieItem[]> {
  return movieAccess.getAllMovieItem(userId)
}

export async function createMovie(
  CreateMovieRequest: CreateMovieRequest,
  jwtToken: string
): Promise<MovieItem> {

  const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)

  return await movieAccess.createMovieItem({
    userId: userId,
    todoId: itemId,
    createdAt: new Date().toISOString(),
    name: CreateMovieRequest.name,
    dueDate: CreateMovieRequest.dueDate,
    done: false
  })
}

export async function updateMovie(
  UpdateMovieRequest: UpdateMovieRequest,
  movieId: string,
  jwtToken: string
): Promise<MovieUpdate> {

  const userId = parseUserId(jwtToken)

  return await movieAccess.updateMovieItem(UpdateMovieRequest, userId, movieId)
}

export async function updateImageMovie(
  movieId: string,
  userId: string
){

  const imageId = uuid.v4()
  getUploadUrl(imageId)
  const imageUrl = await movieAccess.updateMovieImage(movieId, userId, imageId)

  return imageUrl
}

export async function deleteMovie(
  movieId: string,
  jwtToken: string
): Promise<string> {

  const userId = parseUserId(jwtToken)

  return await movieAccess.deleteMovieItem(userId, movieId)
}

function getUploadUrl(imageId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: 300
  })
}