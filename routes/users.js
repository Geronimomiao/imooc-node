let express = require('express');
let router = express.Router();
let User = require('../models/user')
require('./../util/util')
/*
* 此处相当于子路由
*    app.js 中 设置的是一级路由
* */

// 登录接口
router.post('/login', (req, res, next) => {
    let param = {
        userName: req.body.userName,
        userPwd: req.body.userPwd
    }
    User.findOne(param, (err, doc) => {
        if (err) {
            res.json({
                status: 1,
                msg: '数据库查询问题'
            })
        } else {
            // 坑: 如果查不到 doc 为 null
            // doc 存在且不为空
            if (doc) {
                res.cookie('userName', doc.userName, {
                    path: '/', //存放至服务器的根目录
                    maxAge: 1000 * 60 * 60
                })
                res.cookie('userId', doc.userId, {
                    path: '/', //存放至服务器的根目录
                    maxAge: 1000 * 60 * 60
                })
                // req.session.user = doc
                res.json({
                    status: 0,
                    msg: '',
                    result: {
                        userName: doc.userName
                    }
                })
            }

        }
    })
})

// 注销接口
router.post("/logout", (req, res, next) => {
    // 已重写的方式清除 cookie
    // 也可以通过 clearCookie 的方式来清 cookie
    res.cookie('userName', '', {
        path: '/',
        maxAge: -1
    })
    res.cookie('userId', '', {
        path: '/',
        maxAge: -1
    })
    res.json({
        status: 0,
        msg: '',
        result: ''
    })
})

// 校验
router.get("/checkLogin", (req, res, next) => {
    if (req.cookies.userName) {
        res.json({
            status: 0,
            msg: '',
            result: req.cookies.userName
        })
    } else {
        res.json({
            status: 1,
            msg: '未登录',
            result: ''
        })
    }
})

// 加载购物车列表
router.get("/cartList", (req, res, next) => {
    let userId = req.cookies.userId
    User.findOne({userId: userId}, (err, doc) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message,
                result: ''
            })
        } else {
            if (doc) {

                res.json({
                    status: 0,
                    msg: '',
                    result: doc.cartList
                })
            }
        }
    })
})

// 购物车删除
router.post("/cartDel", (req, res, next) => {
    let userId = req.cookies.userId
    let productId = req.body.productId
    User.update({
        userId: userId
    }, {
        $pull: {
            'cartList': {
                'productId': productId
            }
        }
    }, (err, doc) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message,
                result: ''
            })
        } else {
            if (doc) {
                res.json({
                    status: 0,
                    msg: '',
                    result: 'suc'
                })
            }
        }
    })
})

// 修改商品数量
router.post("/cartEdit", (req, res, next) => {
    let userId = req.cookies.userId
    let productId = req.body.productId
    let productNum = req.body.productNum
    let checked = req.body.checked
    User.update({
        "userId": userId,
        "cartList.productId": productId
    }, {
        // 修改子文档
        "cartList.$.productNum": productNum,
        "cartList.$.checked": checked
    }, (err, doc) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message,
                result: ''
            })
        } else {
            if (doc) {
                res.json({
                    status: 0,
                    msg: '',
                    result: 'suc'
                })
            }
        }
    })

})

// 购物车修改 checkAll
router.post("/editCheckAll", (req, res, next) => {
    let userId = req.cookies.userId
    let checkAll = req.body.checkAll ? 1 : 0
    User.findOne({userId: userId}, (err, user) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message,
                result: ''
            })
        } else {
            if (user) {
                user.cartList.forEach((item) => {
                    item.checked = checkAll
                })
                user.save((err, doc) => {
                    if (err) {
                        res.json({
                            status: 1,
                            msg: err.message,
                            result: ''
                        })
                    } else {
                        if (doc) {
                            res.json({
                                status: 0,
                                msg: '',
                                result: 'suc'
                            })
                        }
                    }
                })
            }
        }
    })
})

// 查询用户地址接口
router.get("/addressList", (req, res, next) => {
    let userId = req.cookies.userId
    User.findOne({userId: userId}, (err, doc) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message,
                result: ''
            })
        } else {
            if (doc) {
                // console.log(doc.addressList)
                res.json({
                    status: 1,
                    msg: '',
                    result: doc.addressList
                })
            }
        }
    })
})

// 设置默认地址
router.post("/setDefault", (req, res, next) => {
    let userId = req.cookies.userId
    User.findOne({userId: userId}, (err, doc) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message,
                result: ''
            })
        } else {
            if (doc) {
                let addressId = req.body.addressId
                let addressList = doc.addressList
                addressList.forEach((item) => {
                    if (item.addressId == addressId) {
                        item.isDefault = true
                    } else {
                        item.isDefault = false
                    }
                })
                doc.save((err1, doc1) => {
                    if (err1) {
                        res.json({
                            status: 1,
                            msg: err.message,
                            result: ''
                        })
                    } else {
                        if (doc1) {
                            res.json({
                                status: 0,
                                msg: '',
                                result: 'suc'
                            })
                        }
                    }
                })
            }
        }
    })
})

// 删除地址接口
router.post("/delAddress", (req, res, next) => {
    let userId = req.cookies.userId
    let addressId = req.body.addressId
    User.update({userId: userId}, {
        $pull: {
            'addressList': {
                'addressId': addressId
            }
        }
    }, (err, doc) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message,
                result: ''
            })
        } else {
            res.json({
                status: 0,
                msg: '',
                result: doc
            })
        }
    })
})

// 生成订单功能接口
router.post("/payMent", (req, res, next) => {
    let userId = req.cookies.userId
    let orderTotal = req.body.orderTotal
    let addressId = req.body.addressId
    // console.log(orderTotal, addressId, userId)

    User.findOne({userId: userId}, (err, doc) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message,
                result: ''
            })
        } else {
            // 获取当前用户地址信息
            let address = '', goodsList = []
            doc.addressList.forEach((item) => {
                if (addressId == item.addressId) {
                    address = item
                }
            })

            // 获取用户购物车购买商品
            doc.cartList.filter((item) => {
                if (item.checked == 1) {
                    goodsList.push(item)
                }
            })

            // 生成 orderId
            let platform = '622' // 平台码
            let r1 = Math.floor(Math.random()*10)
            let r2 = Math.floor(Math.random()*10)

            let sysDate = new Date().Format('yyyyMMddhhmmss')
            let createDate = new Date().Format('yyyy-MM-dd hh:mm:ss')
            let orderId = platform + r1 + sysDate + r2

            console.log(createDate)
            let order = {
                orderId: orderId,
                orderTotal: orderTotal,
                addressInfo: address,
                goodsList: goodsList,
                orderStatus: 1,
                createDate: createDate
            }

            doc.orderList.push(order)

            doc.save((err1, doc1) => {
                if (err1) {
                    res.json({
                        status: 1,
                        msg: err1.message,
                        result: ''
                    })
                } else {
                    res.json({
                        status: 0,
                        msg: '',
                        result: {
                            orderId: doc1.orderList[doc1.orderList.length - 1].orderId,
                            orderTotal: doc1.orderList[doc1.orderList.length - 1].orderTotal
                        }
                    })
                }
            })
        }
    })
})

// 查询购物车商品数量的接口
router.get("/getCartCount", (req, res, next) => {
    if (req.cookies && req.cookies.userId) {
        let userId = req.cookies.userId
        User.findOne({userId: userId}, (err, doc) => {
            if (err) {
                res.json({
                    status: 1,
                    msg: err.message,
                    result: ''
                })
            } else {
                let cartList = doc.cartList
                let cartCount = 0
                cartList.map((item) => {
                    cartCount += parseInt(item.productNum)
                })
                res.json({
                    status: 0,
                    msg: '',
                    result: cartCount
                })
            }
        })
    }
})

module.exports = router;
