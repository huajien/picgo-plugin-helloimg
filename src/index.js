

module.exports = (ctx) => {
  const register = () => {
      ctx.helper.uploader.register('Helloimg-uploader', {
      handle,
      config: config,
      name: 'Helloimg'
    })
  }
  return {
    uploader: 'Helloimg-uploader',
    register
  }
}


const handle = async (ctx) => {
  let userConfig = ctx.getConfig('picBed.Helloimg-uploader')
  if (!userConfig) {
    throw new Error('Can\'t find uploader config')
  }
  const email = userConfig.email
  const passwd = userConfig.passwd

  const imgList = ctx.output
  for (let i in imgList) {
    let image = imgList[i].buffer
    let base64Image = image.toString('base64')
    const postConfig = postOptions(email, passwd, base64Image)
    let body = await ctx.request(postConfig)
    body = JSON.parse(body)
    if (body.status_code === 200) {
      delete imgList[i].base64Image
      delete imgList[i].buffer
      imgList[i].imgUrl = body.image.url
    } else {
      ctx.emit('notification', {
        title: '上传失败',
        body: body.message
      })
      throw new Error(body.message)
    }
  }
  return ctx
}


const postOptions = (email, passwd, image) => {
  return {
    method: 'POST',
    url: `http://www.helloimg.com/newapi/2/upload/?login-subject`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
    },
    formData: {
      'login-subject': email,
      'password': passwd,
      'source': image,
      'format': 'json'
    }
  }
}

const config = ctx => {
  let userConfig = ctx.getConfig('picBed.Helloimg-uploader')
  if (!userConfig) {
    userConfig = {}
  }
  return [{
    name: 'email',
    type: 'input',
    default: userConfig.email,
    required: true,
    message: 'user-email',
    alias: '邮箱'
  }, {
    name: 'passwd',
    type: 'password',
    default: userConfig.passwd,
    required: true,
    message: 'user-password',
    alias: '密码'
  }]
}


