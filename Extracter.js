var mongoose = require('mongoose');
var fs = require('fs');
var cheerio = require('cheerio');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/News');

var dataset = {
    train_path: '/TextCategorization/train_data_set/',
    test_path: '/TextCategorization/test_data_set/',
    current: 1
};

var news = {
    encoding: 'gb2312',
    url: '',
    baseurl: 'http://channel.chinanews.com/cns/s/channel:{{type}}.shtml?pager={{num}}&pagenum={{pagenum}}&_={{datetime}}',
    types: ['cj', 'auto', 'yl', 'ty', 'cul', 'mil', 'it', 'gj', 'jk', 'edu'],
    typesname: ['财经', '汽车', '娱乐', '体育', '文化', '军事', 'IT', '国际', '健康', '教育'],
}

// 数据库设计
var NewsTraining = mongoose.model('Testing', {
    type: String,
    filepath: String,
    title: String,
    content: String,
    prediction: String,
    words: [String]
});

function getNewsInfo(type, path, callback) {
    // 异步读取
    fs.readFile(path, function (err, data) {
        if (err) {
            return console.error(err);
        }
        var $ = cheerio.load(data.toString());
        var content = $('.left_zw p').clone().children().remove().end().text().replace(/\r|\n|/g, '').trim();
        var title = $('h1').text().replace(/\r|\n|/g, '').trim();

        if (content.length < 20) {
            // console.log('xxxxxxxxxxxx');
            console.log('------------------');
        } else {
            var new_single = new NewsTraining({ title: title, filepath: path, content: content, type: type, words: [] });
            console.log(path);
            new_single.save(function (err) {
                if (err) {
                    console.log('-----------------王楠--------------------');
                } else {
                    // console.log('success');
                }
                
            });
        }
        if (callback) {
            callback(new_single);
        }
        // console.log(title);
        // console.log('------------------');
        // console.log(new_single);
    });
}

function getAllNews() {
    // news.types
    // 'cj', 'auto', 'yl', 'ty'
    // 'cul', 'mil', 'it'
    // 'gj', 'jk', 'edu'
    // , 'ty'
    ['ty'].forEach(function (type) {
        for (var i = 1; i < 11000; i++) {
            var p = dataset.test_path + type + '/' + i;
            getNewsInfo(type, p, function (data) {
                // console.log(data.filepath);
            });
        }
    }, this);
}
getAllNews();

// getNewsInfo('cj', path);



// new_single.save(function (err) {
//     if(err) {
//         console.log('-----------------王楠--------------------');
//     }
// });

