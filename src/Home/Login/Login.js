/**
 * Created by Jad_PC on 2018/2/6.
 */
import React from 'react';
import {connect} from 'react-redux';
import {routerActions} from 'react-router-redux';
import {Input, message} from 'antd';
import {sessionActions} from '../../actions/index';
import styles from './Login.scss';

const checkUsername = (username) => {
    if(!username){
        return '用户名不能为空';
    }
    return null;
};

const checkPassword = (password) => {
    if(!password){
        return '密码不能为空';
    }
    return null;
};

class Login extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            username: '',
            password: '',
            email: ''
        };
    }

    handleChange = (param) => {
        this.setState({
            ...this.state,
            ...param
        });
    }

    render(){
        const {handleLogin, isLoading, jumpToRegister} = this.props;
        const {username, password} = this.state;
        return (
            <div className={styles.container}>
                <section className={styles.loginBlock}>
                    <header className={styles.header}><p>登录</p></header>
                    <div className={styles.inputContainer}>
                        <div className={styles.inputTitle}><p>用户名</p></div>
                        <div className={styles.inputSection}>
                            <Input disabled={isLoading} type="text" value={username} onChange={(e) => {this.handleChange({username: e.target.value});}} placeholder="请输入用户名" />
                        </div>
                    </div>
                    <div className={styles.inputContainer}>
                        <div className={styles.inputTitle}><p>密码</p></div>
                        <div className={styles.inputSection}>
                            <Input disabled={isLoading} type="password" value={password} onChange={(e) => {this.handleChange({password: e.target.value});}} placeholder="请输入密码" />
                        </div>
                    </div>
                    <div className={styles.buttonContainer}>
                        <button disabled={isLoading} className={`${styles.button} ${styles.loginBtn}`} onClick={() => {handleLogin(username, password);}}>登录</button>
                        <button disabled={isLoading} className={`${styles.button} ${styles.registerBtn}`} onClick={jumpToRegister}>注册</button>
                    </div>
                </section>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {user, isLoading} = state.getSession;
    return {user, isLoading};
};

const mapDispatchToProps = dispatch => ({
    handleLogin: (username, password) => {
        const usnCheckRes = checkUsername(username);
        const pwdCheckRes = checkPassword(password);
        if(usnCheckRes){
            message.warn(usnCheckRes);
            return;
        }
        if(pwdCheckRes){
            message.warn(pwdCheckRes);
            return;
        }
        dispatch(sessionActions.login('request', {username, password}));
    },
    jumpToRegister: () => {
        dispatch(routerActions.push('/register'));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);