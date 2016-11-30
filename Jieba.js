var jieba = require('nodejieba');
var mongoose = require('mongoose');

// jieba
jieba.load({
    dict: jieba.DEFAULT_DICT,
    hmmDict: jieba.DEFAULT_HMM_DICT,
    userDict: '../segmentwords/dict.txt.big',
    idfDict: jieba.DEFAULT_IDF_DICT,
    stopWordDict: '../segmentwords/stop_words_ch.txt.utf8',
});

// mongodb
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/News');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('mongodb connected!');
});

// 数据库设计
var NewsTraining = mongoose.model('Training', {
    type: String,
    filepath: String,
    title: String,
    content: String,
    words: [{}],
    tags: [{}]
});

// NewsTraining.create({ "title" : "中国工业利润增长稳中有升 效益向好态势进一步稳固", "filepath" : "/TextCategorization/train_data_set/cj/10", "content" : "11月27日电 据国家统计局网站消息，国家统计局11月27日发布的工业企业财务数据显示，1-10月份，规模以上工业企业利润同比增长8.6%，增速比1-9月份加快0.2个百分点。其中，10月份利润同比增长9.8%，增速比9月份加快2.1个百分点。国家统计局工业司何平博士解读称，相关数据显示工业利润增长稳中有升，企业效益向好态势进一步稳固，供给侧结构性改革成效继续显现。　　何平指出，数据显示，10月份利润增长有所加快，企业效益向好态势进一步稳固，具体表现在以下方面：　　工业品价格继续回升。10月份，工业生产者出厂价格同比上涨1.2%，涨幅比9月份上升1.1个百分点。显示国内工业品市场需求进一步回暖。　　利润率同比继续上升。10月份，规模以上工业企业主营业务收入利润率为6.06%，同比上升0.24个百分点。　　财务费用同比继续下降。10月份，企业财务费用同比下降4.5%，延续年初以来的下降趋势。　　采矿业利润增速又创新高。10月份，采矿业利润同比增长86.6%，增幅比9月份加快56.3个百分点。　　何平表示，相关数据表明，供给侧结构性改革成效继续显现。　　库存持续下降。10月末，规模以上工业企业产成品存货同比下降0.3%，延续了年初以来的下降趋势。　　杠杆率持续下降。10月末，工业企业资产负债率为56.1%，同比下降0.7个百分点，环比下降0.2个百分点。　　单位成本继续降低。10月份，工业企业每百元主营业务收入中的成本为85.73元，同比下降0.13元。　　何平进一步指出，销售加快，价格上涨，致工业企业利润增速回升。　　10月份工业企业利润增速比9月份回升，主要受以下原因影响：　　销售增长加快。10月份，规模以上工业企业主营业务收入同比增长5.4%，增速比9月份加快1.5个百分点。　　价格上涨。初步测算，10月份，因工业生产者出厂价格同比上涨1.2%，企业主营业务收入增加约1205亿元，因工业生产者购进价格上涨0.9%，企业原材料成本增加约597亿元，两者相抵，利润增加约608亿元，比9月份多增约105亿元。　　化工、煤炭和通用设备等行业拉动明显。10月份，化学原料和化学制品制造业同比新增利润81.4亿元，比9月份多增55.2亿元；煤炭开采和洗选业同比新增利润165.6亿元，比9月份多增56.1亿元；通用设备制造业同比新增利润19.4亿元，而9月份则同比减少28.6亿元。以上三个行业合计拉升规模以上工业企业利润增速2.7个百分点。　　10月份工业利润增速虽然稳中有升，但利润增长结构不尽合理，传统原材料制造业利润增长较快，对整个工业利润增长作用较大，而高技术制造业和装备制造业利润增速却有所放缓。此外，利润增长动力也过多依赖于价格的上涨。工业企业尚需多练内功，以提质促增效。", "type" : "cj", "words" : [ ]});


// 用Jieba分词
function splitWords(text) {
    var words = [];
    var tags = [];
    jieba.tag(text).forEach(function (elem) {
        // 只取 名词、名形词、名动词、nr、ns、nz、nt、简称、习用语、
        if (elem.tag != 'eng' && elem.tag.match(/n|l|j/)) {
            // console.log(elem);
            tags.push(elem.word);
        }
    }, this);
    // console.log(tags);
    // TF-IDF
    var weigh = jieba.extract(text, 50);
    for (var index in weigh) {
        if (weigh.hasOwnProperty(index)) {
            var w = weigh[index].word;
            var flag = false;
            for (var i = 0; i < tags.length; i++) {
                if (w == tags[i]) {
                    flag = true;
                    words.push(weigh[index]);
                    break;
                }
            }
            // if (flag) {
            //     words.push(w);
            // }
        }
    }
    return words;
    // return tags;
}

var current = 0;
// var total = 10000;
// NewsTraining.count({}, function (err, count) {
//     totle = count;
//     console.log('\\\\\\\\\\\\'+total);
// });

function update(num) {
    // 105112
    if (num > 110000) {
        console.log('########终于跑完啦～～/(ㄒoㄒ)/~~#########');
        return
    }
    // 自动执行
    NewsTraining.find()
        .limit(1)
        .skip(num)
        .exec(function (err, res) {
            if (err) {
                return err;
            }
            if (res[0]) {
                var words = splitWords(res[0].content);
                // console.log(words);
                NewsTraining.update({ _id: res[0]._id }, { tags: words }, function (err, raw) {
                    console.log('----------' + num + '----------' + res[0]._id + '-----------');
                    console.log(raw);
                    update(++num);
                });
            }
        });
};

update(current);

// var new_single = new NewsTraining({ title: title, filepath: path, content: content, type: type, words: [] });