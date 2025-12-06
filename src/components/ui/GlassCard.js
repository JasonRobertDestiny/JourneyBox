import React from 'react';
import { motion } from 'framer-motion';
import './GlassCard.css';

/**
 * GlassCard - 毛玻璃效果卡片组件
 *
 * Props:
 * - children: 卡片内容
 * - className: 额外的CSS类名
 * - hoverable: 是否启用悬停效果 (默认 true)
 * - glowColor: 悬停时的发光颜色 (默认 #667eea)
 * - onClick: 点击回调
 * - delay: 动画延迟 (秒)
 */
function GlassCard({
  children,
  className = '',
  hoverable = true,
  glowColor = '#667eea',
  onClick,
  delay = 0,
  style = {}
}) {
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const hoverVariants = hoverable ? {
    whileHover: {
      y: -8,
      scale: 1.02,
      boxShadow: `0 20px 40px rgba(0,0,0,0.15), 0 0 30px ${glowColor}20`,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    whileTap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  } : {};

  return (
    <motion.div
      className={`glass-card ${className}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      {...hoverVariants}
      onClick={onClick}
      style={{
        '--glow-color': glowColor,
        ...style
      }}
    >
      <div className="glass-card-inner">
        {children}
      </div>
      <div className="glass-card-shine" />
    </motion.div>
  );
}

export default GlassCard;
