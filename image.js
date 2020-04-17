const gm = require('gm');

// Might require installation of imageMagick https://github.com/aheckmann/gm

function generateThumbnail(view) {
    return new Promise((resolve, reject) => {
        gm(__dirname + '/assets/template.jpg')
            .font(__dirname + '/assets/font.ttf', 130)
            .fill('#FFFFFF')
            .drawText(70, 305, `${view} view`)
            .write('output.jpg', function (err) {
                if (err) {
                    reject(err);
                }

                resolve(`Thumbnail generated for ${view} view!`)
            })
    })
}

module.exports = {
    generateThumbnail
}