import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { Table, Button, message, Modal } from 'antd';

import CreateOptionForm from './CreateOptionForm';
import CreateTopicForm from './CreateTopicForm';
import ChoiceOptions from './ChoiceOptions';
import SelectorOptions from './SelectorOptions';
import MultiSeletorOptions from './MultiSelectorOptions';
import { host } from '../../config';
import { handleError } from '../../utils';

import { convertResult, exportCsv } from './util';

const user = Cookies.getJSON('user');
const token = Cookies.get('token');

function Topic({issue_id}) {

    const [topic, setTopic] = useState([]);
    const [issue, setIssue] = useState({});
    const [time, setTime] = useState(null);
    const [addOptionModal, setAddOptionModal] = useState(false);
    const [addTopicModal, setAddTopicModal] = useState(false);
    const [curTopicId, setCurTopicId] = useState();
    const [result, setResult] = useState([]);
    
    useEffect(() => {
        axios({
            method: 'post',
            url: `${host}/api/question/topic/list`,
            headers: {
                'Authorization': `Berear ${token}`,
            },
            data: {
                issue_id,
            }
        }).then(r => {
            const { code, data } = r.data;
            if(code === 0) {
                setTopic(data.list.map((item, index) => {
                    item.key = index;
                    return item;
                }));
                setIssue(data.issue);
            }
        }).catch(e => {
            handleError(e);
        })
    }, [issue_id, time])

    useEffect(() => {
        axios({
            method: 'get',
            url: `${host}/api/question/result/list?issue_id=${issue_id}`,
            headers: {
                'Authorization': `Berear ${token}`
            },
        }).then(r => {
            const { code, data } = r.data;
            if(code === 0) {
                setResult(data.results);
            }
        }).catch(e => {
            handleError(e);
        })
    }, [])

    const typeDict = {
        'choice': '单选题',
        'selector': '下拉选择',
        'multiselector': '多选题',
        'input': '问答题',
        'placepicker': '城市选择',
    }

    const columns = [
        {
            title: '题号',
            dataIndex: 'number',
            key: 'number', 
            width: '100px'
        },
        {
            title: '必选',
            dataIndex: 'required',
            key: 'required',
            width: '120px',
            render: required => (
                <span
                    style={{
                        color: ['green', 'red'][required]
                    }}
                >
                    {['非必选', '必选'][required]}
                </span>
            )
        },
        {
            title: '题目',
            dataIndex: 'title',
            key: 'title',
            width: '300px',
        },
        {
            title: '题型',
            dataIndex: 'type',
            key: 'type',
            width: '120px',
            render: type => typeDict[type],
        },
        {
            title: '答案值',
            dataIndex: 'answer',
            key: 'answer',
            width: '120px',
        },
        {
            title: '分数',
            dataIndex: 'score',
            key: 'score',
            width: '120px',
        },
        {
            title: '操作', 
            dataIndex: '_id', 
            key: '_id', 
            width: '160px',
            render: id => (
                <div>
                    <Button
                        size="small"
                        type="primary"
                        onClick={handleAddOptionModalShow(id)}
                    >添加</Button>
                    <Button
                        size="small"
                        type="danger"
                        style={{
                            marginLeft: '10px',
                        }}
                        onClick={handleDeleteTopic(id)}
                    >删除</Button>
                </div>
            ),
        },
    ];  
    // 删除题目
    const handleDeleteTopic = (id) => () => {
        axios({
            method: 'post',
            url: `${host}/api/question/topic/remove`,
            headers: {
                'Authorization': `Berear ${token}`
            },
            data: {
                topic_id: id,
            }
        }).then(r => {
            const {code, data} = r.data
            if(code === 0) {
                message.success('删除题目成功！')
                setTime(Date.now());
            }
        }).catch(e => {
            handleError(e);
        })
    }
    // 添加选项弹框
    const handleAddOptionModalShow = (id) => () => {
        setAddOptionModal(true);
        setCurTopicId(id);
    }
    // 添加题目弹框
    const handleAddTopicModalShow = () => {
        setAddTopicModal(true);
    }
    // 表格展开
    const _renderExpend = (record) => {
        const {
            options,
            other_value,
            multi,
            follow,
            textarea,
            type,
        } = record; 
        switch(type) {
            case 'choice': 
                return options.map((item, index) => (
                    <ChoiceOptions 
                        key={index}
                        setTime={setTime}
                        {...item}
                    />
                ))
            case 'selector': 
                /*
                return options.map((item, index) => (
                    <SelectorOptions 
                        key={index}
                        setTime={setTime}
                        {...item}
                    />
                ))
                */
                return '目前问卷前端使用默认ages数组';
            case 'placepicker':
                return '固定模块';
            case 'input': 
                return (
                    <div>
                        <div>此为问答题</div>
                        {
                            !!follow ? 
                            <div>(条件展示)题号：{follow.number}-提值：{follow.value}</div>
                            : ''
                        }
                        {
                            !!textarea ? <div>是textarea</div> : ''
                        }
                    </div>
                )
            case 'multiselector': 
                return options.map((item, index) => (
                    <MultiSeletorOptions 
                        key={index}
                        setTime={setTime}
                        {...item}
                    />
                ))
            default:
                return '空空如也';
        }        
    }

    const handleExportClicked = () => {
        const { csv } =  convertResult(result, topic);
        exportCsv(csv);
    }

    return (
        <div
            style={{
                height: 'calc(100vh - 221px)',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    height: '45px',
                }}
            >
                <Button
                    type="primary"
                    onClick={handleAddTopicModalShow}
                >
                    添加题目
                </Button>
                <Button
                    disabled={!topic || topic.length <= 0}
                    onClick={handleExportClicked}

                >导出结果</Button>
            </div>
            <div
                style={{
                    maxHeight: 'calc(100vh - 266px)',
                    overflowY: 'scroll',
                    paddingBottom: '10px',
                    boxSizing: 'border-box',
                }}
            >
                <Table
                    bordered
                    columns={columns}
                    expandedRowRender={record => _renderExpend(record)}
                    dataSource={topic}
                    pagination={false}
                />
            </div>
            <Modal
                visible={addOptionModal}
                title="添加选项"
                footer={false}
                onCancel={() => setAddOptionModal(false)}
            >
                <CreateOptionForm
                    setTime={setTime}
                    setCreateOptionModal={setAddOptionModal}
                    topicId={curTopicId}
                    issueId={issue_id}
                />
            </Modal>
            <Modal
                visible={addTopicModal}
                title="添加题目"
                footer={false}
                onCancel={() => setAddTopicModal(false)}
            >
                <CreateTopicForm 
                    setTime={setTime}
                    setCreateTopicModal={setAddTopicModal}
                    issueId={issue_id}
                    issueType={issue.issue_type}
                />
            </Modal>
        </div>
    )
}

export default Topic;