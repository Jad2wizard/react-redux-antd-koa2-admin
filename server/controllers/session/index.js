/**
 * Created by Jad_PC on 2018/1/31.
 */
const session = require('koa-session');
const moment = require('moment');
const userModel = require('./../../models/user');
const {MAX_AGE, sessionConfig, ignorePath, ignoreFuzzyPath} = require('./config');

/**
 * 判断当前请求是否需要进行登录验证
 * @param {*} ctx
 * @return {boolean}
 */
const isNeedLogin = (ctx) => {
    if(ignorePath.includes(ctx.path)){
        return false;
    }
    return !ignoreFuzzyPath.some(p => {
        if(ctx.path.includes(p)){
            return true;
        }
        return false;
    })
};

const setSession = (app) => {
    app.keys = ['a secret key'];
    app.use(session(sessionConfig, app));
    app.use(async (ctx, next) => {
        if(isNeedLogin(ctx)){
            const sessionId = ctx.session.sessionId;
            if(sessionId){
                const user = await userModel.fetch(sessionId.split('_')[0]);
                if(user){
                    if(Number(sessionId.split('_')[1]) < moment().valueOf()){
                        ctx.session = null;
                        ctx.response.redirect(`/login?nextUrl=${encodeURIComponent(ctx.path)}`);
                    }
                } else {
                    ctx.response.redirect(`/login?nextUrl=${encodeURIComponent(ctx.path)}`);
                }
            } else {
                ctx.response.redirect(`/login?nextUrl=${encodeURIComponent(ctx.path)}`);
            }
        }
        await next();
    });
};

const login = async (ctx) => {
    try {
        const username = ctx.request.body.username;
        const password = ctx.request.body.password;
        if (!username || !password) {
            ctx.body = {
                success: '0',
                value: '用户名或密码缺失'
            };
            return;
        }
        const user = await userModel.fetch(username);
        if (!user) {
            ctx.body = {
                success: '0',
                value: '该用户不存在'
            };
            return;
        }
        if (user.password != password) {
            ctx.body = {
                success: '0',
                value: '密码错误'
            };
            return;
        }
        const sessionId = user.name + '_' + moment().add(MAX_AGE, 'second').valueOf();
        userModel.update({name: user.name, lastLogTime: moment().valueOf()});
        ctx.session.sessionId = sessionId;
        ctx.body = {
            success: '1',
            value: {
                username: user.name,
                email: user.email
            }
        };
    }catch(err){
        ctx.body = {
            success: '0',
            value: err.message
        };
    }
};

const logout = async (ctx) => {
    try{
        ctx.session.sessionId = null;
        ctx.body = {
            success: '1'
        }
    }catch(err){
        ctx.body = {
            success: '0',
            value: err.message
        };
    }
};

const getUser = async (ctx) => {
    const sessionId = ctx.session.sessionId;
    if(sessionId){
        const user = await userModel.fetch(sessionId.split('_')[0]);
        return (user) ? {user: user.name, email: user.email} : null;
    }
    return null;
};

module.exports = {
    setSession,
    getUser,
    login,
    logout
};