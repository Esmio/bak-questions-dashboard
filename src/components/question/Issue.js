import React, {useState, useEffect} from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import Cookies from 'js-cookie';
import { Table, Button, Pagination, Modal, Popconfirm } from 'antd';
import { host } from '../../config';
import { handleError } from '../../utils';

import CreateIssueForm from './CreateIssueForm';

function Question({setActiveKey, setIssueId}) {
    let [data, setData] = useState([]);
    let [createIssueModal, setCreateIssueModal] = useState(false);
    let [time, setTime] = useState(null);
    let [pagination, setPagination] = useState({page: 1, pageSize: 10});
    // 题目

    const token = Cookies.get('token');
    const user = Cookies.getJSON('user');

    const deleteIssue = (id) => () => {
        axios({
            method: 'post',
            url: `${host}/api/question/issue/remove`,
            headers: {
                'Authorization': `Berear ${token}`,
            },
            data: {
                oid: id
            }
        }).then(r => {
            const {code, data} = r.data;
            if(code === 0) {
                setTime(Date.now());
            }
        }).catch(e => {
            handleError(e);
        })
    }

    const handlePageChange = (page, pageSize) => {
        setPagination(Object.assign({}, pagination, {page, pageSize}));
        setTime(Date.now());
    }

    const publishIssue = (id) => () => {
        axios({
            method: 'post',
            url: `${host}/api/question/issue/update`,
            headers: {
                'Authorization': `Berear ${token}`,
            },
            data: {
                oid: id,
                method: 'publish',
                key: 'status',
            }
        }).then(r => {
            const {code, data} = r.data;
            if(code === 0) {
                setTime(Date.now())
            }
        }).catch(e => {
            handleError(e);            
        })
    }

    const handleCheckDetail = (id) => () => {
        setActiveKey('2');
        setIssueId(id);
    }

    const createIssue = () => setCreateIssueModal(true);

    const cancelCreateIssueModal = () => setCreateIssueModal(false);

    useEffect(() => {
        const {page, pageSize} = pagination;
        axios({
            method: 'post',
            url: `${host}/api/question/issue/list`,
            data: {
                page,
                pageSize,
            }
        }).then(r => {
            const {code, data} = r.data;
            if(code === 0) {
                setData(data.list.map((item, index) => {
                    item.key = index;
                    return item;
                }));
                setPagination(data.pagination);
            }
        }).catch(e => {
            handleError(e);
        })
    }, [time])

    const columns = [
        {
            title: '期号',
            dataIndex: 'issue',
            key: 'issue',
            width: '140px'
        }, {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            width: '200px',
        }, {
            title: '创建时间',
            dataIndex: 'create',
            key: 'create',
            width: '160px',
            render: date => {
                const serverOffset = new Date().getTimezoneOffset() / 60; 
                return dayjs(date).add(-8 - serverOffset, 'hour').format('YYYY-MM-DD HH:mm:ss');
            } 
        }, {
            title: '问卷链接',
            dataIndex: '_id',
            key: 'link',
            width: '120px',
            render: (id, record)=> {
                const {issue_type} = record;
                const link = `${host}/m?issue_id=${id}&issue_type=${issue_type}&uid=`;
                return <a href={link} title={link} target="_blank">查看问卷</a>
            }
        }, {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: '160px',
            render: status => (
                <span
                    style={{
                        color: ['plum', 'green', 'red', 'gray'][status]
                    }}
                >
                    {['待发布', '调查中', '已截止', '已删除'][status]}
                </span>
            ),
        }, {
            title: '操作',
            dataIndex: '_id',
            key: '_id',
            width: '140px',
            render: (id, record) => (
                <div>
                    <Button
                        size="small"
                        onClick={handleCheckDetail(id)}
                    >查看</Button>
                    <Button
                        disabled={record.status !== 0}
                        size="small"
                        type="primary"
                        style={{
                            marginLeft: '10px'
                        }}
                        onClick={publishIssue(id)}
                    >
                        发布
                    </Button>
                    {
                        record.status === 0 ? 
                        <Popconfirm
                            title="确定删除这个问卷吗？"
                            onConfirm={deleteIssue(id)}
                            okText="确定"
                            cancelText="取消"
                        >
                            <Button
                                size="small"
                                type="danger"
                                style={{
                                    marginLeft: '10px',
                                }}
                            >
                                删除
                            </Button>
                        </Popconfirm> : ''
                    }
                </div>
            )
        }
    ];

    return (
        <div
            style={{
                height: 'calc(100vh - 160px)',
            }}
        >
            <div
                style={{
                    height: '45px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                }}
            >
                <Button
                    type="primary"
                    onClick={createIssue}
                >
                    创建问卷
                </Button>
                <Pagination
                    {...pagination}
                    onChange={handlePageChange}
                />
            </div>
            <Table 
                bordered
                dataSource={data} 
                columns={columns} 
                pagination={false}
            />
            <Modal
                visible={createIssueModal}
                title="创建问卷"
                onCancel={cancelCreateIssueModal}
                footer={false}
            >
                <CreateIssueForm
                    setTime={setTime}
                    setCreateIssueModal={setCreateIssueModal}
                />
            </Modal>
        </div>
    )
}

export default Question;