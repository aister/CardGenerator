//https://www.gfwiki.com/api.php?action=parse&page=T-Doll%20Index&format=json

const fetch = require('request');
const { createCanvas, loadImage } = require('canvas');
const canvas = createCanvas(128, 228);
const ctx = canvas.getContext('2d');
ctx.fillStyle = "white";
const fs = require('fs');

fetch('https://en.gfwiki.com/api.php?action=parse&page=T-Doll%20Index&format=json', function(req, res, body) {
  body = JSON.parse(body).parse.text["*"]
  let list = {};
  let data = body.split('<div class="card-bg-small" style="display:inline-block">').slice(1);
  data[data.length - 1] = data[data.length - 1].split('\n').slice(0, 2).join('\n');
  (function download(index) {
    if (index < data.length) {
      let i = data[index];
      let name = i.match(/EN" data-server-releasename="[^"]+/g);
      if (name) {
        let images = i.match(/src="[^"]+/g).slice(1);
        name = images[1].split('_').slice(-2).join('_').slice(0, -8);
        if (fs.existsSync(`${__dirname}/img/${name}.png`)) download(index + 1);
        else {
          images = images.map(link => {
            link = `https:${link.slice(15)}`;
            return loadImage(link);
          });
          Promise.all(images).then(loaded => {
            ctx.drawImage(loaded[2], 0, 0);
            ctx.drawImage(loaded[0], 0, 178);
            ctx.drawImage(loaded[1], 1, 1);
            let out = fs.createWriteStream(`${__dirname}/img/${name}.png`);
            let stream = canvas.createPNGStream();
            stream.pipe(out);
            out.once('finish', () => {
              console.log(`${name} done`);
              download(index + 1);
            })
          });
        } 
      } else download(index + 1);
    } else {
      console.log('done');
    }
  })(0);
});