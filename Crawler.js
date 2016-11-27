var superagent = require('superagent');
var cheerio = require('cheerio');
var express = require('express');
var iconv = require('iconv-lite');
var fs = require('fs');
const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

var app = express();
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

var url = 'http://localhost/';
var cj_url = 'http://channel.chinanews.com/cns/s/channel:cj.shtml?pager=100&pagenum=12&_=1480234558625';

var test = function (type, num) {
    news.url = news.baseurl.replace(/{{type}}/, news.types[type])
        .replace(/{{num}}/, num)
        .replace(/{{pagenum}}/, 20)
        .replace(/{{datetime}}/, new Date().getTime());
};

function getPage(news_type, i, pagenum) {
    test(news_type, i);
    superagent.get(news.url).end(function (err, res) {
        if (err || !res.ok) {
            return;
        }
        try {
            eval(res.text);

            // eval(res.text);
            for (var j = 0; j < pagenum; j++) {
                if (specialcnsdata && specialcnsdata.docs[j] && specialcnsdata.docs[j].url) {
                    console.log(specialcnsdata.docs[j].url);
                } else {
                    continue;
                }
                var uurrll = specialcnsdata.docs[j].url;
                var filepath = '';
                if (dataset.current % 2) {
                    filepath = dataset.train_path + news.types[news_type] + '/' + parseInt(dataset.current / 2 + 1);
                } else {
                    filepath = dataset.test_path + news.types[news_type] + '/' + dataset.current / 2;
                }
                dataset.current++;
                var stream = fs.createWriteStream(filepath);
                var req = superagent.get(uurrll);
                req.pipe(iconv.decodeStream('gb2312')).pipe(iconv.encodeStream('utf8')).pipe(stream);
                console.log(filepath);

            }
        } catch (error) {
            console.log(error);
        }

    });
}

var Crawler = function (news_type, pager, pagenum) {
    var init = 410;
    var t = setInterval(function () {
        getPage(news_type, init, pagenum);
        init++;
        console.log('---------------------------------------------');
        console.log(init);
        if (init >= pager) {
            clearInterval(t);
        }
    }, 3000);
};

// 自动执行
(function () {
    dataset.current = 7800;

    //已执行：0
    //
    Crawler(1, 1050, 20);

    // getPage(0, 10, 20);

    // for (var i = 0; i < news.types.length; i++) {
    //     dataset.current = 1;
    //     Crawler(i, 1, 20);
    // }
})();

app.get('/', function (req, res, next) {

});
app.listen(3000, function () {
    console.log('object');
});