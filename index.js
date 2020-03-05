const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const sharp = require('sharp');
const express = require('express');
const path = require('path');

const app = express();

app.use(express.urlencoded({ extended: true }));

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/', function(req, res){
    let stringUrls = req.body.urls;
    let urls = stringUrls.split('\n');

    urls.forEach(url => {
        request(url, (error, response, html) => {
            if(!error && response.statusCode == 200){
                const $ = cheerio.load(html);
                const name = $('h1[itemprop="name"]').text();
                const imageLink = $('.mw-100').attr('data-src');
        
                let download = request(imageLink).pipe(fs.createWriteStream('slike/' + name + '.jpg'));
        
                download.on('finish', function(){
                    sharp('slike/' + name + '.jpg')
                        .resize({ height: 460 })
                        .toBuffer()
                        .then(data => {
                            fs.writeFileSync('slike/' + name + '.jpg', data);
                        })
                        .catch(err => {
                            console.log(err);
                        });
                    
                    // sharp(name + '.jpg')
                    //     .metadata()
                    //     .then(function(metadata){
                    //         return sharp(name + '.jpg')
                    //                     .extend({
                    //                         top: 0,
                    //                         bottom: 0,
                    //                         left: Math.round((460 - metadata.width) / 2),
                    //                         right: Math.round((460 - metadata.width) / 2),
                    //                         background: { r: 0, g: 0, b: 0, alpha: 0 }
                    //                     })
                    //                     .toBuffer();
                    //     })
                    //     .then(function(data){
                    //         fs.writeFileSync(name + '.jpg', data);
                    //     }).catch(err => {
                    //         console.log(err);
                    //     });
                });
            }
        });
    })

    res.sendFile(path.join(__dirname, 'index.html'));
})

app.listen(3000);