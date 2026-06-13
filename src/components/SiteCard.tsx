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
  Tooltip, // 【关键新增】：引入 Tooltip 组件
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
        transition: 'all 0.2s ease-in-out', // 缩短过渡时间，提升丝滑度
        ...(!isEditMode && {
          '&:hover': {
            // ❌ 抹除高分屏导致模糊的物理位移：transform: 'translateY(-2px)'
            // ✅ 改用优雅的阴影扩散与微变色，达到相同的浮起暗示且绝对不发虚
            boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
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
          // 💡 强力保险：强制子卡片在任何硬件下保持最高矢量抗锯齿清晰度
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
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

            {/* 标题文字（编辑模式下也同样加入气泡） */}
            <div style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', alignItems: 'center' }}>
              <Tooltip title={site.name} arrow disableInteractive enterDelay={500}>
                <Typography
                  variant="subtitle1"
                  fontWeight="medium"
                  style={{ fontSize: '14px', lineHeight: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }} 
                >
                  {site.name}
                </Typography>
              </Tooltip>
            </div>
          </div>
        ) : (
          // ---------------------------------
          // 正常模式（访客浏览）下的卡片样式
          // ---------------------------------
          <CardActionArea 
            component="a"             
            href={site.url || '#'}    
            rel="noopener noreferrer" 
            sx={{ 
              height: '100%', 
              width: '100%',
              margin: '0 !important',
              padding: '0 !important',
              display: 'block !important', 
              textDecoration: 'none', 
              color: 'inherit',       
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
                {/* 【核心修改】：用 Tooltip 包裹长标题 */}
                <Tooltip 
                  title={site.name} 
                  arrow 
                  disableInteractive // 鼠标无法点击到气泡内部，防止干扰正常的超链接跳转
                  enterDelay={300}    // 停留300毫秒再显示，防止鼠标滑过时气泡满天飞
                  leaveDelay={100}
                  placement="bottom"  // 气泡固定显示在卡片的下方
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight="medium"
                    style={{ fontSize: '14px', lineHeight: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}
                  >
                    {site.name}
                  </Typography>
                </Tooltip>
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
