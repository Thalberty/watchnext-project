import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { MovieItem } from '../models/MovieItem'
import { MovieUpdate } from '../models/MovieUpdate'
import * as AWSXRay from 'aws-xray-sdk'
const XAWS = AWSXRay.captureAWS(AWS)

export class MovieAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly moviesTable = process.env.MOVIES_TABLE,
    private readonly bucketName = process.env.IMAGES_S3_BUCKET) {
  }

  async getAllMovieItem(userId: string): Promise<MovieItem[]> {
    console.log('Getting all movie')

    const result = await this.docClient.query({
      TableName: this.moviesTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    const items = result.Items
    return items as MovieItem[]
  }

  async createMovieItem(movie: MovieItem): Promise<MovieItem> {
    await this.docClient.put({
      TableName: this.moviesTable,
      Item: movie
    }).promise()

    return movie
  }

  async updateMovieItem(movie: MovieUpdate, userId: string, movieId: string): Promise<MovieUpdate> {
    await this.docClient.update({
      TableName: this.moviesTable,
      Key: {
        userId: userId,
        todoId: movieId
      },
      ExpressionAttributeNames: { "#N": "name" },
      UpdateExpression: "set #N=:movieName, dueDate=:dueDate, done=:done",
      ExpressionAttributeValues: {
        ":movieName": movie.name,
        ":dueDate": movie.dueDate,
        ":done": movie.done
      },
      ReturnValues: "UPDATED_NEW"
    }).promise();

    return movie
  }

  async updateMovieImage(userId: string, movieId: string, imageId: string) {

    const url = `https://${this.bucketName}.s3.amazonaws.com/${imageId}`;

    console.log('userId', userId)
    console.log('movieId', movieId)
    console.log('imageUrl', url)

    const result1 = await this.docClient.update({
      TableName: this.moviesTable,
      Key: {
        userId: userId,
        todoId: movieId
      },
      ExpressionAttributeNames: { "#atta": "attachmentUrl" },
      UpdateExpression: "set #atta=:attachmentUrl",
      ExpressionAttributeValues: {
        ":attachmentUrl": url
      },
      ReturnValues: "UPDATED_NEW"
    }).promise();

    const result2 = await this.docClient.update({
      TableName: this.moviesTable,
      Key: {
        userId: movieId,
        todoId: userId
      },
      ExpressionAttributeNames: { "#atta": "attachmentUrl" },
      UpdateExpression: "set #atta=:attachmentUrl",
      ExpressionAttributeValues: {
        ":attachmentUrl": url
      },
      ReturnValues: "UPDATED_NEW"
    }).promise();

    console.log('attachmentUrl Updated')
    console.log({ result1: result1 });
    console.log({ result2: result2 });

    return url
  }

  async deleteMovieItem(userId: string, movieId: string): Promise<string> {
    await this.docClient.delete({
      TableName: this.moviesTable,
      Key: {
        userId: userId,
        todoId: movieId
      }
    }).promise()

    return movieId
  }

}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8008'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}