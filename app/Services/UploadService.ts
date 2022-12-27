import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser'
import sharp from 'sharp'
import Drive from '@ioc:Adonis/Core/Drive'
import { faker } from '@faker-js/faker'
import Application from '@ioc:Adonis/Core/Application'

export interface ImageUploadOptions {
  directory?: string
  thumbnail?: boolean
  thumbnailSize?: { width: number; height?: number }
}

/**
 * To see example for this class, check out the `upload_service.spec.ts` on test service directory.
 *
 */
export default class UploadService {
  private filePath: string
  private fileExt: string
  private filename: string

  /**
   * Constructor to initialize file
   *
   * @param file MultiPartFileContract
   * @returns UploadService
   */
  public static fileRequest(file: MultipartFileContract) {
    const instance = new UploadService()
    if (file.tmpPath !== undefined) {
      instance.filePath = file.tmpPath
      if (file.extname !== undefined) instance.fileExt = file.extname
    } else {
      throw 'File is not available'
    }
    instance.filename = `${faker.datatype.uuid()}.${instance.fileExt}`
    return instance
  }

  /**
   * Constructor to initialize UploadService with raw parameter
   *
   * @param filePath string
   * @param fileExt string
   * @param fileName string
   * @returns UploadService
   */
  public static rawFile(filePath: string, fileExt: string, fileName: string): UploadService {
    const instance = new UploadService()
    instance.filePath = filePath
    instance.fileExt = fileExt
    instance.filename = `${fileName}.${fileExt}`
    return instance
  }

  /**
   * Void method to upload the file to the disk or online service storage
   * Before using this method, please make sure to set DRIVE_DISK environment variable on .env
   *
   * @param filePath string
   * @param content Buffer
   */
  public async upload(filePath: string, content: Buffer | string): Promise<string> {
    await Drive.use(Application.env.get('DRIVE_DISK', 'local')).put(filePath, content)
    return filePath
  }

  /**
   * Void method to get the file to the disk or online service storage
   *
   * @param filePath string
   */
  public async get(filePath: string): Promise<Buffer> {
    const file = await Drive.use(Application.env.get('DRIVE_DISK', 'local')).get(filePath)
    return file
  }

  /**
   * Uploads the file to the disk or online service storage
   * This method has simillar functionality to upload method, but it specialize to handle image file.
   *
   * @param options ImageUploadOptions
   * @returns
   */
  public async storeImage(options?: ImageUploadOptions) {
    let thumbnailPath: string | null = null

    if (options?.thumbnail) {
      if (!options?.thumbnailSize) {
        throw 'Thumbnail size is required, please provide width measurements or complete measurements'
      }
      const thumbnailSize = {
        width: options.thumbnailSize.width,
        height: options.thumbnailSize.height ?? options.thumbnailSize.width,
      }
      const thumb: Buffer = await sharp(this.filePath)
        .resize(thumbnailSize.width, thumbnailSize.height)
        .toBuffer()
      thumbnailPath = await this.upload(
        options.directory
          ? `thumbs/${options?.directory}/${this.filename}`
          : `thumbs/${this.filename}`,
        thumb
      )
    }

    const image: Buffer = await sharp(this.filePath).toBuffer()
    const imagePath = await this.upload(
      options?.directory ? `${options.directory}/${this.filename}` : `${this.filename}`,
      image
    )

    return {
      image: imagePath.toString(),
      thumb: thumbnailPath !== null ? thumbnailPath : null,
    }
  }
}
