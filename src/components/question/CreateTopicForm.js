import React, { useState } from 'react';
import { Form, Input, InputNumber, Button, Radio, Select, Switch } from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';
import { host } from '../../config';
import { handleError } from '../../utils';

const Option = Select.Option;

const token = Cookies.get('token');

function CreateOptionForm({ form, setTime, setCreateTopicModal, issueId, issueType }) {

    let [type, setType] = useState();
    let [showOther, setShowOther] = useState(false);
    let [showFollow, setShowFollow] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        form.validateFields((err, values) => {
            if (!err) {
                const {
                    type,
                    title,
                    number,
                    required,
                    other_value,
                    multi,
                    textarea,
                    follow_number,
                    follow_value,
                    answer,
                    multi_answer,
                    score,
                } = values;
                const create = Date.now();
                const follow = {
                    number: follow_number,
                    value: follow_value,
                }
                const followStr = JSON.stringify(follow);
                const data = {
                    type,
                    title,
                    number,
                    required,
                    other_value,
                    multi,
                    textarea,
                    issue_id: issueId,
                    answer,
                    multi_answer,
                    score,
                }
                if (follow_number && follow_value) data.follow = followStr
                axios({
                    method: 'post',
                    url: `${host}/api/question/topic`,
                    headers: {
                        'Authorization': `Berear ${token}`
                    },
                    data,
                }).then(r => {
                    const { code, data } = r.data;
                    if (code === 0) {
                        setTime(create);
                        setCreateTopicModal(false);
                    }
                }).catch(e => {
                    handleError(e);
                })
            }
        })
    }

    const handleTypeChange = (type) => {
        setType(type);
    }

    const handleShowOtherChange = (checked) => {
        setShowOther(checked);
    }

    const handleShowFollowChange = (checked) => {
        setShowFollow(checked);
    }

    const { getFieldDecorator } = form;

    const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 14 },
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Item
                {...formItemLayout}
                label="题号"
                hasFeedback
            >
                {
                    getFieldDecorator('number', {
                        rules: [{ required: true, pattern: /^-?[0-9.]+$/, message: '题号为数字，不能为空！' }],
                    })(
                        <Input placeholder="题号" />
                    )
                }
            </Form.Item>
            <Form.Item
                {...formItemLayout}
                label="选择题型"
                hasFeedback
            >
                {getFieldDecorator('type', {
                    rules: [
                        { required: true, message: '请选择题型' },
                    ],
                })(
                    <Select
                        placeholder="请选择一个题型"
                        onChange={handleTypeChange}
                    >
                        <Option value="choice">单选题</Option>
                        <Option value="selector">下拉选择</Option>
                        <Option value="placepicker">城市选择</Option>
                        <Option value="multiselector">多选题</Option>
                        <Option value="input">问答题</Option>
                    </Select>
                )}
            </Form.Item>
            {
                type === 'choice' || type === 'multiselector' ?
                    <Form.Item
                        {...formItemLayout}
                        label="是否有其他值"
                    >
                        {getFieldDecorator('switch_1', { valuePropName: 'checked' })(
                            <Switch onChange={handleShowOtherChange} />
                        )}
                    </Form.Item> : ''
            }
            {
                showOther && (type === 'choice' || type === 'multiselector') ?
                    <Form.Item
                        {...formItemLayout}
                        label="其他选项值"
                    >
                        {getFieldDecorator('other_value', { initialValue: 5 })(
                            <InputNumber min={1} max={15} />
                        )}
                    </Form.Item> : ''
            }
            {
                type === 'multiselector' ?
                    <Form.Item
                        {...formItemLayout}
                        label="多选限制个数"
                    >
                        {getFieldDecorator('multi', { initialValue: 0 })(
                            <InputNumber min={0} max={10} />
                        )}
                    </Form.Item> : ''
            }
            {
                type === 'input' ?
                    <Form.Item
                        {...formItemLayout}
                        label="是否为textarea"
                    >
                        {getFieldDecorator('textarea', {
                            initialValue: '0'
                        })(
                            <Radio.Group>
                                <Radio value="0">不是</Radio>
                                <Radio value="1">是</Radio>
                            </Radio.Group>
                        )}
                    </Form.Item> : ''
            }
            {
                type === 'input' ?
                    <Form.Item
                        {...formItemLayout}
                        label="是否Follow"
                    >
                        {getFieldDecorator('switch_2', { valuePropName: 'checked' })(
                            <Switch onChange={handleShowFollowChange} />
                        )}
                    </Form.Item> : ''
            }
            {
                type === 'input' && showFollow ?
                    <Form.Item
                        {...formItemLayout}
                        label="题号"
                    >
                        {getFieldDecorator('follow_number', { initialValue: 1 })(
                            <InputNumber />
                        )}

                    </Form.Item> : ''
            }
            {
                type === 'input' && showFollow ?
                    <Form.Item
                        {...formItemLayout}
                        label="题值"
                    >
                        {getFieldDecorator('follow_value', { initialValue: 1 })(
                            <InputNumber />
                        )}
                    </Form.Item> : ''
            }
            <Form.Item
                {...formItemLayout}
                label="题目"
                hasFeedback
            >
                {
                    getFieldDecorator('title', {
                        rules: [{ required: true, message: '请输入题目!' }],
                    })(
                        <Input placeholder="题目" />
                    )
                }
            </Form.Item>
            {
                type === 'choice' && issueType === 2 ?  // issueType === 2
                    <Form.Item
                        {...formItemLayout}
                        label="设置答案"
                        hasFeedback
                    >
                        {
                            getFieldDecorator('answer', {
                                rules: [{ required: true, message: '请输入答案!' }],
                            })(
                                <Input placeholder="答案" />
                            )
                        }
                    </Form.Item> : ''
            }
            {
                type === 'multiselector' && issueType === 2 ?  // issueType === 2
                    <Form.Item
                        {...formItemLayout}
                        label="设置多选答案"
                        hasFeedback
                    >
                        {
                            getFieldDecorator('multi_answer', {
                                rules: [{ required: true, message: '请输入多选答案!' }],
                            })(
                                <Input placeholder="答案" />
                            )
                        }
                    </Form.Item> : ''
            }
            {
                type === 'choice' || type === 'multiselector' && issueType === 2 ? // issueType === 2
                    <Form.Item
                        {...formItemLayout}
                        label="设置分数"
                        hasFeedback
                    >
                        {
                            getFieldDecorator('score', {
                                rules: [{ required: true, message: '请输入分数!' }],
                            })(
                                <Input placeholder="分数" />
                            )
                        }
                    </Form.Item> : ''
            }
            <Form.Item
                {...formItemLayout}
                label="是否必须"
            >
                {getFieldDecorator('required', {
                    rules: [{ required: true, message: '请输入题号!' }],
                })(
                    <Radio.Group>
                        <Radio value="0">非必须</Radio>
                        <Radio value="1">必须</Radio>
                    </Radio.Group>
                )}
            </Form.Item>
            <Button
                type="primary"
                htmlType="submit"
                style={{
                    width: '100%'
                }}
            >
                添加题目
            </Button>
        </Form>
    )
}

const WrappedForm = Form.create({ name: 'create_option_form' })(CreateOptionForm);

export default WrappedForm;