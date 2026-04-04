// src/components/SiteCard.tsx
import { useState, memo } from 'react';
import { Site } from '../API/http';
import SiteSettingsModal from './SiteSettingsModal';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(33, 33, 33, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(5px)',
        }}
      >
        {isEditMode ? (
          // ---------------------------------
          // 编辑（拖拽）模式下的卡片样式
          // ---------------------------------
          <Box
            sx={{
              height: '100%',
              width: '100%',
              padding: '0 12px !important', // 恢复为 12px 左右留白
              boxSizing: 'border-box',
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center', 
              justifyContent: 'flex-start', // 强制靠左对齐
            }}
          >
            {/* 拖拽指示图标 */}
            <Box mr="4px" display="flex" alignItems="center">
              <DragIndicatorIcon color="action" sx={{ fontSize: 18 }} />
            </Box>

            {/* 图标区域 */}
            {!iconError && site.icon ? (
              <Box position="relative" mr="8px" width={24} height={24} flexShrink={0}> 
                <Skeleton
                  variant="rounded"
                  width={24}
                  height={24}
                  sx={{ display: !imageLoaded ? 'block' : 'none', position: 'absolute' }}
                />
                <Fade in={imageLoaded} timeout={500}>
                  <Box
                    component="img"
                    src={site.icon}
                    alt={site.name}
                    sx={{ width: 24, height: 24, borderRadius: '4px', objectFit: 'cover' }}
                    onError={handleIconError}
                    onLoad={handleImageLoad}
                  />
                </Fade>
              </Box>
            ) : (
              <Box
                sx={{
                  width: 24, 
                  height: 24,
                  mr: '8px', // 强制固定像素间距
                  borderRadius: '4px',
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px', // 恢复字母大小
                  border: 1,
                  borderColor: 'primary.main',
                  opacity: 0.8,
                  flexShrink: 0,
                }}
              >
                {fallbackIcon}
              </Box>
            )}

            {/* 标题文字 */}
            <Typography
              variant="subtitle1"
              fontWeight="medium"
              noWrap
              sx={{ 
                fontSize: '14px', // 恢复 14px
                lineHeight: 1,
                textAlign: 'left', // 强制文字靠左
                flexGrow: 1,       // 填满剩余空间，避免过度截断
              }} 
            >
              {site.name}
            </Typography>
          </Box>
        ) : (
          // ---------------------------------
          // 正常模式（访客浏览）下的卡片样式
          // ---------------------------------
          <CardActionArea 
            onClick={handleCardClick} 
            sx={{ 
              height: '100%', 
              width: '100%',
              display: 'flex', 
              justifyContent: 'flex-start' // 击杀 CardActionArea 的默认居中
            }}
          >
            <CardContent
              sx={{
                width: '100%',
                position: 'relative',
                height: '100%',
                display: 'flex',
                alignItems: 'center', 
                justifyContent: 'flex-start', // 强制内容从左开始
                padding: '0 12px !important',  // 恢复 12px
                boxSizing: 'border-box',
                '&:last-child': { paddingBottom: '0 !important' }, 
              }}
            >
              {/* 图标区域 */}
              {!iconError && site.icon ? (
                <Box position="relative" mr="8px" width={24} height={24} flexShrink={0}> 
                  <Skeleton
                    variant="rounded"
                    width={24}
                    height={24}
                    sx={{ display: !imageLoaded ? 'block' : 'none', position: 'absolute' }}
                  />
                  <Fade in={imageLoaded} timeout={500}>
                    <Box
                      component="img"
                      src={site.icon}
                      alt={site.name}
                      sx={{ width: 24, height: 24, borderRadius: '4px', objectFit: 'cover' }}
                      onError={handleIconError}
                      onLoad={handleImageLoad}
                    />
                  </Fade>
                </Box>
              ) : (
                <Box
                  sx={{
                    width: 24, 
                    height: 24,
                    mr: '8px', 
                    borderRadius: '4px',
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    border: 1,
                    borderColor: 'primary.main',
                    opacity: 0.8,
                    flexShrink: 0,
                  }}
                >
                  {fallbackIcon}
                </Box>
              )}

              {/* 标题文字 */}
              <Typography
                variant="subtitle1"
                fontWeight="medium"
                noWrap
                sx={{
                  fontSize: '14px', 
                  lineHeight: 1,
                  textAlign: 'left', 
                  flexGrow: 1,       
                }}
              >
                {site.name}
              </Typography>

              {/* 设置按钮 */}
              {viewMode === 'edit' && (
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    right: '4px', 
                    bgcolor: 'action.hover',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    '&:hover': { bgcolor: 'action.selected' },
                    '.MuiCardActionArea-root:hover &': { opacity: 1 },
                  }}
                  onClick={handleSettingsClick}
                  aria-label="网站设置"
                >
                  <SettingsIcon sx={{ fontSize: 18 }} /> 
                </IconButton>
              )}
            </CardContent>
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
          <SiteSettingsModal
            site={site}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onClose={handleCloseSettings}
            iconApi={iconApi} 
          />
        )}
      </>
    );
  }

  return (
    <>
      {cardContent}

      {showSettings && (
        <SiteSettingsModal
          site={site}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onClose={handleCloseSettings}
          iconApi={iconApi} 
        />
      )}
    </>
  );
});

export default SiteCard;
