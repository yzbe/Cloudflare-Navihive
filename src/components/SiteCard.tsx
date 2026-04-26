// src/components/SiteCard.tsx
import { useState, memo } from 'react';
import { Site } from '../API/http';
import SiteSettingsModal from './SiteSettingsModal';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Card,
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
    e.stopPropagation(); 
    e.preventDefault(); // 防止点击设置按钮时触发链接跳转
    setShowSettings(true);
  };

  // 处理关闭设置
  const handleCloseSettings = () => {
    setShowSettings(false);
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
        height: '48px !important',
        width: '140px !important',
        position: 'relative',
        transition: 'transform 0.3s ease-in-out',
        ...(!isEditMode && {
          '&:hover': {
           //transform: 'translateY(-2px)', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            backgroundColor: (theme) => 
              theme.palette.mode === 'dark' ? 'rgba(45, 45, 45, 1)' : 'rgba(245, 245, 245, 1)',
          },
        }),
      }}
    >
      <Card
        sx={{
          height: '100%',
          width: '100%',
          display: 'block', // 放弃 flex，避免干扰
          borderRadius: 2, 
          transition: 'box-shadow 0.3s ease-in-out',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: isDragging ? 8 : 1,
          '&:hover': !isEditMode ? { boxShadow: 3 } : {},
          overflow: 'hidden',
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(33, 33, 33, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(5px)',
        }}
      >
        {isEditMode ? (
          // ---------------------------------
          // 编辑（拖拽）模式下的卡片样式
          // ---------------------------------
          <div
            style={{
              height: '100%',
              width: '100%',
              padding: '0 12px', 
              boxSizing: 'border-box',
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center', 
            }}
          >
            {/* 拖拽指示图标 */}
            <DragIndicatorIcon sx={{ fontSize: 18, color: 'text.secondary', marginRight: '4px' }} />

            {/* 图标区域 */}
            {!iconError && site.icon ? (
              <div style={{ position: 'relative', marginRight: '8px', width: 24, height: 24, flexShrink: 0 }}> 
                <Skeleton variant="rounded" width={24} height={24} sx={{ display: !imageLoaded ? 'block' : 'none', position: 'absolute' }} />
                <Fade in={imageLoaded} timeout={500}>
                  <Box component="img" src={site.icon} alt={site.name} sx={{ width: 24, height: 24, borderRadius: '4px', objectFit: 'cover' }} onError={handleIconError} onLoad={handleImageLoad} />
                </Fade>
              </div>
            ) : (
              <Box
                sx={{ width: 24, minWidth: 24, height: 24, marginRight: '8px', borderRadius: '4px', bgcolor: 'primary.light', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', border: '1px solid', borderColor: 'primary.main', opacity: 0.8, flexShrink: 0 }}
              >
                {fallbackIcon}
              </Box>
            )}

            {/* 标题文字 */}
            <div style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="subtitle1"
                fontWeight="medium"
                style={{ fontSize: '14px', lineHeight: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }} 
              >
                {site.name}
              </Typography>
            </div>
          </div>
        ) : (
          // ---------------------------------
          // 正常模式（访客浏览）下的卡片样式
          // ---------------------------------
          <CardActionArea 
            component="a"             // 【神级修改】：强制变身为 HTML <a> 标签
            href={site.url || '#'}    // 【神级修改】：赋予原生超链接属性
            rel="noopener noreferrer" // 安全属性
            sx={{ 
              height: '100%', 
              width: '100%',
              margin: '0 !important',
              padding: '0 !important',
              display: 'block !important', 
              textDecoration: 'none', // 确保链接没有下划线
              color: 'inherit',       // 继承原本的字体颜色
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center', 
                padding: '0 12px', 
                boxSizing: 'border-box',
              }}
            >
              {/* 图标区域 */}
              {!iconError && site.icon ? (
                <div style={{ position: 'relative', marginRight: '8px', width: 24, height: 24, flexShrink: 0 }}> 
                  <Skeleton variant="rounded" width={24} height={24} sx={{ display: !imageLoaded ? 'block' : 'none', position: 'absolute' }} />
                  <Fade in={imageLoaded} timeout={500}>
                    <Box component="img" src={site.icon} alt={site.name} sx={{ width: 24, height: 24, borderRadius: '4px', objectFit: 'cover' }} onError={handleIconError} onLoad={handleImageLoad} />
                  </Fade>
                </div>
              ) : (
                <Box
                  sx={{ width: 24, minWidth: 24, height: 24, marginRight: '8px', borderRadius: '4px', bgcolor: 'primary.light', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', border: '1px solid', borderColor: 'primary.main', opacity: 0.8, flexShrink: 0 }}
                >
                  {fallbackIcon}
                </Box>
              )}

              {/* 标题文字 */}
              <div style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', alignItems: 'center' }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="medium"
                  style={{ fontSize: '14px', lineHeight: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}
                >
                  {site.name}
                </Typography>
              </div>
            </div>

            {/* 设置按钮 */}
            {viewMode === 'edit' && (
              <IconButton
                size="small"
                sx={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', bgcolor: 'action.hover', opacity: 0, transition: 'opacity 0.2s', '&:hover': { bgcolor: 'action.selected' }, '.MuiCardActionArea-root:hover &': { opacity: 1 } }}
                onClick={handleSettingsClick}
                aria-label="网站设置"
              >
                <SettingsIcon sx={{ fontSize: 18 }} /> 
              </IconButton>
            )}
          </CardActionArea>
        )}
      </Card>
    </Box>
  );

  if (isEditMode) {
    return (
      <>
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
          {cardContent}
        </div>

        {showSettings && (
          <SiteSettingsModal site={site} onUpdate={onUpdate} onDelete={onDelete} onClose={handleCloseSettings} iconApi={iconApi} />
        )}
      </>
    );
  }

  return (
    <>
      {cardContent}

      {showSettings && (
        <SiteSettingsModal site={site} onUpdate={onUpdate} onDelete={onDelete} onClose={handleCloseSettings} iconApi={iconApi} />
      )}
    </>
  );
});

export default SiteCard;
