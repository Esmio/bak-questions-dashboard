import React from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { host } from '../config';
import { Form, Icon, Input, Button, Checkbox, message } from 'antd';

function  NormalLoginForm(props) {
    const handleSubmit = (e) => {
      e.preventDefault();
      props.form.validateFields((err, values) => {
        if (!err) {
            axios({
                method: 'post',
                url: `${host}/login`,
                data: values,
            }).then(r => {
                const { code, data } = r.data;
                if(code === 0) {
                    const { token, user } = data;
                    const HALFDAY = 1/2;
                    Cookies.set('user', user, {
                        expires: HALFDAY,
                    });
                    Cookies.set('token', token, {
                        expires: HALFDAY,
                    });
                    window.location.href = '/d/question'
                }
            }).catch(e => {
                console.log('e', e);
                if(!e.response) message.error(e.message);
                else {
                    const { data } = e.response;
                    message.error(data.msg);
                }
            })
        }
      });
    }
  
    const { getFieldDecorator } = props.form;

    return (
        <div
            style={{
                width: '320px',
                padding: '10px 40px',
                border: '1px solid #1890ff',
                borderRadius: '10px',
                boxShadow: '5px 5px 10px #1890ff',
            }}
        >   
            <div
                style={{
                    height: '90px',
                    lineHeight: '90px',
                    fontSize: '18px',
                    fontWeight: 'bolder',
                }}
            >
                用户登陆
            </div>
            <Form onSubmit={handleSubmit} className="login-form">
                <Form.Item>
                    {getFieldDecorator('phoneNumber', {
                        rules: [{ required: true, message: '请输入手机号码！' }],
                    })(
                        <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="手机号" />
                    )}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('password', {
                        rules: [{ required: true, message: '请输入密码！' }],
                    })(
                        <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="密码" />
                    )}
                </Form.Item>
                <Form.Item>
                    <div>
                        {getFieldDecorator('remember', {
                            valuePropName: 'checked',
                            initialValue: true,
                        })(
                            <Checkbox>记住我</Checkbox>
                        )}
                        <a className="login-form-forgot" href="">忘记密码</a>
                    </div>
                    <Button style={{width: '100%'}} type="primary" htmlType="submit" className="login-form-button">
                        登陆
                    </Button>
                    &nbsp;或 <a href="">立即注册</a>
                </Form.Item>
            </Form>
        </div>
    );
  }
  
  const WrappedNormalLoginForm = Form.create({ name: 'normal_login' })(NormalLoginForm);

  export default WrappedNormalLoginForm;