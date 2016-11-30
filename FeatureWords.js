var mongoose = require('mongoose');

// mongodb
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/News');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('mongodb connected!');
});

// 数据库设计
var NewsWord = mongoose.model('Word', {
    word: String,
    type: String,
    cnt: {
        A: Number,
        B: Number,
        C: Number,
        D: Number
    },
    CHI: Number
});

var NewsType = mongoose.model('Type', {
    type: String,
    wordset: [String],
    wordCHI: [String]
});

var NewsTraining = mongoose.model('Training', {
    type: String,
    filepath: String,
    title: String,
    content: String,
    words: [String]
});

var t = ['cj', 'auto', 'yl', 'ty', 'cul', 'mil', 'it', 'gj', 'jk', 'edu'];
var wordsset = {
    'cj': new Set(),
    'ty': new Set(),
    'auto': new Set(),
    'yl': new Set(),
    'cul': new Set(),
    'mil': new Set(),
    'it': new Set(),
    'gj': new Set(),
    'jk': new Set(),
    'edu': new Set()
};

// Type.find({ type: 'cj' })

//去掉重复词
function getWords(type, num) {
    if (type > 9) {
        console.log('～～～～终于又跑完啦--O(∩_∩)O～～～～');
        return;
    }
    NewsTraining.find({ type: t[type] })
        // .limit(100)
        // .skip(num)
        .exec(function (err, res) {
            if (err) {
                return err;
            }
            res.forEach(function (w) {
                w.tags.forEach(function (elem) {
                    wordsset[t[type]].add(elem.word);
                });
            }, this);
            // console.log(wordsset[type]);
            console.log('-------------我只是华丽丽的分割线--------------');
            console.log(t[type] + '===>' + wordsset[t[type]].size);
            var new_single = new NewsType({ type: t[type], wordset: Array.from(wordsset[t[type]]), wordCHI: [] });

            new_single.save(function (err) {
                if (err) {
                    console.log('-----------------楠哥保佑--------------------');
                } else {
                    console.log('success');
                }

            });
            getWords(++type);
        });
}

//开方检验
//
//总数：N = 105112
//每个词的
//  A: 正文档出现频率（A）
//  B: 负文档出现频率（B）
//  C: 正文档不出现频率（C）
//  D: 负文档不出现频率（D）
//
//公式开方值：X2 = N(AD-BC)**/(A+C)(A+B)(B+D)(B+C)
//
function initWords(type) {
    if (type > 9) {
        console.log('～～～～终于又跑完啦--O(∩_∩)O～～～～');
        return;
    }
    NewsType.findOne({ type: t[type] })
        .exec(function (err, res) {
            if (err) {
                return err;
            }

            res.wordset.forEach(function (element) {
                //插入并初始化words表
                var nw = new NewsWord({
                    word: element,
                    type: t[type],
                    cnt: {
                        A: 0,
                        B: 0,
                        C: 0,
                        D: 0
                    },
                    CHI: 0
                });
                nw.save(function (err) {
                    if (err) {
                        console.log('-----------------楠哥保佑--------------------');
                    } else {
                        // console.log('success');
                    }
                });
            }, this);
            console.log('-------------我只是华丽丽的分割线--------------');
            console.log(t[type] + '===>' + res.wordset.length);
            initWords(++type);
        });
}
//设定几个全局变量，节省计算时间
var N, A_C = {}, B_D = {};
function getWordsCHI(type) {
    if (type > 9) {
        console.log('～～～～终于又跑完啦--O(∩_∩)O～～～～');
        return;
    }
    NewsType.find({ type: t[type] })
        .exec(function (err, res) {
            if (err) {
                return err;
            }
            console.log('----------' + t[type] + '-----------');

            //文档总数
            if (!N) {
                NewsTraining.count().exec(function (err, res) {
                    N = res;
                    console.log(t[type] + '文档总数' + res);
                })
            }
            //正文档总数
            if (!A_C[t[type]]) {
                NewsTraining.count({ type: t[type] }).exec(function (err, res) {
                    A_C[t[type]] = res;
                    console.log(t[type] + '正文档总数' + res);
                })
            }
            //负文档总数
            if (!B_D[t[type]]) {
                NewsTraining.count({ type: { $ne: t[type] } }).exec(function (err, res) {
                    B_D[t[type]] = res;
                    console.log(t[type] + '负文档总数' + res);
                })
            }
            //对每个词，都计算卡方检验值
            var wd = res[0].wordset;
            // var i = 0;
            // for (var i = 0; i < wd.length; i++) {
            //     var element = wd[i];

            // }
            wd.forEach(function (word) {
                var A, B, C, D, XX;
                console.log('###' + word + '###');
                // A: 正文档出现频率（A）
                NewsTraining.count({ type: t[type], content: new RegExp(word) }, function (err, res) {
                    A = res;
                    console.log('A:' + A);
                });
                //  B: 负文档出现频率（B）
                NewsTraining.count({ type: { $ne: t[type] }, content: new RegExp(word) }, function (err, res) {
                    B = res;
                    console.log('B:' + B);
                    if (A && A_C[t[type]]) {
                        C = A_C[t[type]] - A;
                    }
                    if (B && B_D[t[type]]) {
                        D = B_D[t[type]] - B;
                    }
                    if (A && B && C && D) {
                        XX = N * (A * D - B * C) * (A * D - B * C) / ((A + C) * (A + B) * (B + D) * (B + C));
                        console.log('xx:' + XX);
                    }
                    console.log({ type: t[type], word: word, cnt: { A: A, B: B, C: C, D: D }, CHI: XX });
                    //插入并初始化words表
                    NewsWord.update({ type: t[type], word: word }, { cnt: { A: A, B: B, C: C, D: D }, CHI: XX }, function (err, raw) {
                        console.log(raw);
                    });

                });
            }, this);
            // getWordsCHI(++type);

            // new_single.update({ type: t[type] }, function (err) {
            //     if (err) {
            //         console.log('-----------------楠哥保佑--------------------');
            //     } else {
            //         console.log('success');
            //     }
            // });
        });
}

// getWords(0, 0);
getWordsCHI(0);
// initWords(0);
