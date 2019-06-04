import React from 'react';
import { Form, Input, Button, message, Select } from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';
import { host } from '../../config';

const Option = Select.Option;

const token = Cookies.get('token');

function CreateIssueForm({form, setTime, setCreateIssueModal}) {
    const handleSubmit = (e) => {
        e.preventDefault();
        form.validateFields((err, values) => {
            if(!err) {
                const {title, issue, issueType} = values;
                const create = Date.now();
                axios({
                    method: 'post',
                    url: `${host}/api/question/issue`,
                    headers: {
                        'Authorization': `Berear ${token}`
                    },
                    data: {
                        title,
                        issue,
                        issueType,
                        create,
                    }
                }).then(r => {
                    const { code, data } = r.data;
                    if(code === 0) {
                        setTime(create);
                        setCreateIssueModal(false);
                    }
                }).catch(e => {
                    if(!e.response) message.error(e.message);
                    else {
                        const { data } = e.response;
                        message.error(data.msg);
                    }
                })
            }
        })
    }

    const { getFieldDecorator } = form;

    const formItemLayout = {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 4 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 20 },
        },
      };

    return (
        <Form
            onSubmit={handleSubmit}>
            <Form.Item {...formItemLayout} label="期号">
                {
                    getFieldDecorator('issue', {
                        rules: [{ required: true, message: '请输入期号!' }],
                      })(
                        <Input placeholder="期号" />
                      )
                }
            </Form.Item>
            <Form.Item {...formItemLayout} label="类型">
                {
                    getFieldDecorator('issueType', {
                        rules: [{ required: true, message: '请选择问卷类型！' }],
                        initialValue: 1
                    })(
                        <Select>
                            <Option value={1}>问卷</Option>
                            <Option value={2}>问答</Option>
                        </Select>
                    )
                }
            </Form.Item>
            <Form.Item {...formItemLayout} label="标题">
                {
                    getFieldDecorator('title', {
                        rules: [{ required: true, message: '请输入标题!' }],
                      })(
                        <Input placeholder="标题" />
                      )
                }
            </Form.Item>
            <Button 
                type="primary"
                htmlType="submit"
                style={{
                    width: '100%'
                }}
            >
                创建问卷
            </Button>
        </Form>
    )
}

const WrappedForm = Form.create({name: 'create_issue_form'})(CreateIssueForm);

export default WrappedForm;