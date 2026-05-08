import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  Pagination,
  Stack,
  Tooltip
} from '@mui/material';
import {
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  UserPlus,
  Filter
} from 'lucide-react';
import { User } from '../../interfaces/user.types';

const MOCK_USERS: User[] = [
  {
    id: '1',
    fullName: 'Nguyễn Văn A',
    username: 'antv',
    email: 'antv@example.com',
    role: 'Quản trị viên',
    department: 'Ban Giám đốc',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=1'
  },
  {
    id: '2',
    fullName: 'Trần Thị B',
    username: 'bttran',
    email: 'bttran@example.com',
    role: 'Trưởng phòng',
    department: 'Phòng Hành chính',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=2'
  },
  {
    id: '3',
    fullName: 'Lê Văn C',
    username: 'clevan',
    email: 'clevan@example.com',
    role: 'Nhân viên',
    department: 'Phòng Kỹ thuật',
    status: 'inactive',
    avatar: 'https://i.pravatar.cc/150?u=3'
  },
  {
    id: '4',
    fullName: 'Phạm Thị D',
    username: 'dpham',
    email: 'dpham@example.com',
    role: 'Nhân viên',
    department: 'Phòng Kế toán',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=4'
  },
  {
    id: '5',
    fullName: 'Hoàng Văn E',
    username: 'ehoang',
    email: 'ehoang@example.com',
    role: 'Nhân viên',
    department: 'Phòng Nhân sự',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=5'
  }
];

const UserPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const filteredUsers = MOCK_USERS.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }} 
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
            Quản lý người dùng
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
            Bạn có tổng cộng {MOCK_USERS.length} nhân viên trong hệ thống
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<UserPlus size={20} />}
          sx={{
            alignSelf: { xs: 'flex-end', sm: 'auto' },
            borderRadius: '12px',
            textTransform: 'none',
            px: 3,
            py: 1.2,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0, 61, 155, 0.15)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(0, 61, 155, 0.25)',
            }
          }}
        >
          Thêm người dùng
        </Button>
      </Stack>

      <Paper 
        sx={{ 
          borderRadius: '16px', 
          overflow: 'hidden', 
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)' 
        }}
      >
        <Box sx={{ p: 2.5, bgcolor: 'background.paper' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              placeholder="Tìm kiếm theo tên, email, tài khoản..."
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} style={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: '10px',
                  bgcolor: 'rgba(0,0,0,0.01)',
                  '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' }
                }
              }}
            />
            <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', md: 'auto' } }}>
              <Button
                variant="outlined"
                startIcon={<Filter size={18} />}
                sx={{ 
                  borderRadius: '10px', 
                  textTransform: 'none', 
                  minWidth: '110px',
                  borderColor: 'divider',
                  color: 'text.primary',
                  fontWeight: 500
                }}
              >
                Bộ lọc
              </Button>
            </Stack>
          </Stack>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.01)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.85rem', textTransform: 'uppercase', py: 2 }}>Người dùng</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.85rem', textTransform: 'uppercase' }}>Tài khoản</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.85rem', textTransform: 'uppercase' }}>Vai trò</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.85rem', textTransform: 'uppercase' }}>Phòng ban</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.85rem', textTransform: 'uppercase' }}>Trạng thái</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.85rem', textTransform: 'uppercase' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar 
                          src={user.avatar} 
                          sx={{ 
                            width: 38, 
                            height: 38,
                            border: '2px solid #fff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }} 
                        />
                        <Box>
                          <Typography variant="subtitle2" fontWeight="700" sx={{ lineHeight: 1.2 }}>
                            {user.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                        @{user.username}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        sx={{
                          bgcolor: user.role === 'Quản trị viên' ? 'primary.soft' : 'action.hover',
                          color: user.role === 'Quản trị viên' ? 'primary.main' : 'text.primary',
                          fontWeight: 600,
                          borderRadius: '6px',
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">{user.department}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box 
                          sx={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            bgcolor: user.status === 'active' ? 'success.main' : 'error.main' 
                          }} 
                        />
                        <Typography variant="body2" fontWeight="500">
                          {user.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Chỉnh sửa">
                        <IconButton size="small" sx={{ color: 'action.active', '&:hover': { color: 'primary.main', bgcolor: 'primary.soft' } }}>
                          <Edit2 size={16} />
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenMenu(e)}
                        sx={{ ml: 0.5 }}
                      >
                        <MoreVertical size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">Không tìm thấy người dùng nào</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Hiển thị {filteredUsers.length} trên {MOCK_USERS.length} người dùng
          </Typography>
          <Pagination 
            count={1} 
            shape="rounded" 
            size="small"
            color="primary" 
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: '8px',
                fontWeight: 600
              }
            }}
          />
        </Box>
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            mt: 1,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: '12px',
            minWidth: '150px'
          }
        }}
      >
        <MenuItem onClick={handleCloseMenu} sx={{ py: 1, px: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Edit2 size={16} />
            <Typography variant="body2" fontWeight="500">Chỉnh sửa</Typography>
          </Stack>
        </MenuItem>
        <MenuItem onClick={handleCloseMenu} sx={{ py: 1, px: 2, color: 'error.main' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Trash2 size={16} />
            <Typography variant="body2" fontWeight="500">Xóa người dùng</Typography>
          </Stack>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserPage;
