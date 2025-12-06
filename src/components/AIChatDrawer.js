import React, { useState } from 'react';
import { Drawer, Button, Input, Avatar, Space, Alert, FloatButton, Modal, message } from 'antd';
import { MessageOutlined, UserOutlined, RobotOutlined, LoadingOutlined } from '@ant-design/icons';
import { askTravelQuestion } from '../api/aiService';

// 快捷问题列表
const QUICK_QUESTIONS = [
  '优化第一天的行程',
  '推荐当地特色美食',
  '哪些景点适合拍照',
  '如何节省交通时间'
];

/**
 * AI旅行助手聊天抽屉组件
 * 特点：只提供建议，不自动修改行程
 */
function AIChatDrawer({ tripDetails }) {
  const [open, setOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);

  // 提取建议块，格式为【建议】...
  const extractSuggestions = (text) => {
    if (!text) return [];
    const matches = text.match(/【建议】([^【]+)/g);
    if (!matches) return [];
    return matches.map(item => item.replace('【建议】', '').trim()).filter(Boolean);
  };

  // 发送消息
  const handleSendMessage = async (presetQuestion) => {
    if (loading) return;
    const question = presetQuestion || chatInput.trim();
    if (!question) return;

    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    try {
      const response = await askTravelQuestion(question, {
        destination: tripDetails?.tripInfo?.destination,
        dates: {
          start: tripDetails?.tripInfo?.startDate,
          end: tripDetails?.tripInfo?.endDate
        },
        itinerary: tripDetails?.itinerary
      });

      if (response.error) {
        throw new Error(response.error);
      }

      const suggestions = extractSuggestions(response.answer);
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: response.answer,
        suggestions
      }]);
    } catch (error) {
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: `抱歉，AI助手暂时无法回答：${error.message}`,
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  // 应用建议（仅记录，不自动改动）
  const handleApplySuggestion = (suggestion) => {
    Modal.confirm({
      title: '确认应用建议',
      content: (
        <div>
          <p>确认要采纳此建议吗？需要手动调整行程。</p>
          <p style={{ background: '#f5f5f5', padding: 8, borderRadius: 4 }}>{suggestion}</p>
        </div>
      ),
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        message.success('已记录建议，请手动编辑行程应用');
      }
    });
  };

  return (
    <>
      {/* 浮动入口按钮 */}
      <FloatButton
        icon={<MessageOutlined />}
        type="primary"
        style={{ right: 24, bottom: 80 }}
        onClick={() => setOpen(true)}
        tooltip="AI旅行助手（仅提供建议，需手动确认）"
      />

      {/* 聊天抽屉 */}
      <Drawer
        title="AI旅行助手（建议模式）"
        placement="right"
        width={420}
        open={open}
        onClose={() => setOpen(false)}
      >
        {/* 提示信息 */}
        <Alert
          type="info"
          message="AI仅提供建议，行程更改需您手动确认。"
          showIcon
          style={{ marginBottom: 12 }}
        />

        {/* 快捷问题 */}
        <Space wrap style={{ marginBottom: 12 }}>
          {QUICK_QUESTIONS.map((q, i) => (
            <Button key={i} size="small" onClick={() => handleSendMessage(q)}>
              {q}
            </Button>
          ))}
        </Space>

        {/* 对话历史 */}
        <div style={{
          height: '50vh',
          overflowY: 'auto',
          marginBottom: 12,
          paddingRight: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          {chatHistory.length === 0 && (
            <div style={{
              textAlign: 'center',
              color: '#999',
              padding: '40px 20px'
            }}>
              点击上方快捷问题或输入您的问题开始对话
            </div>
          )}
          {chatHistory.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              gap: 8
            }}>
              <Avatar
                icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                style={{
                  backgroundColor: msg.role === 'user' ? '#1890ff' : '#87d068',
                  flexShrink: 0
                }}
              />
              <div style={{ maxWidth: '80%' }}>
                <div
                  style={{
                    padding: '8px 12px',
                    background: msg.role === 'user' ? '#1890ff' : (msg.error ? '#fff2f0' : '#f5f5f5'),
                    color: msg.role === 'user' ? '#fff' : (msg.error ? '#ff4d4f' : '#000'),
                    borderRadius: 8,
                    wordBreak: 'break-word'
                  }}
                >
                  {msg.content}
                </div>
                {/* 建议按钮 */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {msg.suggestions.map((sug, sidx) => (
                      <Button
                        key={sidx}
                        size="small"
                        type="dashed"
                        style={{ marginRight: 8, marginTop: 4 }}
                        onClick={() => handleApplySuggestion(sug)}
                      >
                        {sug.length > 20 ? sug.substring(0, 20) + '...' : sug}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {/* Loading状态 */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar
                icon={<RobotOutlined />}
                style={{ backgroundColor: '#87d068' }}
              />
              <div style={{
                padding: '8px 12px',
                background: '#f5f5f5',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <LoadingOutlined /> 正在思考...
              </div>
            </div>
          )}
        </div>

        {/* 输入区域 */}
        <Input.TextArea
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="询问AI关于行程的问题...（Shift+Enter换行）"
          autoSize={{ minRows: 2, maxRows: 4 }}
          disabled={loading}
        />
        <Button
          type="primary"
          block
          onClick={() => handleSendMessage()}
          loading={loading}
          style={{ marginTop: 8 }}
        >
          发送
        </Button>
      </Drawer>
    </>
  );
}

export default AIChatDrawer;
