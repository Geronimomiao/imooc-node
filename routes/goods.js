let express = require('express')
let router = express.Router()
let mongoose = require('mongoose')

let Goods = require('../models/goods')
let User = require('../models/user')

// 连接数据库
mongoose.connect('mongodb://127.0.0.1:27017/test')

// 监听数据库的连接状态
mongoose.connection.on('connected', function () {
    console.log('MongoDB connected success')
})
mongoose.connection.on('error', function () {
    console.log('MongoDB connected fail')
})
mongoose.connection.on('disconnected', function () {
    console.log('MongoDB connected disconnected')
})

// 查询商品列表
router.get('/list', function (req, res, next) {
    /*
    * 实现 分页功能
    *   params 前端传过来的条件
    *   sort 根据条件 排序 1 升序 -1 降序
    * */
    let page = parseInt(req.param('page'))
    let pageSize = parseInt(req.param('pageSize'))
    let priceLevel = req.param('priceLevel')
    let sort = req.param('sort')
    // 默认跳过数据条数
    let skip = (page-1)*pageSize
    let priceGt = '', priceLte = '';
    let params = {}

    if (priceLevel != 'all') {
        switch (priceLevel) {
            case '0': priceGt = 0; priceLte = 500; break
            case '1': priceGt = 500; priceLte = 1000; break
            case '2': priceGt = 1000; priceLte = 2000; break
            case '3': priceGt = 2000; priceLte = 4000; break
        }
        params = {
            salePrice: {
                $gt: priceGt,
                $lte: priceLte
            }
        }
    }


    // 注意 req.param() 方法 默认拿到的是字符串 .limit() .skip() 方法需要传数字
    let goodsModel = Goods.find(params).skip(skip).limit(pageSize)
    goodsModel.sort({'salePrice':sort})
    goodsModel.exec(function (err, doc) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            res.json({
                status: '0',
                msg: '',
                result: {
                    count: doc.length,
                    list: doc
                }
            })
        }
    })
})

// 加入到购物车
router.post('/addCart', (req, res, next) => {
    let userId = '100000077'
    let productId = req.body.productId
    User.findOne({userId: userId}, (err1, useDoc) => {
        if (err1) {
            res.json({
                status: '1',
                msg: err1.message
            })
        } else {
            // console.log(useDoc)
            if (useDoc) {
                let goodsItem = ''
                useDoc.cartList.forEach( item => {
                    if (item.productId == productId) {
                        goodsItem = item
                        item.productNum ++
                    }
                })
                if (goodsItem) {
                    useDoc.save((err3, doc2) => {
                        if (err3) {
                            res.json({
                                status: '1',
                                msg: err3.message
                            })
                        } else {
                            res.json({
                                status: '0',
                                msg: 'suc',
                            })
                        }
                    })
                } else {
                    // 不能把用户传来的 productId 直接存 应该去数据库里查 万一是用户篡改的呢
                    Goods.findOne({productId: productId}, (err2, doc) => {
                        if (err2) {
                            res.json({
                                status: '1',
                                msg: err2.message
                            })
                        } else {
                            if (doc) {
                                // 神坑: 如果添加属性 Schema 里没有 则需通过 doc._doc 方式添加
                                //       否则无法添加
                                doc._doc.productNum = 1
                                doc.checked = 1

                                useDoc.cartList.push(doc)

                                useDoc.save((err3, doc2) => {
                                    if (err3) {
                                        res.json({
                                            status: '1',
                                            msg: err3.message
                                        })
                                    } else {
                                        res.json({
                                            status: '0',
                                            msg: 'suc',
                                        })
                                    }
                                })
                            }
                        }
                    })
                }
            } 
        }
    })
})

module.exports = router
