import Drive from '@ioc:Adonis/Core/Drive'
import UploadService from 'App/Services/UploadService'
import test from 'japa'
import Application from '@ioc:Adonis/Core/Application'

test.group('Upload Service Test', () => {
  test('Test upload file service', async (assert) => {
    const instance = new UploadService()
    Drive.fake()
    await instance.upload('foo.txt', 'foo')
    const file = await instance.get('foo.txt')
    assert.equal(file.toString(), 'foo')
  })

  test('Test upload image file', async (assert) => {
    const filePath = Application.resourcesPath('tests/image-1.jpg')
    Drive.fake()
    const instance = UploadService.rawFile(filePath, 'jpg', 'foo')
    const result = await instance.storeImage({
      directory: 'coba',
    })
    assert.equal(result.image, 'coba/foo.jpg')
  })

  test('Test upload image file with thumbnail', async (assert) => {
    const filePath = Application.resourcesPath('tests/image-1.jpg')
    Drive.fake()
    const instance = UploadService.rawFile(filePath, 'jpg', 'foo')
    const result = await instance.storeImage({
      directory: 'coba',
      thumbnail: true,
      thumbnailSize: {
        width: 200,
      },
    })
    assert.equal(result.image, 'coba/foo.jpg')
    assert.equal(result.thumb, 'thumbs/coba/foo.jpg')
  })
})
