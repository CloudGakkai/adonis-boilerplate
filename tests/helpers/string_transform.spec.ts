import StringTransform from 'App/Helpers/StringTransform'
import test from 'japa'

test.group('String Transform Test', () => {
  test('Convert random text to slug', async (assert) => {
    const text = 'This is a random text'
    const slug = 'this-is-a-random-text'

    assert.equal(StringTransform.toSlug(text), slug)
  })
})
