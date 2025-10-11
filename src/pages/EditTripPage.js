import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layout, Card, Button, Space, message, Row, Col,
  Form, Input, DatePicker, Select, Modal, Spin,
  Divider, Tag, Timeline, List, Avatar, Popconfirm,
  Drawer, Tooltip, Switch, Radio, Checkbox
} from 'antd';
import {
  EditOutlined, SaveOutlined, ShareAltOutlined,
  DeleteOutlined, PlusOutlined, RobotOutlined,
  EnvironmentOutlined, ClockCircleOutlined,
  DollarOutlined, CalendarOutlined, TeamOutlined,
  SettingOutlined, ExportOutlined, ImportOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { getTripDetailsById, updateTrip, deleteTrip } from '../api/tripService';
import { optimizeTripPlan } from '../api/aiService';
import Header from '../components/Header';
import '../styles/EditTripPage.css';

const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const EditTripPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [optimizeModalVisible, setOptimizeModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  // 优化选项
  const [optimizeOptions, setOptimizeOptions] = useState({
    reduceTravelTime: false,
    avoidCrowds: false,
    budgetFriendly: false,
    familyFriendly: false,
    moreAttractions: false,
    moreRestTime: false
  });

  // 加载行程数据
  useEffect(() => {
    loadTripData();
  }, [id]);

  const loadTripData = async () => {
    try {
      setLoading(true);
      const data = await getTripDetailsById(parseInt(id));
      if (!data) {
        message.error('行程不存在');
        navigate('/');
        return;
      }
      setTripData(data);

      // 设置表单初始值
      form.setFieldsValue({
        title: data.tripInfo.title,
        destination: data.tripInfo.destination,
        dates: [
          moment(data.tripInfo.startDate),
          moment(data.tripInfo.endDate)
        ],
        budget: data.tripInfo.budget || 'medium',
        notes: data.tripInfo.notes
      });
    } catch (error) {
      message.error('加载行程失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 保存行程
  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();

      const updatedTrip = {
        ...tripData.tripInfo,
        title: values.title,
        destination: values.destination,
        startDate: values.dates[0].format('YYYY-MM-DD'),
        endDate: values.dates[1].format('YYYY-MM-DD'),
        budget: values.budget,
        notes: values.notes,
        itinerary: tripData.itinerary
      };

      await updateTrip(parseInt(id), updatedTrip);
      message.success('行程保存成功');
      setEditMode(false);
    } catch (error) {
      message.error('保存失败');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // AI优化行程
  const handleOptimize = async () => {
    try {
      setOptimizing(true);
      setOptimizeModalVisible(false);

      const result = await optimizeTripPlan(tripData.itinerary, optimizeOptions);

      if (result.error) {
        message.error('优化失败: ' + result.error);
      } else {
        // 更新行程数据
        setTripData({
          ...tripData,
          itinerary: result
        });
        message.success('行程优化成功！');
      }
    } catch (error) {
      message.error('优化失败');
      console.error(error);
    } finally {
      setOptimizing(false);
    }
  };

  // 添加新活动
  const handleAddActivity = (dayIndex) => {
    const newActivity = {
      time: '10:00',
      duration: '120',
      name: '新活动',
      type: 'attraction',
      location: '',
      description: '请编辑活动详情',
      cost: '0'
    };

    const updatedItinerary = { ...tripData.itinerary };
    if (!updatedItinerary.days[dayIndex].activities) {
      updatedItinerary.days[dayIndex].activities = [];
    }
    updatedItinerary.days[dayIndex].activities.push(newActivity);

    setTripData({
      ...tripData,
      itinerary: updatedItinerary
    });

    message.success('已添加新活动');
  };

  // 删除活动
  const handleDeleteActivity = (dayIndex, activityIndex) => {
    const updatedItinerary = { ...tripData.itinerary };
    updatedItinerary.days[dayIndex].activities.splice(activityIndex, 1);

    setTripData({
      ...tripData,
      itinerary: updatedItinerary
    });

    message.success('活动已删除');
  };

  // 编辑活动
  const handleEditActivity = (dayIndex, activityIndex, field, value) => {
    const updatedItinerary = { ...tripData.itinerary };
    updatedItinerary.days[dayIndex].activities[activityIndex][field] = value;

    setTripData({
      ...tripData,
      itinerary: updatedItinerary
    });
  };

  // 分享行程
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/trip/${id}`;
    navigator.clipboard.writeText(shareUrl);
    message.success('分享链接已复制到剪贴板');
    setShareModalVisible(false);
  };

  // 导出行程
  const handleExport = () => {
    const dataStr = JSON.stringify(tripData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `trip_${id}_${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    message.success('行程已导出');
  };

  // 删除行程
  const handleDelete = async () => {
    try {
      await deleteTrip(parseInt(id));
      message.success('行程已删除');
      navigate('/');
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header title="编辑行程" showBackButton />
        <Content style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" tip="加载中..." />
        </Content>
      </Layout>
    );
  }

  if (!tripData) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header title="编辑行程" showBackButton />
        <Content style={{ padding: '24px' }}>
          <Card>
            <p>行程不存在</p>
            <Button onClick={() => navigate('/')}>返回首页</Button>
          </Card>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header title="编辑行程" showBackButton />

      <Content style={{ padding: '24px' }}>
        {/* 工具栏 */}
        <Card style={{ marginBottom: '24px' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Button
                  type={editMode ? 'default' : 'primary'}
                  icon={<EditOutlined />}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? '取消编辑' : '编辑模式'}
                </Button>

                {editMode && (
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={saving}
                    onClick={handleSave}
                  >
                    保存更改
                  </Button>
                )}

                <Button
                  icon={<RobotOutlined />}
                  loading={optimizing}
                  onClick={() => setOptimizeModalVisible(true)}
                >
                  AI优化
                </Button>

                <Button
                  icon={<ShareAltOutlined />}
                  onClick={() => setShareModalVisible(true)}
                >
                  分享
                </Button>

                <Button
                  icon={<ExportOutlined />}
                  onClick={handleExport}
                >
                  导出
                </Button>

                <Popconfirm
                  title="确定要删除这个行程吗？"
                  onConfirm={handleDelete}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button danger icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            </Col>

            <Col>
              <Button
                type="default"
                icon={<SettingOutlined />}
                onClick={() => setDrawerVisible(true)}
              >
                高级设置
              </Button>
            </Col>
          </Row>
        </Card>

        {/* 基本信息编辑 */}
        {editMode && (
          <Card title="基本信息" style={{ marginBottom: '24px' }}>
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="title"
                    label="行程标题"
                    rules={[{ required: true, message: '请输入标题' }]}
                  >
                    <Input placeholder="输入行程标题" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="destination"
                    label="目的地"
                    rules={[{ required: true, message: '请输入目的地' }]}
                  >
                    <Input placeholder="输入目的地" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="dates"
                    label="日期范围"
                    rules={[{ required: true, message: '请选择日期' }]}
                  >
                    <RangePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="budget" label="预算">
                    <Select>
                      <Option value="budget">经济实惠</Option>
                      <Option value="medium">中等消费</Option>
                      <Option value="luxury">高端享受</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="notes" label="备注">
                <TextArea rows={3} placeholder="添加备注信息" />
              </Form.Item>
            </Form>
          </Card>
        )}

        {/* 行程详情 */}
        <Card title="行程详情">
          {tripData.itinerary && tripData.itinerary.days && (
            <Timeline>
              {tripData.itinerary.days.map((day, dayIndex) => (
                <Timeline.Item key={dayIndex} color="blue">
                  <Card
                    size="small"
                    title={
                      <Row justify="space-between" align="middle">
                        <Col>
                          <CalendarOutlined /> 第 {dayIndex + 1} 天 - {day.date || '日期待定'}
                        </Col>
                        {editMode && (
                          <Col>
                            <Button
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={() => handleAddActivity(dayIndex)}
                            >
                              添加活动
                            </Button>
                          </Col>
                        )}
                      </Row>
                    }
                    style={{ marginBottom: '16px' }}
                  >
                    <p style={{ marginBottom: '16px', color: '#666' }}>
                      {day.dayOverview}
                    </p>

                    <List
                      dataSource={day.activities || []}
                      renderItem={(activity, activityIndex) => (
                        <List.Item
                          actions={editMode ? [
                            <Popconfirm
                              title="确定删除这个活动吗？"
                              onConfirm={() => handleDeleteActivity(dayIndex, activityIndex)}
                            >
                              <Button size="small" danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                          ] : []}
                        >
                          <List.Item.Meta
                            avatar={<Avatar icon={<EnvironmentOutlined />} />}
                            title={
                              editMode ? (
                                <Input
                                  value={activity.name}
                                  onChange={(e) => handleEditActivity(dayIndex, activityIndex, 'name', e.target.value)}
                                  style={{ width: '200px' }}
                                />
                              ) : (
                                activity.name
                              )
                            }
                            description={
                              <Space direction="vertical">
                                <span>
                                  <ClockCircleOutlined /> {activity.time} ({activity.duration}分钟)
                                </span>
                                <span>
                                  <EnvironmentOutlined /> {activity.location}
                                </span>
                                <span>
                                  <DollarOutlined /> {activity.cost}
                                </span>
                                {editMode ? (
                                  <TextArea
                                    value={activity.description}
                                    onChange={(e) => handleEditActivity(dayIndex, activityIndex, 'description', e.target.value)}
                                    rows={2}
                                  />
                                ) : (
                                  <span>{activity.description}</span>
                                )}
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          )}
        </Card>

        {/* AI优化模态框 */}
        <Modal
          title="AI行程优化"
          visible={optimizeModalVisible}
          onOk={handleOptimize}
          onCancel={() => setOptimizeModalVisible(false)}
          confirmLoading={optimizing}
        >
          <p style={{ marginBottom: '16px' }}>选择您的优化偏好：</p>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Checkbox
              checked={optimizeOptions.reduceTravelTime}
              onChange={(e) => setOptimizeOptions({ ...optimizeOptions, reduceTravelTime: e.target.checked })}
            >
              减少交通时间
            </Checkbox>
            <Checkbox
              checked={optimizeOptions.avoidCrowds}
              onChange={(e) => setOptimizeOptions({ ...optimizeOptions, avoidCrowds: e.target.checked })}
            >
              避开人流高峰
            </Checkbox>
            <Checkbox
              checked={optimizeOptions.budgetFriendly}
              onChange={(e) => setOptimizeOptions({ ...optimizeOptions, budgetFriendly: e.target.checked })}
            >
              更经济实惠
            </Checkbox>
            <Checkbox
              checked={optimizeOptions.familyFriendly}
              onChange={(e) => setOptimizeOptions({ ...optimizeOptions, familyFriendly: e.target.checked })}
            >
              适合家庭出行
            </Checkbox>
            <Checkbox
              checked={optimizeOptions.moreAttractions}
              onChange={(e) => setOptimizeOptions({ ...optimizeOptions, moreAttractions: e.target.checked })}
            >
              增加景点数量
            </Checkbox>
            <Checkbox
              checked={optimizeOptions.moreRestTime}
              onChange={(e) => setOptimizeOptions({ ...optimizeOptions, moreRestTime: e.target.checked })}
            >
              增加休息时间
            </Checkbox>
          </Space>
        </Modal>

        {/* 分享模态框 */}
        <Modal
          title="分享行程"
          visible={shareModalVisible}
          onOk={handleShare}
          onCancel={() => setShareModalVisible(false)}
        >
          <p>点击确定复制分享链接到剪贴板</p>
          <Input
            value={`${window.location.origin}/trip/${id}`}
            readOnly
            style={{ marginTop: '16px' }}
          />
        </Modal>

        {/* 高级设置抽屉 */}
        <Drawer
          title="高级设置"
          placement="right"
          closable={true}
          onClose={() => setDrawerVisible(false)}
          visible={drawerVisible}
          width={400}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Card size="small" title="导入行程">
              <p>从文件导入行程数据</p>
              <Button icon={<ImportOutlined />}>选择文件</Button>
            </Card>

            <Card size="small" title="行程模板">
              <p>将此行程保存为模板</p>
              <Button>保存为模板</Button>
            </Card>

            <Card size="small" title="协作设置">
              <p>邀请其他用户共同编辑</p>
              <Button>邀请协作者</Button>
            </Card>
          </Space>
        </Drawer>
      </Content>
    </Layout>
  );
};

export default EditTripPage;