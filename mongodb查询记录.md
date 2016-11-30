db.trainings.find({type: 'cj',$where: 'this.content.length < 300'}).count()
db.trainings.find({$where: 'this.content.length < 300'}).count()
db.trainings.aggregate({$group:{_id:'$type',num:{$sum:1}}})
db.trainings.remove({$where:'this.content'})
db.trainings.remove({content: {$exists:false}})

db.trainings.aggregate([{$match:{content:/文化/,}},{$group:{_id:'$type',count:{$sum:1}}}])
db.trainings.aggregate([{$match:{content:/文化/,type:'cul'}},{$group:{_id:'$type',count:{$sum:1}}}])
db.trainings.aggregate([{$match:{content:/文化/,type:{$ne:'cul'}}},{$group:{_id:null,count:{$sum:1}}}])
db.trainings.aggregate([{$match:{content:/文化/,type:{$eq:'cul'}}},{$group:{_id:null,count:{$sum:1}}}])

> db.trainings.count({content:/文化/,type:'cul'})
5158
> db.trainings.count({content:/文化/,type:{$ne:'cul'}})
7491

db.words.find({type:'cj',CHI:{$exists:true,$ne:0}}).count()