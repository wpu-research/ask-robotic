import { createDb } from './index'
import { seedContent } from './seed-content'

seedContent(createDb())
  .then(() => {
    console.log('İçerik yazıldı')
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
