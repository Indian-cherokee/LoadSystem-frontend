import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Container, Form, Row, Col, Badge, Spinner, Card, Button, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserLoadSessions, resolveLoadSession } from '../store/slices/loadSessionSlice';
import type { AppDispatch, RootState } from '../store';
import { api } from '../api';

const getStatusBadge = (status: number | undefined) => {
  switch (status) {
    case 1: return <Badge bg="secondary">Черновик</Badge>;
    case 2: return <Badge bg="dark">Удалена</Badge>;
    case 3: return <Badge bg="primary">В работе</Badge>;
    case 4: return <Badge bg="success">Завершена</Badge>;
    case 5: return <Badge bg="danger">Отклонена</Badge>;
    default: return <Badge bg="light" text="dark">Неизвестно</Badge>;
  }
};

export const OrdersListPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading } = useSelector((state: RootState) => state.loadSession);
  const { user } = useSelector((state: RootState) => state.user);
  const isModerator = user?.moderator || false;
  const [sessions, setSessions] = useState<any[]>([]);
  const [allSessions, setAllSessions] = useState<any[]>([]); // Все заявки для фильтрации по создателю
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);
  const [creatorsMap, setCreatorsMap] = useState<{ [key: number]: string }>({}); // Маппинг creator_id -> username

  const [filters, setFilters] = useState({
    status: 'all',
    from: '',
    to: '',
    creatorId: 'all' // Фильтр по создателю (только для модератора)
  });

  // Функция для загрузки информации о пользователях
  const fetchCreatorsInfo = useCallback(async (creatorIds: number[]) => {
    if (!isModerator || creatorIds.length === 0) return;

    const newCreatorsMap: { [key: number]: string } = { ...creatorsMap };
    const idsToFetch = creatorIds.filter(id => !newCreatorsMap[id]);

    if (idsToFetch.length === 0) return;

    // Загружаем информацию о пользователях параллельно
    const promises = idsToFetch.map(async (id) => {
      try {
        const response = await api.users.usersDetail(id);
        return { id, username: response.data.username || `Пользователь #${id}` };
      } catch (error) {
        console.warn(`Failed to fetch user ${id}:`, error);
        return { id, username: `Пользователь #${id}` };
      }
    });

    const results = await Promise.all(promises);
    results.forEach(({ id, username }) => {
      newCreatorsMap[id] = username;
    });

    setCreatorsMap(newCreatorsMap);
  }, [isModerator, creatorsMap]);

  // Функция для загрузки заявок
  const fetchSessions = useCallback(async () => {
    const params: { status?: string; from?: string; to?: string } = {};
    if (filters.status !== 'all') {
      const statusMap: { [key: string]: string } = {
        '1': 'draft',
        '3': 'formed',
        '4': 'completed',
        '5': 'rejected',
      };
      params.status = statusMap[filters.status] || filters.status;
    }
    if (filters.from) {
      const fromDate = new Date(filters.from + 'T00:00:00');
      params.from = fromDate.toISOString().split('T')[0];
    }
    if (filters.to) {
      if (filters.from === filters.to) {
        const toDate = new Date(filters.to + 'T23:59:59');
        const toDateUTCStr = toDate.toISOString();
        const toDateUTC = new Date(toDateUTCStr);
        toDateUTC.setUTCDate(toDateUTC.getUTCDate() + 1);
        params.to = toDateUTC.toISOString().split('T')[0];
      } else {
        const toDate = new Date(filters.to + 'T23:59:59');
        const toDateUTCStr = toDate.toISOString();
        const toDateUTC = new Date(toDateUTCStr);
        toDateUTC.setUTCDate(toDateUTC.getUTCDate() + 1);
        params.to = toDateUTC.toISOString().split('T')[0];
      }
    }

    try {
      const data = await dispatch(fetchUserLoadSessions(params)).unwrap();
      const items = Array.isArray(data.items) ? data.items : (data.items ? [data.items] : []);
      setAllSessions(items);
      
      // Загружаем информацию о создателях (только для модератора)
      if (isModerator) {
        const uniqueCreatorIds = Array.from(new Set(items.map((s: any) => s.creator_id).filter(Boolean))) as number[];
        if (uniqueCreatorIds.length > 0) {
          fetchCreatorsInfo(uniqueCreatorIds);
        }
      }
      
      // Применяем фильтр по создателю на фронтенде (только для модератора)
      if (isModerator && filters.creatorId !== 'all') {
        const filtered = items.filter((session: any) => 
          session.creator_id && session.creator_id.toString() === filters.creatorId
        );
        setSessions(filtered);
      } else {
        setSessions(items);
      }
      setError(null);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setSessions([]);
      setAllSessions([]);
      setError('Ошибка при загрузке заявок');
    }
  }, [dispatch, filters.status, filters.from, filters.to, filters.creatorId, isModerator, fetchCreatorsInfo]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Short polling для модератора (обновление каждые 3 секунды)
  useEffect(() => {
    if (isModerator) {
      pollingIntervalRef.current = setInterval(() => {
        fetchSessions();
      }, 3000); // 3 секунды

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [isModerator, fetchSessions]);

  // Применяем фильтр по создателю при изменении
  useEffect(() => {
    if (isModerator && filters.creatorId !== 'all') {
      const filtered = allSessions.filter((session: any) => 
        session.creator_id && session.creator_id.toString() === filters.creatorId
      );
      setSessions(filtered);
    } else {
      setSessions(allSessions);
    }
  }, [filters.creatorId, allSessions, isModerator]);

  const handleRowClick = (id: number | undefined) => {
    if (id) navigate(`/load_sessions/${id}`);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleTodayClick = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    setFilters({ ...filters, from: today, to: today });
  };

  const handleResolve = async (sessionId: number, action: 'complete' | 'reject', e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем переход на страницу заявки
    try {
      await dispatch(resolveLoadSession({ sessionId, action })).unwrap();
      // Обновляем список заявок после изменения статуса
      await fetchSessions();
    } catch (error: any) {
      setError(error || 'Ошибка при изменении статуса заявки');
    }
  };

  // Получаем уникальных создателей для фильтра (только для модератора)
  const uniqueCreators = isModerator 
    ? Array.from(new Set(allSessions.map((s: any) => s.creator_id).filter(Boolean)))
        .map((id: any) => {
          return { 
            id, 
            username: creatorsMap[id] || `Пользователь #${id}` 
          };
        })
        .sort((a, b) => a.username.localeCompare(b.username)) // Сортируем по логину
    : [];

  return (
    <Container className="pt-5 mt-5">
      <h2 className="fw-bold mb-4 text-center" style={{ color: '#495057' }}>
        {isModerator ? 'Управление заявками' : 'История заявок'}
      </h2>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card className="mb-4 border-0 shadow-sm bg-light">
        <Card.Body>
          <Row className="g-3">
            <Col md={isModerator ? 3 : 4}>
              <Form.Label>Статус</Form.Label>
              <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="all">Любой статус</option>
                <option value="1">Черновик</option>
                <option value="3">В работе (Сформирована)</option>
                <option value="4">Завершена</option>
                <option value="5">Отклонена</option>
              </Form.Select>
            </Col>
            {isModerator && (
              <Col md={3}>
                <Form.Label>Создатель</Form.Label>
                <Form.Select name="creatorId" value={filters.creatorId} onChange={handleFilterChange}>
                  <option value="all">Все создатели</option>
                  {uniqueCreators.map((creator) => (
                    <option key={creator.id} value={creator.id.toString()}>
                      {creator.username}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            )}
            <Col md={isModerator ? 2 : 3}>
              <Form.Label>Дата оформления (от)</Form.Label>
              <Form.Control type="date" name="from" value={filters.from} onChange={handleFilterChange} />
            </Col>
            <Col md={isModerator ? 2 : 3}>
              <Form.Label>Дата оформления (до)</Form.Label>
              <Form.Control type="date" name="to" value={filters.to} onChange={handleFilterChange} />
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button variant="outline-primary" onClick={handleTodayClick} className="w-100">
                Сегодня
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center"><Spinner animation="border" variant="warning" /></div>
      ) : sessions.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className="border-0 shadow-sm"
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
              onClick={() => handleRowClick(session.id)}
            >
              <Card.Body className="py-3">
                <Row className="align-items-center g-3" style={{ display: 'flex', flexWrap: 'wrap' }}>
                  <Col xs={12} sm="auto" className="text-center" style={{ minWidth: '60px', flexShrink: 0 }}>
                    <div className="fw-bold" style={{ fontSize: '1.2rem' }}>#{session.id}</div>
                  </Col>
                  <Col xs={12} sm="auto" style={{ minWidth: '100px', flexShrink: 0 }}>
                    {getStatusBadge(session.status)}
                  </Col>
                  {isModerator && (
                    <Col xs={6} sm style={{ flex: '1 1 0%', minWidth: '100px' }}>
                      <small className="text-muted d-block">Создатель</small>
                      <div className="small">
                        {session.creator_id 
                          ? (creatorsMap[session.creator_id] || `Пользователь #${session.creator_id}`)
                          : <span className="text-muted">--</span>}
                      </div>
                    </Col>
                  )}
                  <Col xs={6} sm style={{ flex: '1 1 0%', minWidth: '100px' }}>
                    <small className="text-muted d-block">Дата создания</small>
                    <div className="small">
                      {session.creation_date
                        ? new Date(session.creation_date).toLocaleDateString('ru-RU')
                        : <span className="text-muted">--</span>}
                    </div>
                  </Col>
                  <Col xs={6} sm style={{ flex: '1 1 0%', minWidth: '100px' }}>
                    <small className="text-muted d-block">Дата оформления</small>
                    <div className="small">
                      {session.forming_date
                        ? new Date(session.forming_date).toLocaleDateString('ru-RU')
                        : <span className="text-muted">--</span>}
                    </div>
                  </Col>
                  <Col xs={6} sm style={{ flex: '1 1 0%', minWidth: '100px' }}>
                    <small className="text-muted d-block">Дата завершения</small>
                    <div className="small">
                      {session.completion_date
                        ? new Date(session.completion_date).toLocaleDateString('ru-RU')
                        : <span className="text-muted">--</span>}
                    </div>
                  </Col>
                  <Col xs={6} sm style={{ flex: '1 1 0%', minWidth: '100px' }}>
                    <small className="text-muted d-block">Тип помещения</small>
                    <div className="small fw-semibold">
                      {session.room_type
                        ? session.room_type
                        : <span className="text-muted">--</span>}
                    </div>
                  </Col>
                  <Col xs={12} sm style={{ flex: '1 1 0%', minWidth: '100px' }} className="text-end">
                    <small className="text-muted d-block">Итоговая нагрузка</small>
                    <div className="fw-bold" style={{ fontSize: '1.1rem', color: '#495057' }}>
                      {session.total_load !== undefined && session.total_load !== null
                        ? session.total_load.toFixed(2)
                        : <span className="text-muted">--</span>}
                    </div>
                  </Col>
                  {isModerator && session.status === 3 && (
                    <Col xs={12} sm="auto" className="d-flex gap-2 justify-content-end" style={{ minWidth: '180px', flexShrink: 0 }}>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={(e) => handleResolve(session.id, 'complete', e)}
                      >
                        Завершить
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => handleResolve(session.id, 'reject', e)}
                      >
                        Отклонить
                      </Button>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <p className="text-muted mb-0">Заявок не найдено</p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

