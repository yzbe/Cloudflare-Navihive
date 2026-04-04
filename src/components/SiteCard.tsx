// src/components/SiteCard.tsx
import { useState, memo } from 'react';
import { Site } from '../API/http';
import SiteSettingsModal from './SiteSettingsModal';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// 引入Material UI组件
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Skeleton,
  IconButton,
  Box,
  Fade,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

interface SiteCardProps {
  site: Site;
  onUpdate: (updatedSite: Site) => void;
  onDelete: (siteId: number) => void;
  isEditMode?: boolean;
  viewMode?: 'readonly' | 'edit'; // 访问模式
  index?: number;
  iconApi?: string; // 添加iconApi属性
}

// 使用memo包装组件以减少不必要的重渲染
const SiteCard = memo(function SiteCard({
  site,
  onUpdate,
  onDelete,
  isEditMode = false,
  viewMode = 'edit', // 默认为编辑模式
  index = 0,
  iconApi, // 添加iconApi参数
}: SiteCardProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [iconError, setIconError] = useState(!site.icon);
  const [imageLoaded, setImageLoaded] = useState(false);

  // 使用dnd-kit的useSortable hook
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `site-${site.id || index}`,
    disabled: !isEditMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 9999 : 'auto',
    opacity: isDragging ? 0.8 : 1,
    position: 'relative' as const,
  };

  // 如果没有图标，使用首字母作为图标
  const fallbackIcon = site.name.charAt(0).toUpperCase();

  // 处理设置按钮点击
  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止卡片点击事件
    e.preventDefault(); // 防止默认行为
    setShowSettings(true);
  };

  // 处理关闭设置
  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  // 处理卡片点击
  const handleCardClick = () => {
    if (!isEditMode && site.url) {
      window.location.href = site.url; //卡片原页跳转
    }
  };

  // 处理图标加载错误
  const handleIconError = () => {
    setIconError(true);
  };

  // 处理图片加载完成
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // 卡片内容
  const cardContent = (
    <Box
      sx={{
        height: 48, // 恢复为 48px
        width: 140, // 恢复为 140px
        position: 'relative',
        transition: 'transform 0.3s ease-in-out',
        ...(!isEditMode && {
          '&:hover': {
            transform: 'translateY(-2px)', 
          },
        }),
      }}
    >
      <Card
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2, 
          transition: 'box-shadow 0.3s ease-in-out',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: isDragging ? 8 : 1,
          '&:hover': !isEditMode ? { boxShadow: 3 } : {},
          overflow: 'hidden',
