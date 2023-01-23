const express = require("express")
const app = express()
const path = require("path")
const formidable = require('formidable');

const hbs = require('express-handlebars');
app.set('views', path.join(__dirname, 'views'));        // ustalamy katalog views
app.engine('hbs', hbs({ defaultLayout: 'main1.hbs' }));  // domyślny layout, potem można go zmienić
app.set('view engine', 'hbs');

var data = {
    images: [],
    count: 0
}

app.get("/", function (req, res) {
    res.redirect("/upload")
})

app.get("/upload", function (req, res) {
    res.render("upload.hbs")
})

app.get("/filemanager", function (req, res) {
    res.render("filemanager.hbs", data)
})

app.post('/handleUpload', function (req, res) {

    let form = formidable({});
    form.keepExtensions = true
    form.multiples = true

    form.uploadDir = __dirname + '/static/upload/'

    form.parse(req, function (err, fields, files) {

        //console.log("----- przesłane pola z formularza ------");

        //console.log(fields);

        //console.log("----- przesłane formularzem pliki ------");

        //console.log(files);

        if (!files.imagetoupload.length) {
            // SINGLE FILE

            let img = ""
            switch (files.imagetoupload.type) {
                case 'image/jpeg':
                    img = 'img/jpeg.png'
                    break;

                default:
                    img = 'img/png.png'
                    break;
            }

            let obj = {
                lp: data.count,
                type: files.imagetoupload.type,
                name: files.imagetoupload.name,
                size: files.imagetoupload.size,
                path: files.imagetoupload.path,
                lastModified: files.imagetoupload.lastModifiedDate,
                image: img
            }
            data.images.push(obj)
            data.count++
        } else {
            // MULTIPLE FILES
            for (let i = 0; i < files.imagetoupload.length; i++) {
                let img = ""
                switch (files.imagetoupload[i].type) {
                    case 'image/jpeg':
                        img = 'img/jpeg.png'
                        break;

                    default:
                        img = 'img/png.png'
                        break;
                }

                let obj = {
                    lp: data.count,
                    type: files.imagetoupload[i].type,
                    name: files.imagetoupload[i].name,
                    size: files.imagetoupload[i].size,
                    path: files.imagetoupload[i].path,
                    lastModified: files.imagetoupload[i].lastModifiedDate,
                    image: img
                }

                data.images.push(obj)
                data.count++
            }
        }

        console.log("DATA")
        console.log(data)

        res.redirect('/filemanager')
    })
})

app.get("/delete/:lp", function (req, res) {
    let lp = parseInt(req.params.lp)
    for (let i = 0; i < data.images.length; i++) {
        if (data.images[i].lp == lp) {
            data.images.splice(i, 1)
        }
    }
    res.redirect('/filemanager')
})

app.get("/show/:lp", function (req, res) {
    let lp = parseInt(req.params.lp)
    for (let i = 0; i < data.images.length; i++) {
        if (data.images[i].lp == lp) {
            let filename = data.images[i].path.replace(/^.*[\\\/]/, '')
            res.sendFile(path.join(__dirname, "static", "upload", filename))
        }
    }
})

app.get("/info/:lp", function (req, res) {
    let lp = parseInt(req.params.lp)
    for (let i = 0; i < data.images.length; i++) {
        if (data.images[i].lp == lp) {
            res.render("info.hbs", data.images[i])
        }
    }
})

app.get("/download/:lp", function (req, res) {
    let lp = parseInt(req.params.lp)
    for (let i = 0; i < data.images.length; i++) {
        if (data.images[i].lp == lp) {
            let filename = data.images[i].path.replace(/^.*[\\\/]/, '')
            res.download(path.join(__dirname, "static", "upload", filename))
        }
    }
})

app.get("/deleteAll", function (req, res) {
    data.count = 0
    data.images.splice(0, data.images.length)
    res.redirect('/filemanager')
})

app.use(express.static('static'))
app.listen(3000, function () {
    console.log("running on port 3000")
})